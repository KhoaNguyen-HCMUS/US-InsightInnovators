import os
import requests
from typing import Dict, Any, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ChatProcessor:
    def __init__(self):
        # ES config
        self.es_url = "http://localhost:9200/knowledge/_search"
        
        # Gemini config
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY/GOOGLE_API_KEY in environment")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("models/gemini-2.0-flash-exp")
        
        # System prompt for medical chatbot
        self.system_prompt = """Bạn là trợ lý y khoa AI chuyên nghiệp với các nguyên tắc sau:

🔍 **PHÂN TÍCH TRIỆU CHỨNG:**
- Đặt câu hỏi chi tiết để hiểu rõ triệu chứng
- Hỏi về thời gian xuất hiện, mức độ nghiêm trọng, yếu tố kích thích
- Thu thập thông tin về tiền sử bệnh, thuốc đang dùng

💡 **TƯ VẤN Y KHOA:**
- Đưa ra giải thích dễ hiểu về các tình trạng có thể xảy ra
- Đề xuất các biện pháp chăm sóc ban đầu an toàn
- Phân loại mức độ cấp thiết: tự chăm sóc / khám bác sĩ / cấp cứu

⚠️ **AN TOÀN & GIỚI HẠN:**
- LUÔN nhấn mạnh: "Thông tin chỉ mang tính tham khảo, không thay thế bác sĩ"
- Khuyến nghị gặp bác sĩ nếu triệu chứng nghiêm trọng hoặc kéo dài
- KHÔNG chẩn đoán chính thức hay kê toa thuốc

📝 **PHONG CÁCH GIAO TIẾP:**
- Thân thiện, dễ hiểu, không gây lo lắng
- Sử dụng bullet points cho thông tin rõ ràng
- Hỏi thêm thông tin khi cần thiết

Hãy phân tích cuộc hội thoại và đưa ra phản hồi phù hợp."""

    async def process_chat_message(self, user_message: str, chat_history: List[str], session_id: str) -> Dict[str, Any]:
        """Process chat message with context from previous messages"""
        
        # Build conversation context
        conversation_context = self._build_conversation_context(chat_history, user_message)
        
        # Extract symptoms/keywords for medical search
        symptoms_keywords = await self._extract_medical_keywords(user_message, chat_history)
        
        # Search medical knowledge if symptoms detected
        medical_context = ""
        snippets = []
        if symptoms_keywords:
            try:
                snippets, _ = self._search_elasticsearch(symptoms_keywords, topk=5)
                medical_context = "\n".join(snippets[:3])
            except Exception as e:
                print(f"ES search failed: {e}")
        
        # Generate contextual response
        ai_response = await self._generate_chat_response(
            conversation_context, 
            user_message, 
            medical_context
        )
        
        # Analyze conversation for diagnosis context
        diagnosis_context = await self._analyze_conversation_context(chat_history + [f"user: {user_message}"])
        
        return {
            "response": ai_response,
            "diagnosis_context": diagnosis_context,
            "medical_snippets": snippets[:2],
            "symptoms_detected": symptoms_keywords
        }

    def _build_conversation_context(self, chat_history: List[str], current_message: str) -> str:
        """Build conversation context from chat history"""
        if not chat_history:
            return f"Người dùng: {current_message}"
        
        # Take last 10 messages for context
        recent_history = chat_history[-10:] if len(chat_history) > 10 else chat_history
        
        context = "LỊCH SỬ HỘI THOẠI:\n"
        for message in recent_history:
            if message.startswith("user:"):
                context += f"Người dùng: {message[5:].strip()}\n"
            elif message.startswith("assistant:"):
                context += f"AI: {message[10:].strip()}\n"
        
        context += f"\nTIN NHẮN HIỆN TẠI:\nNgười dùng: {current_message}"
        return context

    async def _extract_medical_keywords(self, message: str, chat_history: List[str]) -> str:
        """Extract medical keywords for ES search"""
        try:
            # Use recent conversation for context
            recent_messages = chat_history[-5:] if len(chat_history) > 5 else chat_history
            context_text = " ".join(recent_messages) + " " + message
            
            prompt = f"""Từ cuộc hội thoại y khoa này, trích xuất các từ khóa triệu chứng/bệnh lý bằng tiếng Anh để tìm kiếm thông tin y khoa.
CHỈ trả về từ khóa tiếng Anh, cách nhau bằng dấu cách, KHÔNG giải thích gì thêm.
Ví dụ: "headache fever nausea" hoặc "hypertension chest pain"

Hội thoại: {context_text}

Từ khóa:"""

            response = self.model.generate_content(prompt)
            keywords = response.text.strip()
            
            # Filter out non-medical terms
            if len(keywords.split()) <= 10 and any(word in keywords.lower() for word in ['pain', 'fever', 'headache', 'symptom', 'disease', 'treatment']):
                return keywords
            return ""
            
        except Exception as e:
            print(f"Keyword extraction failed: {e}")
            return ""

    def _search_elasticsearch(self, query: str, topk: int = 5):
        """Search medical knowledge in Elasticsearch"""
        try:
            payload = {
                "query": {
                    "bool": {
                        "should": [
                            {"match": {"body": {"query": query, "boost": 2}}},
                            {"match_phrase": {"body": query}},
                            {"fuzzy": {"body": query}}
                        ]
                    }
                },
                "size": topk
            }
            
            response = requests.post(self.es_url, json=payload, timeout=10)
            response.raise_for_status()
            
            hits = response.json().get("hits", {}).get("hits", [])
            snippets = [hit["_source"]["body"] for hit in hits]
            
            return snippets, hits
        except Exception as e:
            print(f"Elasticsearch search failed: {e}")
            return [], []

    async def _generate_chat_response(self, conversation_context: str, current_message: str, medical_context: str) -> str:
        """Generate AI response with conversation context"""
        try:
            prompt = f"""{self.system_prompt}

{conversation_context}

"""
            if medical_context:
                prompt += f"""
THÔNG TIN Y KHOA LIÊN QUAN:
{medical_context}

"""
            prompt += """
Hãy phân tích cuộc hội thoại và trả lời tin nhắn mới nhất của người dùng. 
Sử dụng thông tin từ lịch sử hội thoại để đưa ra câu trả lời phù hợp và có tính liên tục.
"""

            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Chat response generation failed: {e}")
            return """Xin lỗi, tôi gặp vấn đề kỹ thuật. 

Nếu bạn có triệu chứng cần tư vấn gấp:
• Triệu chứng nhẹ: thử lại sau vài phút
• Triệu chứng nghiêm trọng: liên hệ bác sĩ hoặc cơ sở y tế
• Trường hợp khẩn cấp: gọi 115 hoặc đến cấp cứu ngay

**Lưu ý:** Hệ thống AI chỉ hỗ trợ tư vấn, không thay thế việc khám bác sĩ."""

    async def _analyze_conversation_context(self, full_history: List[str]) -> Dict[str, Any]:
        """Analyze conversation to extract diagnosis context"""
        try:
            all_text = " ".join(full_history)
            
            prompt = f"""Phân tích cuộc hội thoại y khoa này và trích xuất thông tin cấu trúc:

Hội thoại: {all_text}

Trả về JSON format:
{{
  "symptoms_mentioned": ["triệu chứng 1", "triệu chứng 2"],
  "duration": "thời gian xuất hiện triệu chứng",
  "severity": "mức độ (nhẹ/vừa/nặng)",
  "key_concerns": ["mối quan tâm chính"],
  "recommendation_level": "self_care/see_doctor/emergency"
}}
"""

            response = self.model.generate_content(prompt)
            try:
                import json
                return json.loads(response.text.strip())
            except:
                return {
                    "symptoms_mentioned": [],
                    "duration": "unknown",
                    "severity": "unknown", 
                    "key_concerns": [],
                    "recommendation_level": "see_doctor"
                }
                
        except Exception as e:
            print(f"Conversation analysis failed: {e}")
            return {
                "symptoms_mentioned": [],
                "duration": "unknown",
                "severity": "unknown",
                "key_concerns": [],
                "recommendation_level": "see_doctor"
            }