from fastapi import APIRouter, HTTPException, Request
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from ..services.healthcare_agent import get_healthcare_agent_config

load_dotenv()

router = APIRouter()

@router.post("/completions")
async def chat_completions(request: Request):
    """
    Process a chat completion request for the healthcare agent.
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found")
        
        client = OpenAI(api_key=api_key)
        
        body = await request.json()
        messages = body.get("messages", [])
        
        if not messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        healthcare_config = get_healthcare_agent_config()
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=healthcare_config["tools"],
            tool_choice="auto"
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat completion: {str(e)}")
