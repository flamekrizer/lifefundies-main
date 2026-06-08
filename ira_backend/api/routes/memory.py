from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import UserMemorySchema
from db.database import get_db, UserMemoryModel
import logging
from uuid import uuid4
from core.memory_system import MemorySystem

logger = logging.getLogger(__name__)

router = APIRouter()
memory_system = MemorySystem()

@router.get("/memory/{user_id}")
async def get_user_memory(user_id: str, db: Session = Depends(get_db)):
    """Retrieve user's memory (episodic, semantic, emotional)"""
    try:
        memory = memory_system.retrieve_context(user_id, limit=20)
        return {"userId": user_id, **memory}
    except Exception as e:
        logger.error(f"Memory retrieval error: {str(e)}")
        raise HTTPException(status_code=404, detail="Memory not found")

@router.post("/memory/{user_id}")
async def save_user_memory(user_id: str, memory: UserMemorySchema, db: Session = Depends(get_db)):
    """Save or update user memory"""
    try:
        for key, value in memory.semantic.items():
            memory_system.store_semantic(user_id, key, value)
        if memory.emotional:
            memory_system.store_emotional(user_id, memory.emotional)
        if memory.episodic:
            memory_system.store_episodic(user_id, memory.episodic)
        return {
            "userId": user_id,
            "status": "saved",
            "episodic": memory.episodic,
            "semantic": memory.semantic,
            "emotional": memory.emotional
        }
    except Exception as e:
        logger.error(f"Memory save error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error saving memory")

@router.delete("/memory/{user_id}")
async def clear_user_memory(user_id: str, db: Session = Depends(get_db)):
    """Clear user memory (for testing/privacy)"""
    try:
        # TODO: Delete from database
        return {
            "userId": user_id,
            "status": "cleared"
        }
    except Exception as e:
        logger.error(f"Memory clear error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error clearing memory")

@router.get("/memory/{user_id}/summary")
async def get_memory_summary(user_id: str, db: Session = Depends(get_db)):
    """Get summary of user memory for profile"""
    try:
        memory = memory_system.retrieve_context(user_id, limit=10)
        return {
            "userId": user_id,
            "summary": memory_system.get_user_profile_summary(user_id),
            "domains": [item["domain"] for item in memory.get("episodic", []) if item.get("domain")],
            "recentEmotions": [item["emotion"] for item in memory.get("emotional", []) if item.get("emotion")],
            "semantic": memory.get("semantic", {}),
        }
    except Exception as e:
        logger.error(f"Memory summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching memory summary")
