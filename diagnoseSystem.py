# app.py
import os, requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv           # ← THÊM
import google.generativeai as genai

load_dotenv()                            # ← THÊM: đọc file .env nếu có

ES_URL = "http://localhost:9200/knowledge/_search"

# Lấy key từ GEMINI_API_KEY hoặc GOOGLE_API_KEY
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY/GOOGLE_API_KEY in env/.env")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-flash-lite")
app = FastAPI()

class AskPayload(BaseModel):
    question_vi: str
    topk: int = 8

TRANSLATE_PROMPT = """Bạn là chuyên gia y khoa song ngữ. 
Nhiệm vụ: dịch câu hỏi y khoa tiếng Việt dưới đây sang tiếng Anh NGẮN GỌN, đúng thuật ngữ.
CHỈ trả ra câu tiếng Anh, không thêm gì khác.
Câu hỏi:
"""
ANSWER_PROMPT = """Bạn là trợ lý y khoa. Từ các trích đoạn tiếng Anh dưới đây, hãy trả lời NGẮN GỌN bằng tiếng Việt, có cảnh báo giới hạn (không thay thế tư vấn bác sĩ). 
Yêu cầu:
- Tóm tắt mạch lạc dựa trên snippet (không bịa).
- Nếu câu hỏi là "triệu chứng của X", hãy liệt kê bullet ngắn.
- Thêm "Nguồn (trích sách):" và dán 1-3 câu tiêu biểu (giữ nguyên tiếng Anh).
Dữ liệu trích:
"""

def vi_to_en(q_vi: str) -> str:
    resp = model.generate_content(TRANSLATE_PROMPT + q_vi)
    return resp.text.strip()

def summarize_vi(question_vi: str, snippets: list[str]) -> str:
    joined = "\n- " + "\n- ".join(snippets)
    prompt = f"Câu hỏi (VI): {question_vi}\n\n{ANSWER_PROMPT}{joined}"
    resp = model.generate_content(prompt)
    return resp.text.strip()

def es_search(query_en: str, topk: int):
    # Với ES 2.x, POST _search là an toàn nhất
    payload = {"query": {"match": {"body": query_en}}, "size": topk}
    r = requests.post(ES_URL, json=payload, timeout=30)
    r.raise_for_status()
    hits = r.json().get("hits", {}).get("hits", [])
    return [h["_source"]["body"] for h in hits], hits

@app.post("/ask")
def ask(payload: AskPayload):
    # 1) VI -> EN
    q_en = vi_to_en(payload.question_vi)

    # 2) Search ES
    snippets, raw_hits = es_search(q_en, payload.topk)

    # 3) EN -> VI (tóm tắt + trích dẫn)
    answer_vi = summarize_vi(payload.question_vi, snippets)

    # 4) Trả về cả debug thông tin nếu muốn
    return {
        "question_vi": payload.question_vi,
        "query_en": q_en,
        "topk": payload.topk,
        "answer_vi": answer_vi,
        "snippets": snippets[:3],  # xem nhanh 3 snippet đầu
    }
