# Fundoo/IRA Chatbot Integration Guide

## 🎯 Overview

Fundoo is an intelligent life companion chatbot powered by IRA (Intelligent Response Agent) that provides emotional support and guidance across 18 life domains. This integration adds the complete chatbot system to your Lifefundies platform.

## 📁 Project Structure

```
Lifefundies/
├── src/
│   ├── components/
│   │   └── Fundoo/              # Chatbot UI components
│   │       ├── FundooWidget.jsx # Main chat widget
│   │       ├── ChatHeader.tsx
│   │       ├── MessageList.jsx
│   │       ├── QuickReplies.jsx
│   │       ├── DomainSelector.jsx
│   │       ├── BookingCard.jsx
│   │       ├── ConfirmationCard.jsx
│   │       ├── Disclaimer.jsx
│   │       └── shared/
│   │           ├── Avatar.tsx
│   │           ├── EmotionBadge.tsx
│   │           ├── MessageBubble.tsx
│   │           └── TypingIndicator.tsx
│   ├── hooks/
│   │   ├── useFundoo.ts         # Main chat state management
│   │   ├── useIRA.ts            # IRA API calls
│   │   └── useBooking.ts        # Mentor booking logic
│   ├── api/
│   │   └── ira.ts               # IRA API client
│   ├── utils/
│   │   ├── emotionDetect.ts     # Emotion analysis utilities
│   │   └── domainMap.ts         # Domain mapping utilities
│   └── types/
│       └── fundoo.ts            # TypeScript types
│
├── ira_backend/                 # Python FastAPI backend
│   ├── main.py                  # App entry point
│   ├── requirements.txt
│   ├── .env
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py          # Chat endpoint
│   │       ├── session.py       # Session management
│   │       ├── booking.py       # Booking endpoints
│   │       └── memory.py        # Memory management
│   ├── core/
│   │   ├── ira_engine.py        # Main orchestration engine
│   │   ├── perception.py        # NLP perception layer
│   │   ├── emotion_engine.py    # Emotion detection
│   │   ├── domain_classifier.py # Domain classification
│   │   ├── memory_system.py     # Memory management
│   │   ├── decision_core.py     # Response type selection
│   │   ├── llm_client.py        # Groq LLM integration
│   │   └── personality_layer.py # Response refinement
│   ├── models/
│   │   ├── schemas.py           # Pydantic schemas
│   │   └── user.py              # User models
│   └── db/
│       └── database.py          # SQLAlchemy setup
```

## 🚀 Quick Start

### Frontend Setup

1. **Install dependencies** (if needed):
```bash
npm install axios zustand
```

2. **Add FundooWidget to your app**:
```tsx
import FundooWidget from '@/components/Fundoo/FundooWidget'

export default function App() {
  return (
    <>
      {/* Your existing components */}
      <FundooWidget />
    </>
  )
}
```

3. **Configure environment variables** in `.env.local`:
```env
REACT_APP_IRA_API_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:3000
```

### Backend Setup

1. **Navigate to backend directory**:
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

4. **Create `.env` file**:
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./ira.db
ENVIRONMENT=development
```

5. **Run the backend**:
```bash
python main.py
# Or with uvicorn:
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## 🔗 Integration with Existing Lifefundies Code

### 1. Add to Your App Layout

In your main `App.tsx` or layout component:

```tsx
import FundooWidget from '@/components/Fundoo/FundooWidget'

export default function App() {
  return (
    <div className="app">
      {/* Your existing routes and components */}
      <Routes>
        {/* ... */}
      </Routes>

      {/* Add Fundoo Widget - it won't interfere with existing code */}
      <FundooWidget />
    </div>
  )
}
```

### 2. Initialize User Profile (Optional)

If you have user authentication, you can initialize Fundoo with user context:

```tsx
import { useFundoo } from '@/hooks/useFundoo'
import { useAuth } from '@/lib/useAuth'  // Your existing auth hook

export function UserDashboard() {
  const { user } = useAuth()
  const { initSession } = useFundoo()

  useEffect(() => {
    if (user) {
      initSession({
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        emotionState: 'neutral',
        recentDomains: [],
        sessionHistory: [],
        preferences: {
          tone: 'warm',
          notificationsEnabled: true,
          sharingConsent: false,
        },
      })
    }
  }, [user, initSession])

  return (
    // Your dashboard content
  )
}
```

### 3. Connect with Your Booking System

The booking flow integrates with your existing Razorpay setup. Update the booking endpoint:

```tsx
// In useBooking.ts
const bookSession = useCallback(async (bookingData: BookingData) => {
  // Your existing Razorpay integration
  const razorpaySession = await initializeRazorpay(bookingData)

  // Then save booking in Firestore
  const bookingRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status: 'pending',
    createdAt: new Date(),
  })

  return bookingRef
}, [])
```

## 🎓 The 18 Life Domains

Fundoo covers guidance across these 18 life domains:

