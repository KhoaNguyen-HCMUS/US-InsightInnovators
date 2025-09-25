from fastapi import FastAPI, UploadFile, File
from food101.model import classify_food

app = FastAPI()

@app.get("/api/health")
def health_check():
    return {"ok": True}

@app.post("/predict-food101")
async def predict_food(file: UploadFile = File(...)):
    contents = await file.read()
    result = classify_food(contents)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
