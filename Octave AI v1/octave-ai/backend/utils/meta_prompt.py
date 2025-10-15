"""
Generates meta prompts for voice generation
Examples: "Calm, confident tone for healthcare professionals"
"""
import random
from typing import Dict, List

def generate_meta_prompt(description: str, variation: bool = False, user_tone: str = "", use_case: str = "") -> str:
    """
    Generate a meta prompt based on project description and user preferences
    
    Args:
        description: Project description
        variation: If True, generate a variation of the prompt
        user_tone: User-selected tone preference
        use_case: User-selected use case
    
    Returns:
        Meta prompt string
    """
    
    # Analyze description for keywords
    desc_lower = description.lower()
    
    # Determine industry/domain
    domain = _detect_domain(desc_lower)
    
    # Use user preferences if provided, otherwise detect from content
    if user_tone:
        tone = user_tone.lower()
    else:
        tone = _detect_tone(desc_lower, domain)
    
    # Determine style (can be influenced by use case)
    if use_case:
        style = _get_style_for_use_case(use_case)
    else:
        style = _detect_style(desc_lower, domain)
    
    # Determine target audience (can be influenced by use case)
    if use_case:
        audience = _get_audience_for_use_case(use_case)
    else:
        audience = _detect_audience(desc_lower, domain)
    
    # Generate meta prompt
    if variation:
        # Generate a variation for regeneration
        tone = _get_tone_variation(tone)
        style = _get_style_variation(style)
    
    meta_prompt = f"{tone}, {style} tone for {audience}"
    
    # Add domain-specific modifiers
    if domain == 'healthcare':
        meta_prompt += " with professional medical clarity"
    elif domain == 'education':
        meta_prompt += " with engaging educational warmth"
    elif domain == 'business':
        meta_prompt += " with corporate professionalism"
    elif domain == 'technology':
        meta_prompt += " with modern technical confidence"
    elif domain == 'customer_service':
        meta_prompt += " with helpful service orientation"
    
    return meta_prompt

def _detect_domain(description: str) -> str:
    """Detect the domain/industry from description"""
    
    healthcare_keywords = ['medical', 'health', 'doctor', 'patient', 'clinic', 'hospital', 'appointment', 'lab', 'prescription']
    education_keywords = ['education', 'learning', 'student', 'teacher', 'course', 'school', 'university', 'training']
    business_keywords = ['business', 'corporate', 'company', 'enterprise', 'professional', 'office', 'meeting']
    tech_keywords = ['software', 'app', 'technology', 'digital', 'platform', 'system', 'api', 'data']
    service_keywords = ['customer', 'support', 'help', 'service', 'assistance', 'booking', 'reservation']
    
    if any(keyword in description for keyword in healthcare_keywords):
        return 'healthcare'
    elif any(keyword in description for keyword in education_keywords):
        return 'education'
    elif any(keyword in description for keyword in business_keywords):
        return 'business'
    elif any(keyword in description for keyword in tech_keywords):
        return 'technology'
    elif any(keyword in description for keyword in service_keywords):
        return 'customer_service'
    else:
        return 'general'

def _detect_tone(description: str, domain: str) -> str:
    """Detect appropriate tone"""
    
    if domain == 'healthcare':
        return random.choice(['calm', 'reassuring', 'professional', 'caring'])
    elif domain == 'education':
        return random.choice(['friendly', 'encouraging', 'clear', 'engaging'])
    elif domain == 'business':
        return random.choice(['professional', 'confident', 'authoritative', 'polished'])
    elif domain == 'technology':
        return random.choice(['modern', 'clear', 'confident', 'innovative'])
    elif domain == 'customer_service':
        return random.choice(['helpful', 'friendly', 'patient', 'welcoming'])
    else:
        return random.choice(['warm', 'professional', 'friendly', 'clear'])

def _detect_style(description: str, domain: str) -> str:
    """Detect appropriate style"""
    
    if 'formal' in description or 'official' in description:
        return 'formal'
    elif 'casual' in description or 'relaxed' in description:
        return 'conversational'
    elif 'energetic' in description or 'exciting' in description:
        return 'energetic'
    elif domain == 'healthcare':
        return random.choice(['gentle', 'measured', 'clear'])
    elif domain == 'education':
        return random.choice(['engaging', 'enthusiastic', 'clear'])
    elif domain == 'business':
        return random.choice(['polished', 'articulate', 'confident'])
    else:
        return random.choice(['conversational', 'natural', 'approachable'])

