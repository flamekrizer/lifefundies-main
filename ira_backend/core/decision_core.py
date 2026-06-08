from typing import List, Optional
from enum import Enum
from models.schemas import SuggestedActionSchema

class ResponseType(str, Enum):
    CHAT = "CHAT"
    GUIDE = "GUIDE"
    RESOURCE = "RESOURCE"
    BOOK_MENTOR = "BOOK_MENTOR"
    ESCALATE = "ESCALATE"

class DecisionCore:
    """Determines optimal response type and actions"""

    def select_response_type(self,
                           intent: str,
                           emotion: str,
                           conversation_history_length: int,
                           requires_professional_help: bool = False) -> ResponseType:
        """Select response type based on context"""

        # Escalate if professional help needed
        if requires_professional_help or emotion in ['very_anxious', 'severe_depression']:
            return ResponseType.ESCALATE

        # Booking decision
        if intent == 'booking':
            return ResponseType.BOOK_MENTOR

        # Venting requires empathetic chat
        if intent in ['venting', 'emotional_support']:
            return ResponseType.CHAT

        # Information seeking -> Guide or Resource
        if intent in ['information', 'planning', 'guidance', 'advice_seeking']:
            return ResponseType.GUIDE if conversation_history_length < 3 else ResponseType.RESOURCE

        # Default to chat
        return ResponseType.CHAT

    def generate_suggested_actions(self, response_type: ResponseType, domain: str) -> List[SuggestedActionSchema]:
        """Generate suggested actions based on response type"""

        actions = []

        if response_type == ResponseType.CHAT:
            actions.append(SuggestedActionSchema(
                type="GUIDE",
                label="Make a simple plan",
                data={"domain": domain}
            ))
            actions.append(SuggestedActionSchema(
                type="RESOURCE",
                label="Give me reflection prompts",
                data={"domain": domain}
            ))

        if response_type == ResponseType.GUIDE:
            actions.append(SuggestedActionSchema(
                type="RESOURCE",
                label="Show practical resources",
                data={"domain": domain}
            ))
            actions.append(SuggestedActionSchema(
                type="BOOK_MENTOR",
                label="Talk to a mentor",
                data={"domain": domain}
            ))

        if response_type == ResponseType.BOOK_MENTOR:
            actions.append(SuggestedActionSchema(
                type="BOOK_MENTOR",
                label="Book a session now",
                data={"domain": domain}
            ))

        if response_type == ResponseType.ESCALATE:
            actions.append(SuggestedActionSchema(
                type="ESCALATE",
                label="Find immediate support",
                data={"domain": domain}
            ))

        return actions
