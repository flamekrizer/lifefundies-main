from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserProfileSchema(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    emotionState: Optional[str] = None
    recentDomains: List[str] = []
    sessionHistory: List[str] = []
    preferences: Dict[str, Any] = {}

class MessageSchema(BaseModel):
    id: str
    sender: str  # "user" or "fundoo"
    content: str
    timestamp: datetime
    emotion: Optional[str] = None
    domain: Optional[str] = None
    responseType: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class IRARequestSchema(BaseModel):
    userId: str
    message: str
    userProfile: UserProfileSchema
    conversationContext: List[MessageSchema] = []
    sessionId: Optional[str] = None

class SuggestedActionSchema(BaseModel):
    type: str  # "GUIDE", "BOOK_MENTOR", "RESOURCE", "ESCALATE"
    label: str
    data: Optional[Dict[str, Any]] = None

class IRAResponseSchema(BaseModel):
    sessionId: Optional[str] = None
    message: str
    emotion: str
    domain: str
    responseType: str  # "GUIDE", "RESOURCE", "BOOK_MENTOR", "ESCALATE", "CHAT"
    suggestedActions: Optional[List[SuggestedActionSchema]] = []
    userProfileUpdate: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatSessionSchema(BaseModel):
    id: str
    userId: str
    startedAt: datetime
    messages: List[MessageSchema] = []
    emotion: str
    domain: Optional[str] = None
    status: str  # "active" or "closed"

class MentorMatchSchema(BaseModel):
    id: str
    name: str
    specialization: str
    rating: float
    availability: List[str]
    pricePerSession: float
    bio: str
    avatar: Optional[str] = None

class BookingSchema(BaseModel):
    mentorId: str
    domain: str
    slotDate: str
    slotTime: str
    userId: str
    price: float

class UserMemorySchema(BaseModel):
    userId: str
    episodic: Dict[str, Any] = {}  # Recent interactions
    semantic: Dict[str, Any] = {}  # General knowledge learned
    emotional: Dict[str, Any] = {}  # Emotional patterns
