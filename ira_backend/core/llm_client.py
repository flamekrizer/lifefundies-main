import os
import json
from typing import List, Optional
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class LLMClient:
    """Wrapper for Groq LLM API"""

    def __init__(self, api_key: Optional[str] = None):
        load_dotenv()
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.temperature = float(os.getenv("GROQ_TEMPERATURE", "0.75"))
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "900"))
        self.client = None

        if not self.api_key:
            logger.warning("GROQ_API_KEY not set. LLM responses will be mock.")
        else:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
                logger.info("Groq client configured with model %s", self.model)
            except ImportError:
                logger.warning("groq library not installed. LLM responses will be mock.")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.client)

    def generate_response(self,
                         system_prompt: str,
                         user_message: str,
                         conversation_context: List[dict] = None) -> str:
        """Generate response using Groq API"""

        if not self.is_configured:
            return self.generate_mock_response(user_message)

        try:
            # Build messages
            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation context
            if conversation_context:
                for msg in conversation_context[-8:]:
                    content = (msg.get('content') or '').strip()
                    if not content:
                        continue

                    sender = msg.get('sender')
                    role = "assistant" if sender == "fundoo" else "user"
                    messages.append({
                        "role": role,
                        "content": content[:1200]
                    })

            # Add current message
            messages.append({"role": "user", "content": user_message.strip()})

            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )

            content = response.choices[0].message.content
            return content.strip() if content else self.generate_mock_response(user_message)

        except Exception as e:
            logger.exception("Error calling Groq API with model %s: %s", self.model, str(e))
            return self.generate_mock_response(user_message)

    def generate_mock_response(self, user_message: str) -> str:
        """Generate mock response for testing"""
        return (
            "Thank you for sharing that with me. I can help you unpack it step by step. "
            "What feels most urgent right now: clarity, emotional support, or an action plan?"
        )

    def generate_quick_replies(
        self,
        user_message: str,
        assistant_response: str,
        domain: str,
        emotion: str,
    ) -> List[str]:
        """Generate contextual quick replies that feel tied to the current exchange."""
        if not self.is_configured:
            return []

        prompt = (
            "Create 2 short, specific follow-up button labels for this life-coaching chat. "
            "They must match the user's situation and the assistant response. "
            "Avoid generic labels like 'Make a simple plan' or 'Show resources'. "
            "Return only a JSON array of strings, no markdown."
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {
                        "role": "user",
                        "content": json.dumps(
                            {
                                "user_message": user_message,
                                "assistant_response": assistant_response,
                                "domain": domain,
                                "emotion": emotion,
                            }
                        ),
                    },
                ],
                temperature=0.85,
                max_tokens=120,
            )

            content = response.choices[0].message.content or "[]"
            parsed = json.loads(content.strip())
            if not isinstance(parsed, list):
                return []

            replies = []
            for item in parsed:
                if isinstance(item, str):
                    label = item.strip()
                    if 3 <= len(label) <= 48:
                        replies.append(label)
            return replies[:2]
        except Exception as e:
            logger.warning("Unable to generate dynamic quick replies: %s", str(e))
            return []
