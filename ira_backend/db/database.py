from sqlalchemy import create_engine, Column, String, DateTime, JSON, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL - can be SQLite for development or PostgreSQL for production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ira.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    avatar = Column(String, nullable=True)
    emotionState = Column(String, default="neutral")
    recentDomains = Column(JSON, default=[])
    preferences = Column(JSON, default={})
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatSessionModel(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True)
    userId = Column(String, index=True)
    messages = Column(JSON, default=[])
    emotion = Column(String, default="neutral")
    domain = Column(String, nullable=True)
    status = Column(String, default="active")
    startedAt = Column(DateTime, default=datetime.utcnow)
    endedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

class UserMemoryModel(Base):
    __tablename__ = "user_memory"

    id = Column(String, primary_key=True)
    userId = Column(String, unique=True, index=True)
    episodic = Column(JSON, default={})  # Recent interactions
    semantic = Column(JSON, default={})  # General knowledge learned
    emotional = Column(JSON, default={})  # Emotional patterns
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MentorModel(Base):
    __tablename__ = "mentors"

    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    specialization = Column(String)
    rating = Column(Float, default=0.0)
    availability = Column(JSON, default=[])
    pricePerSession = Column(Float)
    bio = Column(String)
    avatar = Column(String, nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

class BookingModel(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True)
    userId = Column(String, index=True)
    mentorId = Column(String, index=True)
    domain = Column(String)
    slotDate = Column(String)
    slotTime = Column(String)
    price = Column(Float)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    createdAt = Column(DateTime, default=datetime.utcnow)
    confirmedAt = Column(DateTime, nullable=True)
    completedAt = Column(DateTime, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
