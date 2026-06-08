from typing import Optional, Dict, Any, List
from models.schemas import IRARequestSchema, IRAResponseSchema, SuggestedActionSchema
from core.perception import Perception
from core.emotion_engine import EmotionEngine
from core.domain_classifier import DomainClassifier
from core.memory_system import MemorySystem
from core.decision_core import DecisionCore, ResponseType
from core.llm_client import LLMClient
from core.personality_layer import PersonalityLayer
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

class IRAEngine:
    """Main orchestration engine - combines all layers"""

    def __init__(self):
        self.perception = Perception()
        self.emotion_engine = EmotionEngine()
        self.domain_classifier = DomainClassifier()
        self.memory_system = MemorySystem()
        self.decision_core = DecisionCore()
        self.llm_client = LLMClient()
        self.personality_layer = PersonalityLayer()

    async def process_input(self, request: IRARequestSchema) -> IRAResponseSchema:
        """Main processing pipeline"""
        session_id = request.sessionId or request.userId or f"anon_{uuid4().hex}"
        self.memory_system.ensure_session(session_id)

        # 1. PERCEPTION LAYER - Extract emotion, intent, domain
        current_domain = request.userProfile.recentDomains[-1] if request.userProfile.recentDomains else None
        perception_data = self.perception.parse_input(
            request.message,
            current_domain=current_domain
        )

        logger.info(f"Perception: {perception_data}")

        # 2. EMOTION ENGINE - Detailed emotion analysis
        emotion_analysis = self.emotion_engine.analyze(request.message)
        emotion = emotion_analysis['emotion']
        # 3. DOMAIN CLASSIFICATION
        domain_result = self.domain_classifier.classify_with_confidence(
            request.message,
            current_domain=current_domain
        )
        domain = domain_result['domain']

        # 4. MEMORY SYSTEM - Retrieve context
        user_memory = self.memory_system.retrieve_context(session_id)
        user_profile_summary = self.memory_system.get_user_profile_summary(session_id)

        # 5. BUILD SYSTEM PROMPT
        system_prompt = self._build_system_prompt(
            domain,
            perception_data,
            user_profile_summary,
            emotion_analysis,
            domain_result,
            user_memory,
        )

        # 6. LLM GENERATION - Generate response
        raw_response = self.llm_client.generate_response(
            system_prompt=system_prompt,
            user_message=request.message,
            conversation_context=[msg.dict() for msg in request.conversationContext]
        )

        # 7. PERSONALITY LAYER - Refine response
        refined_response = self.personality_layer.refine_response(
            raw_response,
            emotion,
            domain
        )

        # 8. DECISION CORE - Select response type
        response_type = self.decision_core.select_response_type(
            intent=perception_data['intent'],
            emotion=emotion,
            conversation_history_length=len(request.conversationContext),
            requires_professional_help=perception_data.get('requires_professional_help', False)
        )

        # 9. GENERATE CONTEXTUAL SUGGESTED ACTIONS
        suggested_actions = self._generate_dynamic_actions(
            request.message,
            refined_response,
            domain,
            emotion,
            response_type,
        )

        # 10. UPDATE MEMORY
        self.memory_system.store_episodic(session_id, {
            'user_message': request.message,
            'assistant_response': refined_response,
            'emotion': emotion,
            'domain': domain,
            'intent': perception_data['intent'],
            'response_type': response_type.value,
        })

        self.memory_system.store_emotional(session_id, {
            'current_emotion': emotion,
            'domain': domain,
            'empathy_level': emotion_analysis['empathy_level'],
            'sentiment_score': emotion_analysis['sentiment_score'],
        })

        self.memory_system.store_semantic(
            session_id,
            'preferred_domains',
            self._merge_recent_domains(user_memory, domain),
        )

        # 11. BUILD RESPONSE
        ira_response = IRAResponseSchema(
            sessionId=session_id,
            message=refined_response,
            emotion=emotion,
            domain=domain,
            responseType=response_type.value,
            suggestedActions=suggested_actions,
            userProfileUpdate={
                'emotionState': emotion,
                'recentDomains': [domain],  # Would merge with existing
            },
            metadata={
                'intent': perception_data['intent'],
                'domainConfidence': domain_result['confidence'],
                'mentorCategory': domain_result['mentor_category'],
                'empathyLevel': emotion_analysis['empathy_level'],
                'sentimentScore': emotion_analysis['sentiment_score'],
                'memoryItemsUsed': len(user_memory.get('episodic', [])),
                'llmConfigured': self.llm_client.is_configured,
            },
        )

        logger.info(f"IRA Response Type: {response_type.value}")

        return ira_response

    def _merge_recent_domains(self, user_memory: Dict[str, Any], domain: str) -> List[str]:
        semantic_domains = user_memory.get('semantic', {}).get('preferred_domains', [])
        domains = [domain] + [d for d in semantic_domains if d != domain]
        return domains[:5]

    def _generate_dynamic_actions(
        self,
        user_message: str,
        assistant_response: str,
        domain: str,
        emotion: str,
        response_type: ResponseType,
    ) -> List[SuggestedActionSchema]:
        """Use the LLM for quick replies so the UI does not feel scripted."""
        labels = self.llm_client.generate_quick_replies(
            user_message=user_message,
            assistant_response=assistant_response,
            domain=domain,
            emotion=emotion,
        )

        if not labels:
            return []

        actions = []
        for label in labels:
            label_lower = label.lower()
            action_type = response_type.value
            if "mentor" in label_lower or "book" in label_lower or "session" in label_lower:
                action_type = ResponseType.BOOK_MENTOR.value
            elif "resource" in label_lower or "read" in label_lower or "exercise" in label_lower:
                action_type = ResponseType.RESOURCE.value
            elif response_type == ResponseType.CHAT:
                action_type = ResponseType.GUIDE.value

            actions.append(SuggestedActionSchema(
                type=action_type,
                label=label,
                data={"domain": domain}
            ))

        return actions

    def _build_system_prompt(
        self,
        domain: str,
        perception_data: Dict[str, Any],
        user_summary: str,
        emotion_analysis: Dict[str, Any],
        domain_result: Dict[str, Any],
        user_memory: Dict[str, Any],
    ) -> str:
        """Build system prompt for LLM"""

        domain_context = self.domain_classifier.get_domain_context(domain)

        crisis_guidance = """
CRISIS SAFETY:
- If the user may harm themselves or someone else, respond calmly and directly.
- Encourage them to contact local emergency services or a trusted person immediately.
- Do not provide methods, instructions, or anything that could enable harm.
- Stay supportive and concise.
""" if perception_data.get('requires_professional_help') else ""

        prompt = f"""You are Fundoo, a warm, empathetic, and non-judgmental life companion AI for LifeFundies.

CORE PERSONALITY:
- Think like a thoughtful coach having a real conversation, not a scripted FAQ bot
- Be warm, specific, and supportive without sounding clinical
- Use simple, natural language and adapt to the user's words
- Give practical guidance only after reflecting the user's actual situation
- Encourage without being pushy and share wisdom without preaching
- Respect Indian student/professional context when relevant
- Never claim to be a doctor, therapist, lawyer, or financial advisor

CURRENT CONTEXT:
- User Focus Area: {domain} ({domain_context})
- Mentor Category: {domain_result['mentor_category']}
- Domain Confidence: {domain_result['confidence']}
- User Intent: {perception_data['intent']}
- Current Mood: {emotion_analysis['emotion']}
- Empathy Level: {emotion_analysis['empathy_level']}
- Sentiment Score: {emotion_analysis['sentiment_score']}
- User Profile: {user_summary}
- Memory Context: {user_memory.get('episodic', [])}

RESPONSE STYLE:
- Start with a specific acknowledgement of the user's message, not a generic greeting
- Give one clear insight, then 2-4 practical next steps tailored to this exact message
- Ask exactly one thoughtful follow-up question
- Keep the response under 180 words unless the user asks for depth
- Use markdown bullets only when they improve clarity
- Do not repeat the same opening line across turns
- Do not mention internal labels like intent, domain, response type, or emotion

GUIDELINES:
1. Acknowledge and validate the user's feelings
2. Ask thoughtful follow-up questions
3. Provide practical, actionable advice when appropriate
4. Know when to suggest professional help
5. Keep responses concise and conversational
6. Use "you" and "I" language, not "one"
7. Do not overuse emojis

IMPORTANT: This is a supportive conversation, not therapy. If the user shows signs of serious mental health crisis, gently suggest professional help.
{crisis_guidance}

Respond in a warm, supportive manner that feels like talking to a caring friend."""

        return prompt
