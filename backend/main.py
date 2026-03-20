from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI(title="Azure Demo API", version="1.0.0")

class MessageRequest(BaseModel):
    text: str

class MessageResponse(BaseModel):
    original: str
    reversed: str
    timestamp: str
    environment: str

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

@app.post("/api/message", response_model=MessageResponse)
def process_message(req: MessageRequest):
    return MessageResponse(
        original=req.text,
        reversed=req.text[::-1],
        timestamp=datetime.utcnow().isoformat(),
        environment=os.getenv("ENVIRONMENT", "development"),
    )

@app.get("/api/info")
def info():
    return {
        "app": "Azure Full-Stack Demo",
        "frontend": "React + Vite",
        "backend": "FastAPI + Uvicorn",
        "hosting": "Azure App Service",
    }

# Serve React frontend — must be LAST
app.mount("/", StaticFiles(directory="static", html=True), name="static")