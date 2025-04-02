from fastapi import APIRouter, HTTPException
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

@router.post("/create")
async def create_session():
    """
    Create a new OpenAI realtime session for voice and text chat.
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found")
        
        client = OpenAI(api_key=api_key)
        
        session = client.beta.realtime.sessions.create(
            model="gpt-4o-realtime-preview-2024-12-17",
            modalities=["audio", "text"]
        )
        
        return {
            "session_id": session.id,
            "ephemeral_key": session.ephemeral_key,
            "model": session.model,
            "modalities": session.modalities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")
