from typing import Dict, Any

class EmotionEngine:
    """Handles emotion detection and empathy management"""

    EMOTION_KEYWORDS = {
        'happy': ['happy', 'joy', 'great', 'wonderful', 'fantastic', 'love', 'excited', 'proud'],
        'sad': ['sad', 'down', 'depressed', 'unhappy', 'miserable', 'hopeless', 'heartbroken', 'crying', 'worthless'],
        'stressed': ['stressed', 'overwhelmed', 'pressure', 'tense', 'burnout', 'exhausted'],
        'anxious': ['anxious', 'nervous', 'worried', 'worry', 'fear', 'scared', 'panic', 'afraid', 'what if'],
        'confused': ['confused', 'lost', 'unclear', 'uncertain', 'stuck', 'dilemma', "don't know", 'unsure'],
        'lonely': ['lonely', 'alone', 'isolated', 'no one', 'nobody cares', 'left out'],
        'frustrated': ['frustrated', 'annoyed', 'fed up', 'tired of', 'irritated'],
        'angry': ['angry', 'furious', 'rage', 'mad', 'resentful'],
        'grateful': ['grateful', 'thankful', 'appreciate', 'blessed'],
    }

    EMPATHY_LEVELS = {
        'happy': 0.50,
        'neutral': 0.60,
        'confused': 0.75,
        'frustrated': 0.80,
        'anxious': 0.88,
        'stressed': 0.90,
        'lonely': 0.92,
        'sad': 0.95,
        'angry': 0.82,
        'grateful': 0.50,
    }

    CRISIS_KEYWORDS = [
        'suicide', 'suicidal', 'kill myself', 'end my life', 'self harm',
        'hurt myself', 'no reason to live', 'want to die', 'ending it all'
    ]

    def detect_emotion(self, text: str) -> str:
        """Detect emotion from text"""
        text_lower = text.lower()

        for emotion, keywords in self.EMOTION_KEYWORDS.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion

        return 'neutral'

    def analyze(self, text: str) -> Dict[str, Any]:
        """Return the IRA 2.0 emotion payload: class, empathy, and rough sentiment."""
        emotion = self.detect_emotion(text)
        empathy_level = self.EMPATHY_LEVELS.get(emotion, 0.60)

        negative_emotions = {'sad', 'stressed', 'anxious', 'confused', 'lonely', 'frustrated', 'angry'}
        positive_emotions = {'happy', 'grateful'}
        if emotion in negative_emotions:
            sentiment_score = -round(empathy_level, 2)
        elif emotion in positive_emotions:
            sentiment_score = round(empathy_level, 2)
        else:
            sentiment_score = 0.0

        return {
            'emotion': emotion,
            'empathy_level': empathy_level,
            'sentiment_score': sentiment_score,
            'requires_professional_help': self.requires_professional_help(text),
        }

    def requires_professional_help(self, text: str) -> bool:
        """Flag messages that need crisis-safe escalation."""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.CRISIS_KEYWORDS)

    def get_empathy_response(self, emotion: str) -> str:
        """Generate empathetic opening based on emotion"""
        responses = {
            'happy': "I'm so glad you're feeling great! ",
            'sad': "I hear that you're feeling down. ",
            'stressed': "It sounds like you're under a lot of pressure. ",
            'anxious': "I understand your concerns. ",
            'confused': "It's completely normal to feel uncertain. ",
            'lonely': "Feeling alone with something can be really heavy. ",
            'frustrated': "I can hear how frustrating this feels. ",
            'angry': "I can see that you're frustrated. ",
            'grateful': "What a wonderful mindset! ",
            'neutral': "Thank you for sharing. ",
        }

        return responses.get(emotion, responses['neutral'])
