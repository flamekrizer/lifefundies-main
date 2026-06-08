from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import IRARequestSchema, IRAResponseSchema
from core.ira_engine import IRAEngine
from core.domain_classifier import DomainClassifier
from db.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
ira_engine = IRAEngine()
domain_classifier = DomainClassifier()

@router.post("/chat", response_model=IRAResponseSchema)
async def chat(request: IRARequestSchema, db: Session = Depends(get_db)):
    """Main chat endpoint - processes user message through IRA pipeline"""
    try:
        # Process through IRA engine
        response = await ira_engine.process_input(request)

        # Save to database if needed
        # TODO: Save chat session to database

        return response

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing message")

@router.get("/chat/status")
async def chat_status():
    """Report whether the dynamic Groq-backed chat engine is configured."""
    return {
        "llmConfigured": ira_engine.llm_client.is_configured,
        "model": ira_engine.llm_client.model,
    }

@router.get("/domains")
async def get_domains():
    """Return all LifeFundies domains with routing metadata."""
    return domain_classifier.list_domains()

@router.get("/chat/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieve chat session history"""
    try:
        # TODO: Fetch from database
        return {
            "session_id": session_id,
            "messages": [],
            "emotion": "neutral",
            "domain": None,
            "status": "active"
        }
    except Exception as e:
        logger.error(f"Session retrieval error: {str(e)}")
        raise HTTPException(status_code=404, detail="Session not found")
