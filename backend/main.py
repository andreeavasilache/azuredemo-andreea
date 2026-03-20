from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI(title="Azure Demo API", version="1.0.0")

# CORS — allow the frontend origin
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    text: str


class MessageResponse(BaseModel):
    original: str
    reversed: str
    timestamp: str
    environment: str


@app.get("/")
def root():
    return {"status": "ok", "message": "Azure Demo API is running"}


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
