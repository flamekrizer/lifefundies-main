from dotenv import load_dotenv

# Load environment variables before importing modules that construct services.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.routes import chat, session, booking, memory
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("IRA Backend Starting...")
    logger.info(f"Groq API Key loaded: {'✓' if os.getenv('GROQ_API_KEY') else '✗'}")
    yield
    logger.info("IRA Backend Shutting Down...")

app = FastAPI(
    title="IRA - Intelligent Response Agent",
    description="Backend for Fundoo Chatbot",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(booking.router, prefix="/api", tags=["booking"])
app.include_router(memory.router, prefix="/api", tags=["memory"])

@app.get("/")
async def root():
    return {
        "message": "IRA Backend is Running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
