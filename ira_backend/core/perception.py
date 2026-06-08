from typing import Dict, List, Optional
from core.emotion_engine import EmotionEngine
from core.domain_classifier import DomainClassifier

class Perception:
    """NLP Layer: Extract emotion, intent, and context from user input"""

    def __init__(self):
        self.emotion_engine = EmotionEngine()
        self.domain_classifier = DomainClassifier()

    def parse_input(self, text: str, current_domain: Optional[str] = None) -> Dict:
        """Parse user input for emotion, intent, and domain"""

        emotion = self.emotion_engine.detect_emotion(text)
        domain = self.domain_classifier.classify_domain(text, current_domain)

        # Determine intent
        intent = self.determine_intent(text)
        requires_professional_help = self.emotion_engine.requires_professional_help(text)

        return {
            'text': text,
            'emotion': emotion,
            'domain': domain,
            'intent': intent,
            'requires_professional_help': requires_professional_help,
            'confidence': self.calculate_confidence(text, emotion, domain),
        }

    def determine_intent(self, text: str) -> str:
        """Determine user's intent from text"""
        text_lower = text.lower()

        intent_patterns = {
            'advice_seeking': ['advice', 'help', 'suggest', 'recommend', 'what should', 'how to'],
            'venting': ['upset', 'frustrated', 'angry', 'feel bad', 'hate', 'can\'t stand'],
            'information': ['what is', 'explain', 'tell me', 'how does', 'why'],
            'booking': ['book', 'schedule', 'appointment', 'session', 'mentor'],
            'guidance': ['guide', 'help me', 'teach', 'show me', 'learn'],
            'emotional_support': ['support', 'listen', 'understand', 'empathy', 'comfort'],
            'planning': ['plan', 'roadmap', 'steps', 'routine', 'strategy', 'action plan'],
        }

        for intent, patterns in intent_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return intent

        return 'conversation'

    def calculate_confidence(self, text: str, emotion: str, domain: str) -> float:
        """Calculate confidence score for analysis"""
        # Simple heuristic: longer, more specific text = higher confidence
        base_score = min(len(text) / 100, 1.0)

        if emotion != 'neutral':
            base_score += 0.1

        return min(base_score, 1.0)
