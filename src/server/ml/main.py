from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from diagnose_processor import DiagnoseProcessor
from chat_processor import ChatProcessor

app = FastAPI(title="Medical Diagnosis Service")
processor = DiagnoseProcessor()
chat_processor = ChatProcessor()

class ProcessRequest(BaseModel):
    question_vi: str
    topk: int = 8
    
class ChatRequest(BaseModel):  # NEW
    message: str
    chat_history: list[str] = []
    session_id: str

@app.post("/api/process")
async def process_question(request: ProcessRequest):
    try:
        result = await processor.process_question(request.question_vi, request.topk)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")  # NEW
async def chat_diagnosis(request: ChatRequest):
    try:
        result = await chat_processor.process_chat_message(
            request.message, 
            request.chat_history,
            request.session_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"ok": True, "service": "Diagnose ML Processing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)