def _detect_audience(description: str, domain: str) -> str:
    """Detect target audience"""
    
    if domain == 'healthcare':
        if 'patient' in description:
            return 'patients and families'
        else:
            return 'healthcare professionals'
    elif domain == 'education':
        if 'student' in description:
            return 'students and learners'
        else:
            return 'educational community'
    elif domain == 'business':
        if 'customer' in description or 'client' in description:
            return 'business clients'
        else:
            return 'business professionals'
    elif domain == 'technology':
        return 'technology users'
    elif domain == 'customer_service':
        return 'customers and users'
    else:
        return 'general audience'

def _get_tone_variation(current_tone: str) -> str:
    """Get a variation of the current tone"""
    
    tone_variations = {
        'calm': ['reassuring', 'gentle', 'peaceful'],
        'professional': ['polished', 'authoritative', 'confident'],
        'friendly': ['warm', 'welcoming', 'approachable'],
        'confident': ['assured', 'strong', 'decisive'],
        'caring': ['compassionate', 'nurturing', 'supportive'],
        'clear': ['articulate', 'precise', 'direct'],
        'engaging': ['captivating', 'dynamic', 'compelling'],
        'helpful': ['supportive', 'accommodating', 'attentive']
    }
    
    variations = tone_variations.get(current_tone, ['warm', 'professional', 'clear'])
    return random.choice(variations)

def _get_style_variation(current_style: str) -> str:
    """Get a variation of the current style"""
    
    style_variations = {
        'conversational': ['natural', 'casual', 'relaxed'],
        'formal': ['structured', 'official', 'ceremonial'],
        'energetic': ['dynamic', 'vibrant', 'enthusiastic'],
        'gentle': ['soft', 'tender', 'mild'],
        'measured': ['deliberate', 'thoughtful', 'steady'],
        'engaging': ['interactive', 'compelling', 'captivating'],
        'polished': ['refined', 'sophisticated', 'elegant']
    }
    
    variations = style_variations.get(current_style, ['natural', 'clear', 'approachable'])
    return random.choice(variations)

def _get_style_for_use_case(use_case: str) -> str:
    """Get appropriate style based on use case"""
    use_case_lower = use_case.lower()
    
    if 'app introduction' in use_case_lower or 'demo' in use_case_lower:
        return 'engaging'
    elif 'customer service' in use_case_lower or 'support' in use_case_lower:
        return 'helpful'
    elif 'presentation' in use_case_lower or 'business' in use_case_lower:
        return 'professional'
    elif 'education' in use_case_lower or 'tutorial' in use_case_lower:
        return 'clear'
    elif 'marketing' in use_case_lower or 'advertisement' in use_case_lower:
        return 'persuasive'
    elif 'announcement' in use_case_lower or 'news' in use_case_lower:
        return 'authoritative'
    else:
        return 'conversational'

def _get_audience_for_use_case(use_case: str) -> str:
    """Get appropriate audience based on use case"""
    use_case_lower = use_case.lower()
    
    if 'app introduction' in use_case_lower:
        return 'app users'
    elif 'customer service' in use_case_lower:
        return 'customers'
    elif 'business presentation' in use_case_lower:
        return 'business professionals'
    elif 'education' in use_case_lower:
        return 'learners'
    elif 'marketing' in use_case_lower:
        return 'potential customers'
    elif 'healthcare' in use_case_lower:
        return 'patients'
    else:
        return 'general audience'

# Example usage and testing
if __name__ == "__main__":
    # Test examples
    test_descriptions = [
        "A medical appointment scheduling assistant that helps patients book appointments and check lab results",
        "An educational platform for students to learn programming concepts",
        "A business meeting scheduler for corporate teams",
        "A customer support chatbot for an e-commerce website"
    ]
    
    for desc in test_descriptions:
        prompt = generate_meta_prompt(desc)
        variation = generate_meta_prompt(desc, variation=True)
        print(f"Description: {desc}")
        print(f"Meta Prompt: {prompt}")
        print(f"Variation: {variation}")
        print("-" * 50)