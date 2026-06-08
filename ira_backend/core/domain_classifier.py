from typing import Dict, Optional

class DomainClassifier:
    """Maps user input to 18 LifeFundies life domains"""

    DOMAINS = [
        'Career & Purpose',
        'Emotional Well-being',
        'Relationships',
        'Financial Freedom',
        'Health & Fitness',
        'Confidence & Self-Image',
        'Motivation & Discipline',
        'Work-Life Balance',
        'Personal Growth',
        'Stress Management',
        'Time Management',
        'Communication Skills',
        'Decision Making',
        'Learning & Development',
        'Social Skills',
        'Creativity & Innovation',
        'Life Planning',
        'Mindfulness & Well-being',
    ]

    DOMAIN_KEYWORDS = {
        'Career & Purpose': ['career', 'job', 'work', 'purpose', 'passion', 'goals', 'professional', 'placement', 'future', 'direction'],
        'Emotional Well-being': ['emotion', 'feeling', 'mental health', 'depression', 'anxiety'],
        'Relationships': ['relationship', 'partner', 'spouse', 'love', 'dating', 'marriage', 'friend', 'family', 'breakup'],
        'Financial Freedom': ['money', 'finance', 'investment', 'budget', 'debt', 'saving'],
        'Health & Fitness': ['health', 'fitness', 'exercise', 'diet', 'nutrition', 'gym', 'weight'],
        'Confidence & Self-Image': ['confidence', 'self-esteem', 'body image', 'self-worth', 'shy', 'insecure', 'image'],
        'Motivation & Discipline': ['motivation', 'discipline', 'procrastination', 'procrastinate', 'focused', 'habit'],
        'Work-Life Balance': ['balance', 'burnout', 'stress', 'schedule', 'workaholic'],
        'Personal Growth': ['growth', 'development', 'learning', 'improvement', 'skill'],
        'Stress Management': ['stress', 'anxiety', 'overwhelmed', 'overthinking', 'overthink', 'ruminate', 'meditation', 'relax'],
        'Time Management': ['time', 'schedule', 'deadline', 'organize', 'priority', 'productivity', 'focus'],
        'Communication Skills': ['communication', 'communicate', 'speak', 'listening', 'conversation', 'express', 'present'],
        'Decision Making': ['decision', 'choice', 'dilemma', 'uncertain'],
        'Learning & Development': ['learning', 'education', 'course', 'certification'],
        'Social Skills': ['social', 'introvert', 'networking', 'friend', 'connection'],
        'Creativity & Innovation': ['creativity', 'art', 'design', 'problem solving'],
        'Life Planning': ['plan', 'future', 'roadmap', 'vision', 'milestone'],
        'Mindfulness & Well-being': ['mindfulness', 'meditation', 'yoga', 'spirituality', 'peace'],
    }

    MENTOR_CATEGORIES = {
        'Career & Purpose': 'Career Coach',
        'Emotional Well-being': 'Emotional Guide',
        'Relationships': 'Relationship Guide',
        'Financial Freedom': 'Financial Coach',
        'Health & Fitness': 'Health Coach',
        'Confidence & Self-Image': 'Confidence Coach',
        'Motivation & Discipline': 'Productivity Coach',
        'Work-Life Balance': 'Work-Life Coach',
        'Personal Growth': 'Personal Growth Coach',
        'Stress Management': 'Stress & Clarity Coach',
        'Time Management': 'Productivity Coach',
        'Communication Skills': 'Communication Coach',
        'Decision Making': 'Decision Coach',
        'Learning & Development': 'Learning Coach',
        'Social Skills': 'Social Confidence Coach',
        'Creativity & Innovation': 'Creativity Coach',
        'Life Planning': 'Life Planning Coach',
        'Mindfulness & Well-being': 'Mindfulness Guide',
    }

    def classify_domain(self, text: str, current_domain: Optional[str] = None) -> str:
        """Classify text to a domain"""
        text_lower = text.lower()
        domain_scores = {}

        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            domain_scores[domain] = score

        max_score = max(domain_scores.values()) if domain_scores else 0

        if max_score > 0:
            return [d for d, s in domain_scores.items() if s == max_score][0]

        return current_domain or 'Personal Growth'

    def classify_with_confidence(self, text: str, current_domain: Optional[str] = None) -> Dict[str, object]:
        """Classify text and include confidence + mentor category for routing."""
        text_lower = text.lower()
        domain_scores = {
            domain: sum(1 for keyword in keywords if keyword in text_lower)
            for domain, keywords in self.DOMAIN_KEYWORDS.items()
        }
        max_score = max(domain_scores.values()) if domain_scores else 0
        total_score = sum(domain_scores.values())
        domain = self.classify_domain(text, current_domain)
        confidence = 0.35 if max_score == 0 else min(0.98, 0.55 + (max_score / max(total_score, 1)) * 0.4)

        return {
            'domain': domain,
            'confidence': round(confidence, 2),
            'mentor_category': self.MENTOR_CATEGORIES.get(domain, 'LifeFundies Guide'),
            'scores': domain_scores,
        }

    def list_domains(self):
        return [
            {
                'name': domain,
                'description': self.get_domain_context(domain),
                'mentorCategory': self.MENTOR_CATEGORIES.get(domain, 'LifeFundies Guide'),
                'keywords': self.DOMAIN_KEYWORDS.get(domain, []),
            }
            for domain in self.DOMAINS
        ]

    def get_domain_context(self, domain: str) -> str:
        """Get context description for a domain"""
        descriptions = {
            'Career & Purpose': 'career decisions and professional growth',
            'Emotional Well-being': 'emotional health and mental wellness',
            'Relationships': 'romantic and personal relationships',
            'Financial Freedom': 'financial planning and wealth building',
            'Health & Fitness': 'physical health and fitness routines',
            'Confidence & Self-Image': 'self-esteem and body positivity',
            'Motivation & Discipline': 'motivation and habit formation',
            'Work-Life Balance': 'managing work and personal time',
            'Personal Growth': 'learning and continuous improvement',
            'Stress Management': 'managing stress and anxiety',
            'Time Management': 'productivity and time organization',
            'Communication Skills': 'effective communication',
            'Decision Making': 'making confident decisions',
            'Learning & Development': 'skill and knowledge development',
            'Social Skills': 'social interactions and networking',
            'Creativity & Innovation': 'creative thinking and innovation',
            'Life Planning': 'goal setting and life vision',
            'Mindfulness & Well-being': 'mindfulness and holistic wellness',
        }
        return descriptions.get(domain, 'personal development')
