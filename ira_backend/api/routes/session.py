from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
import logging
from uuid import uuid4
from core.memory_system import MemorySystem

logger = logging.getLogger(__name__)

router = APIRouter()
memory_system = MemorySystem()

@router.post("/session/new")
async def create_anonymous_session():
    """Create new anonymous IRA session, matching the technical specification."""
    session_id = f"anon_{uuid4().hex}"
    memory_system.ensure_session(session_id)
    return {
        "session_id": session_id,
        "status": "active",
        "anonymous": True,
    }

@router.get("/session/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieve chat session by ID"""
    try:
        memory = memory_system.retrieve_context(session_id)
        return {
            "id": session_id,
            "userId": session_id,
            "messages": memory.get("episodic", []),
            "emotion": memory.get("emotional", [{}])[-1].get("emotion", "neutral") if memory.get("emotional") else "neutral",
            "domain": memory.get("emotional", [{}])[-1].get("trigger_domain") if memory.get("emotional") else None,
            "status": "active",
            "memory": memory,
        }
    except Exception as e:
        logger.error(f"Session error: {str(e)}")
        raise HTTPException(status_code=404, detail="Session not found")

@router.post("/session")
async def create_session(user_id: str, db: Session = Depends(get_db)):
    """Create new chat session"""
    try:
        memory_system.ensure_session(user_id)
        return {
            "id": user_id,
            "userId": user_id,
            "status": "active",
        }
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating session")

@router.post("/session/{session_id}/close")
async def close_session(session_id: str, db: Session = Depends(get_db)):
    """Close chat session"""
    try:
        # TODO: Update session status
        return {"id": session_id, "status": "closed"}
    except Exception as e:
        logger.error(f"Session close error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error closing session")
