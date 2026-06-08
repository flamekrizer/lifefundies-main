# IRA Backend - Quick Start

The Intelligent Response Agent (IRA) is the brains behind Fundoo, a life companion chatbot. This backend processes user input through multiple layers to provide empathetic, intelligent responses.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Virtual environment tool (venv)

### Installation

1. **Clone and navigate to backend**:
```bash
cd ira_backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up environment**:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

5. **Run the server**:
```bash
python main.py
```

The server will start on `http://localhost:8000`

### API Documentation
Once running, visit: `http://localhost:8000/docs`

## 📚 Architecture

### Layers

1. **Sensory Layer** - Input processing
2. **Perception Layer** - Emotion extraction, intent classification
3. **Memory System** - Context retrieval
4. **Decision Core** - Response type selection
5. **LLM Layer** - Groq API for generation
6. **Personality Layer** - Response refinement
7. **Output** - Chat, Guide, Resource, Booking, or Escalation

### Key Components

- `core/ira_engine.py` - Main orchestration
- `core/perception.py` - NLP processing
- `core/emotion_engine.py` - Emotion detection
- `core/domain_classifier.py` - Domain classification
- `core/memory_system.py` - User memory management
- `core/decision_core.py` - Response selection
- `core/llm_client.py` - LLM integration
- `core/personality_layer.py` - Response refinement

## 🔌 API Endpoints

### Main Chat
```
POST /api/chat
```

### Sessions
```
GET /api/session/{session_id}
POST /api/session
POST /api/session/{session_id}/close
```

### Memory
```
GET /api/memory/{user_id}
POST /api/memory/{user_id}
DELETE /api/memory/{user_id}
```

### Booking
```
GET /api/booking/mentors?domain=Career%20&%20Purpose
POST /api/booking/create
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## 📝 Environment Variables

- `GROQ_API_KEY` - Groq API key (required)
- `DATABASE_URL` - Database connection string
- `ENVIRONMENT` - dev/prod
- `CORS_ORIGINS` - Allowed CORS origins
- `HOST` - Server host
- `PORT` - Server port

## 🐛 Troubleshooting

**Error: ModuleNotFoundError**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt`

**Error: GROQ_API_KEY not set**
- Add your API key to `.env` file
- Get one from https://console.groq.com

**Database errors**
- Delete `ira.db` to reset
- Database will be recreated on startup

## 🚀 Production Deployment

1. Use PostgreSQL instead of SQLite
2. Set `ENVIRONMENT=production`
3. Enable proper logging
4. Set up database migrations with Alembic
5. Configure CORS properly
6. Use a production ASGI server (Gunicorn + Uvicorn)

Example Gunicorn command:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## 📚 Learn More

- See `FUNDOO_INTEGRATION_GUIDE.md` for full integration details
- Check API docs at `/docs` when server is running

## 🤝 Support

For issues or questions, refer to the main integration guide or create an issue.

---

**Ready to power up your chatbot?** Start the server and visit `/docs` to explore the API!