1. **Career & Purpose** - Job decisions, professional growth
2. **Emotional Well-being** - Mental health, mood management
3. **Relationships** - Romantic relationships, partnerships
4. **Financial Freedom** - Money management, investments
5. **Health & Fitness** - Physical health, fitness routines
6. **Confidence & Self-Image** - Self-esteem, body positivity
7. **Motivation & Discipline** - Goal-setting, habit formation
8. **Work-Life Balance** - Managing workload and personal time
9. **Personal Growth** - Learning and continuous improvement
10. **Stress Management** - Anxiety reduction, relaxation
11. **Time Management** - Productivity, organization
12. **Communication Skills** - Effective speaking, listening
13. **Decision Making** - Making confident choices
14. **Learning & Development** - Skill development
15. **Social Skills** - Networking, social interactions
16. **Creativity & Innovation** - Creative thinking
17. **Life Planning** - Goal-setting, vision creation
18. **Mindfulness & Well-being** - Meditation, holistic wellness

## 🧠 How IRA Works

### Processing Pipeline

```
User Input
    ↓
[Sensory Layer] → Speech-to-text (Phase 2)
    ↓
[Perception Layer] → Emotion extraction, Intent classification
    ↓
[Memory System] → Retrieve episodic + semantic context
    ↓
[Decision Core] → Select GUIDE | RESOURCE | BOOK_MENTOR | ESCALATE
    ↓
[Groq LLM] → Generate natural language response
    ↓
[Personality Layer] → Refine tone (warm, non-clinical, non-judgmental)
    ↓
Output → Chat UI | WhatsApp (future) | Booking Flow
```

### Response Types

1. **CHAT** - Conversational support and guidance
2. **GUIDE** - Structured advice on a topic
3. **RESOURCE** - Links and external resources
4. **BOOK_MENTOR** - Suggest booking a mentor session
5. **ESCALATE** - Refer to professional help if needed

## 🔧 API Endpoints

### Chat Endpoint
```
POST /api/chat

Request:
{
  "userId": "user_123",
  "message": "I'm feeling stressed about my career",
  "userProfile": { ... },
  "conversationContext": [ ... ]
}

Response:
{
  "message": "I understand you're feeling stressed...",
  "emotion": "stressed",
  "domain": "Career & Purpose",
  "responseType": "GUIDE",
  "suggestedActions": [ ... ]
}
```

### Session Management
```
GET /api/session/{sessionId}
POST /api/session
POST /api/session/{sessionId}/close
```

### Memory Management
```
GET /api/memory/{userId}
POST /api/memory/{userId}
DELETE /api/memory/{userId}
```

### Booking
```
GET /api/booking/mentors?domain=Career%20&%20Purpose
POST /api/booking/create
GET /api/booking/{bookingId}
POST /api/booking/{bookingId}/cancel
```

## 🎨 Customization

### Modify Personality
Edit `ira_backend/core/personality_layer.py`:
```python
PERSONALITY_TRAITS = {
    'warm': True,
    'non_clinical': True,
    'non_judgmental': True,
    'empathetic': True,
    'encouraging': True,
}
```

### Add Emotion Keywords
Update `ira_backend/core/emotion_engine.py`:
```python
EMOTION_KEYWORDS = {
    'happy': ['happy', 'joy', 'great', ...],
    'sad': ['sad', 'down', 'depressed', ...],
    # Add more emotions
}
```

### Add Domain Keywords
Update `ira_backend/core/domain_classifier.py`:
```python
DOMAIN_KEYWORDS = {
    'Career & Purpose': ['career', 'job', 'work', ...],
    # Update keywords for better classification
}
```

## 🔐 Security Considerations

1. **API Authentication** - Add JWT tokens for backend endpoints
2. **Rate Limiting** - Implement rate limiting on chat endpoint
3. **CORS** - Configure CORS for your domain
4. **Data Privacy** - Encrypt sensitive user data
5. **Groq API Key** - Keep API keys in environment variables
6. **Database** - Use PostgreSQL for production (not SQLite)

## 📊 Monitoring & Logging

The system logs important events:
- User messages and responses
- Emotion and domain classifications
- Response type selections
- API errors

Monitor logs in `./logs/ira.log`

## 🚧 Future Enhancements

### Phase 2 Features
- [ ] Speech-to-text input (Whisper API)
- [ ] WhatsApp integration
- [ ] Video sessions with mentors
- [ ] Advanced memory management
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Admin panel for managing mentors
- [ ] Payment integration (Razorpay/Stripe)

## ❓ FAQ

**Q: Does Fundoo replace professional mental health support?**
A: No. Fundoo provides guidance and emotional support. The system escalates to professional help when needed.

**Q: Can I customize the 18 domains?**
A: Yes, modify `src/types/fundoo.ts` and `ira_backend/core/domain_classifier.py`

**Q: How do I integrate with my existing Firebase?**
A: The current setup is independent. To integrate, update API calls in `src/api/ira.ts` to call your Firebase functions.

**Q: Can I use a different LLM besides Groq?**
A: Yes, modify `ira_backend/core/llm_client.py` to use your preferred LLM service.

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Groq API Documentation](https://console.groq.com/docs)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## 🤝 Contributing

To improve Fundoo:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This chatbot is part of the Lifefundies project.

---

**Need Help?** Check the documentation or create an issue in your repository.
