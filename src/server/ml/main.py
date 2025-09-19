from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def health_check():
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
