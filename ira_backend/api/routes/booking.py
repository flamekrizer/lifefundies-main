from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import BookingSchema
from db.database import get_db, BookingModel
import logging
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/booking/mentors")
async def get_mentors(domain: str, db: Session = Depends(get_db)):
    """Get available mentors for a domain"""
    try:
        mentor_category = _mentor_category_for_domain(domain)
        return [
            {
                "id": f"mentor_{_slug(domain)}_1",
                "name": "Priya Sharma",
                "specialization": domain,
                "rating": 4.9,
                "availability": ["Tomorrow", "4:00 PM"],
                "pricePerSession": 349,
                "bio": f"{mentor_category} with 6+ years of student and early-career guidance experience.",
                "avatar": None
            },
            {
                "id": f"mentor_{_slug(domain)}_2",
                "name": "Rahul Verma",
                "specialization": domain,
                "rating": 4.8,
                "availability": ["Today", "6:30 PM"],
                "pricePerSession": 299,
                "bio": f"{mentor_category} focused on practical action plans and supportive accountability.",
                "avatar": None
            }
        ]
    except Exception as e:
        logger.error(f"Mentors retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching mentors")

@router.post("/booking/create")
async def create_booking(booking: BookingSchema, db: Session = Depends(get_db)):
    """Create a booking for mentor session"""
    try:
        booking_id = f"booking_{uuid4().hex[:12]}"
        record = BookingModel(
            id=booking_id,
            userId=booking.userId,
            mentorId=booking.mentorId,
            domain=booking.domain,
            slotDate=booking.slotDate,
            slotTime=booking.slotTime,
            price=booking.price,
            status="confirmed",
            confirmedAt=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
        return {
            "id": booking_id,
            "status": "confirmed",
            "mentorId": booking.mentorId,
            "userId": booking.userId,
            "date": booking.slotDate,
            "time": booking.slotTime,
            "price": booking.price,
            "domain": booking.domain,
            "createdAt": record.createdAt.isoformat() if record.createdAt else datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Booking creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating booking")

@router.get("/booking/{booking_id}")
async def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Get booking details"""
    try:
        booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return {
            "id": booking.id,
            "status": booking.status,
            "mentorId": booking.mentorId,
            "userId": booking.userId,
            "domain": booking.domain,
            "date": booking.slotDate,
            "time": booking.slotTime,
            "price": booking.price,
        }
    except Exception as e:
        logger.error(f"Booking retrieval error: {str(e)}")
        raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/booking/{booking_id}/cancel")
async def cancel_booking(booking_id: str, db: Session = Depends(get_db)):
    """Cancel a booking"""
    try:
        booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        booking.status = "cancelled"
        db.commit()
        return {"id": booking_id, "status": "cancelled"}
    except Exception as e:
        logger.error(f"Booking cancellation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error cancelling booking")


def _slug(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in value).strip("_")


def _mentor_category_for_domain(domain: str) -> str:
    categories = {
        "Career & Purpose": "Career Coach",
        "Emotional Well-being": "Emotional Guide",
        "Relationships": "Relationship Guide",
        "Financial Freedom": "Financial Coach",
        "Health & Fitness": "Health Coach",
        "Confidence & Self-Image": "Confidence Coach",
        "Motivation & Discipline": "Productivity Coach",
        "Work-Life Balance": "Work-Life Coach",
        "Personal Growth": "Personal Growth Coach",
        "Stress Management": "Stress & Clarity Coach",
        "Time Management": "Productivity Coach",
        "Communication Skills": "Communication Coach",
        "Decision Making": "Decision Coach",
        "Learning & Development": "Learning Coach",
        "Social Skills": "Social Confidence Coach",
        "Creativity & Innovation": "Creativity Coach",
        "Life Planning": "Life Planning Coach",
        "Mindfulness & Well-being": "Mindfulness Guide",
    }
    return categories.get(domain, "LifeFundies Guide")
