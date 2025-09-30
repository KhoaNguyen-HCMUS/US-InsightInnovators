import os
import requests
from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class DiagnoseProcessor:
    def __init__(self):
        # ES config
        self.es_url = "http://localhost:9200/knowledge/_search"
        
        # Gemini config
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY/GOOGLE_API_KEY in environment")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("models/gemini-2.0-flash-exp")
        
        # Prompts
        self.translate_prompt = """Bạn là chuyên gia y khoa song ngữ. 
Nhiệm vụ: dịch câu hỏi y khoa tiếng Việt dưới đây sang tiếng Anh NGẮN GỌN, đúng thuật ngữ.
CHỈ trả ra câu tiếng Anh, không thêm gì khác.
Câu hỏi: """

        self.answer_prompt = """Bạn là trợ lý y khoa chuyên nghiệp. Từ các trích đoạn tiếng Anh dưới đây, hãy trả lời bằng tiếng Việt:
- CHÍNH XÁC và DỰA TRÊN BẰNG CHỨNG KHOA HỌC
- NGẮN GỌN, MẠCH LẠC (2-3 đoạn)
- CÓ CẢNH BÁO về giới hạn thông tin

Format:
1. Trả lời trực tiếp (dạng bullet nếu liệt kê triệu chứng)
2. "**Lưu ý:** Thông tin này chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ."
3. "Nguồn (trích sách):" + 1-2 câu tiêu biểu (giữ nguyên tiếng Anh)

Câu hỏi: {question}
Dữ liệu trích:"""

    async def process_question(self, question_vi: str, topk: int = 8) -> Dict[str, Any]:
        """Process medical question and return diagnosis"""
        
        # 1. Translate Vietnamese to English
        query_en = self._translate_to_english(question_vi)
        
        # 2. Search Elasticsearch
        snippets, raw_hits = self._search_elasticsearch(query_en, topk)
        
        # 3. Generate Vietnamese answer
        answer_vi = self._generate_answer(question_vi, snippets)
        
        return {
            "question_vi": question_vi,
            "query_en": query_en,
            "topk": topk,
            "answer_vi": answer_vi,
            "snippets": snippets[:3]  # Return top 3 for display
        }

    def _translate_to_english(self, question_vi: str) -> str:
        """Translate Vietnamese question to English"""
        try:
            response = self.model.generate_content(self.translate_prompt + question_vi)
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Translation failed: {str(e)}")

    def _search_elasticsearch(self, query_en: str, topk: int):
        """Search medical knowledge in Elasticsearch"""
        try:
            payload = {
                "query": {"match": {"body": query_en}},
                "size": topk
            }
            
            response = requests.post(self.es_url, json=payload, timeout=30)
            response.raise_for_status()
            
            hits = response.json().get("hits", {}).get("hits", [])
            snippets = [hit["_source"]["body"] for hit in hits]
            
            return snippets, hits
        except Exception as e:
            raise Exception(f"Elasticsearch search failed: {str(e)}")

    def _generate_answer(self, question_vi: str, snippets: list[str]) -> str:
        """Generate Vietnamese answer from English snippets"""
        try:
            joined_snippets = "\n- " + "\n- ".join(snippets)
            prompt = self.answer_prompt.format(question=question_vi) + joined_snippets
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Answer generation failed: {str(e)}")