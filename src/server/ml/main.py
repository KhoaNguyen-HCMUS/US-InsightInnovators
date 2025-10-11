from fastapi import FastAPI, UploadFile, File, HTTPException
from food101.model import classify_food
from pydantic import BaseModel
from chat_processor import ChatProcessor

app = FastAPI(title="Medical Chat Service")
chat_processor = ChatProcessor()

class ChatRequest(BaseModel):
    message: str
    chat_history: list[str] = []
    session_id: str

@app.post("/api/chat")
async def medical_chat(request: ChatRequest):
    """Medical chat with context awareness and auto-citations"""
    try:
        result = await chat_processor.process_chat_message(
            request.message, 
            request.chat_history,
            request.session_id
        )
        return result
    except Exception as e:
        print(f"❌ Chat processing failed: {e}")
        raise HTTPException(status_code=500, detail="Medical chat service unavailable")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "Medical Chat Service",
        "endpoints": ["/api/chat", "/api/health"]
    }

@app.post("/predict-food101")
async def predict_food(file: UploadFile = File(...)):
    contents = await file.read()
    result = classify_food(contents)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)