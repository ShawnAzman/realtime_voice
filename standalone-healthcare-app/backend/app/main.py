from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from dotenv import load_dotenv
from .routers import session, chat

load_dotenv()

app = FastAPI(title="Healthcare Chat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router, prefix="/api/session", tags=["session"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Healthcare Chat API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
