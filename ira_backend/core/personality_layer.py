from typing import Dict, Any

class PersonalityLayer:
    """Refines tone and content to match Fundoo personality"""

    PERSONALITY_TRAITS = {
        'warm': True,
        'non_clinical': True,
        'non_judgmental': True,
        'empathetic': True,
        'encouraging': True,
    }

    TONE_ADJUSTMENTS = {
        'happy': {'warmth': 1.2, 'enthusiasm': 1.3},
        'sad': {'warmth': 1.5, 'empathy': 1.5},
        'stressed': {'calmness': 1.3, 'reassurance': 1.4},
        'anxious': {'reassurance': 1.5, 'calmness': 1.4},
        'confused': {'clarity': 1.3, 'step_by_step': 1.2},
        'angry': {'validation': 1.3, 'calmness': 1.2},
        'grateful': {'positivity': 1.3, 'encouragement': 1.2},
        'neutral': {'professionalism': 1.0, 'warmth': 1.0},
    }

    def refine_response(self,
                       raw_response: str,
                       emotion: str,
                       domain: str) -> str:
        """Refine LLM response to match personality"""

        # Get tone adjustments
        adjustments = self.TONE_ADJUSTMENTS.get(emotion, {})

        # Refine response
        refined = self.apply_tone_adjustments(raw_response, adjustments)
        refined = self.ensure_warmth(refined)
        refined = self.remove_clinical_language(refined)

        return refined

    def apply_tone_adjustments(self, text: str, adjustments: Dict[str, float]) -> str:
        """Apply tone adjustments to text"""

        if adjustments.get('warmth', 1.0) > 1.1:
            text = text.replace('you should', 'I think you could')
            text = text.replace('it is', 'it feels like')

        if adjustments.get('reassurance', 1.0) > 1.2:
            text = text.replace("Don't worry", "Let's slow this down")

        if adjustments.get('clarity', 1.0) > 1.2:
            # Add structure for clarity
            text = self.add_structure(text)

        return text

    def ensure_warmth(self, text: str) -> str:
        """Ensure response is warm and approachable"""

        # Replace cold language
        replacements = {
            'you must': 'you might consider',
            'you should': 'you could',
            'you cannot': 'it might be challenging to',
            'impossible': 'really difficult',
            'wrong': 'different approach to',
        }

        for cold, warm in replacements.items():
            text = text.replace(cold, warm)

        return text

    def remove_clinical_language(self, text: str) -> str:
        """Remove clinical/medical jargon"""

        clinical_replacements = {
            'pathology': 'challenge',
            'diagnosis': 'observation',
            'therapeutic': 'supportive',
            'clinical': 'practical',
            'syndrome': 'pattern',
        }

        for clinical, friendly in clinical_replacements.items():
            text = text.replace(clinical, friendly)

        return text

    def add_structure(self, text: str) -> str:
        """Add structure for clarity"""
        # This is a simple implementation
        # In production, use more sophisticated NLP
        sentences = text.split('. ')
        if len(sentences) > 3:
            # Group into logical sections
            return '. '.join(sentences)
        return text
