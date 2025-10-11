import os
import requests
import google.generativeai as genai
from typing import Dict, Any, List
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
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        # Translation prompt (từ diagnoseSystem.py)
        self.translate_prompt = """Bạn là chuyên gia y khoa song ngữ. 
Nhiệm vụ: dịch câu hỏi y khoa tiếng Việt dưới đây sang tiếng Anh NGẮN GỌN, đúng thuật ngữ.
CHỈ trả ra câu tiếng Anh, không thêm gì khác.
Câu hỏi:
"""
        
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
        
        # ✅ FIX: Translate Vietnamese to English for ES search
        query_en = await self._translate_vi_to_en(user_message, chat_history)
        print(f"🔍 Translated query: '{query_en}'")
        
        # Search medical knowledge if translation successful
        medical_context = ""
        snippets = []
        if query_en and query_en.strip():
            try:
                snippets, _ = self._search_elasticsearch(query_en, topk=5)
                medical_context = "\n".join(snippets[:3])
                print(f"📚 Found {len(snippets)} medical snippets")
            except Exception as e:
                print(f"❌ ES search failed: {e}")
        
        # Generate contextual response
        ai_response = await self._generate_chat_response(
            conversation_context, 
            user_message, 
            medical_context,
            snippets,
            query_en
        )
        
        # Analyze conversation for diagnosis context
        diagnosis_context = await self._analyze_conversation_context(chat_history + [f"user: {user_message}"])
        
        return {
            "response": ai_response,
            "diagnosis_context": diagnosis_context,
            "medical_snippets": snippets[:2],
            "symptoms_detected": query_en
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
                context += f"Người dùng: {message[5:]}\n"
            elif message.startswith("assistant:"):
                context += f"Trợ lý: {message[10:]}\n"
        
        context += f"\nTIN NHẮN HIỆN TẠI:\nNgười dùng: {current_message}"
        return context

    async def _translate_vi_to_en(self, message: str, chat_history: List[str]) -> str:
        """✅ FIX: Translate Vietnamese medical terms to English (theo diagnoseSystem.py)"""
        try:
            # Use recent conversation for context
            recent_messages = chat_history[-3:] if len(chat_history) > 3 else chat_history
            context_text = " ".join(recent_messages) + " " + message
            
            # Use the same prompt as diagnoseSystem.py
            prompt = self.translate_prompt + context_text
            
            response = self.model.generate_content(prompt)
            query_en = response.text.strip()
            
            print(f"✅ Translation successful: '{message}' → '{query_en}'")
            return query_en
            
        except Exception as e:
            print(f"❌ Translation failed: {e}")
            return ""

    def _search_elasticsearch(self, query: str, topk: int = 5):
        """✅ Search medical knowledge in Elasticsearch (theo diagnoseSystem.py)"""
        try:
            # Same payload as diagnoseSystem.py
            payload = {
                "query": {"match": {"body": query}}, 
                "size": topk
            }
            
            response = requests.post(self.es_url, json=payload, timeout=30)
            response.raise_for_status()
            
            hits = response.json().get("hits", {}).get("hits", [])
            snippets = [hit["_source"]["body"] for hit in hits if "body" in hit["_source"]]
            
            print(f"📊 ES returned {len(snippets)} results for query: {query}")
            return snippets, len(hits)

        except Exception as e:
            print(f"❌ Elasticsearch error: {e}")
            return [], 0

    async def _generate_chat_response(self, conversation_context: str, user_message: str, medical_context: str, snippets: List[str] = None, query_en: str = "") -> str:
        prompt = f"""{self.system_prompt}

{conversation_context}

"""
    
        # ✅ FIX: Add medical context with citation requirement (theo diagnoseSystem.py)
        if medical_context.strip() and snippets:
            prompt += f"""
THÔNG TIN Y KHOA LIÊN QUAN (từ tìm kiếm: "{query_en}"):
{medical_context}

**YÊU CẦU BẮT BUỘC:** 
- Sử dụng thông tin y khoa trên để trả lời chính xác
- PHẢI bao gồm phần "**Nguồn (trích sách):**" ở cuối
- Trích dẫn 1-2 câu tiêu biểu từ nguồn (giữ nguyên tiếng Anh trong dấu ngoặc kép)
- Format chính xác: **Nguồn (trích sách):** "exact English quote from medical source"

"""

        prompt += "\nTrợ lý AI:"
        
        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def _analyze_conversation_context(self, full_history: List[str]) -> Dict[str, Any]:
        """Analyze conversation to extract diagnosis context"""
        try:
            return {
                "symptoms_mentioned": [],
                "duration": "unknown", 
                "severity": "unknown",
                "key_concerns": [],
                "recommendation_level": "see_doctor"
            }
        except Exception as e:
            return {"error": str(e)}