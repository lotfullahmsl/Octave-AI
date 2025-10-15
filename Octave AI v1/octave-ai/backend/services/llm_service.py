"""
Simplified LLM Service - Groq Only
"""
import os
import logging
from typing import Dict, Any
import json

# Import Groq client only
try:
    from groq import Groq
except ImportError:
    Groq = None

class LLMService:
    def __init__(self):
        """Initialize Groq client only"""
        self.groq_client = None
        groq_key = os.getenv('GROQ_API_KEY')
        
        if not groq_key:
            logging.error("❌ GROQ_API_KEY not found in environment variables")
            return
        
        if not Groq:
            logging.error("❌ Groq library not installed")
            return
        
        try:
            # Simple, clean initialization without extra parameters
            self.groq_client = Groq(api_key=groq_key)
            logging.info("✅ Groq client initialized successfully")
            
        except Exception as e:
            logging.error(f"❌ Failed to initialize Groq: {e}")
            logging.error(f"Error details: {str(e)}")
            self.groq_client = None

    def generate_script(self, description: str, meta_prompt: str) -> Dict[str, Any]:
        """Generate script using Groq only"""
        if not self.groq_client:
            logging.warning("❌ Groq client not available, using fallback")
            return self._generate_fallback_script(description)
        
        try:
            prompt = f"""
            AI Voice Agent Description: {description}
            Voice Requirements: {meta_prompt}

            Generate a realistic conversation sample that this AI voice agent would say during a typical interaction. The script should:
            1. Be 2-4 sentences long (perfect for voice evaluation)
            2. Sound like actual dialogue the AI agent would speak to users
            3. Match the tone and style indicated in the voice requirements
            4. Include natural conversational elements (greetings, transitions, or responses)
            5. Be representative of how the agent would actually communicate in its role
            6. Be suitable for text-to-speech conversion

            Return only the conversation sample text that the AI agent would speak, nothing else.
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are an expert at creating realistic AI voice agent dialogue samples. Generate natural, authentic conversation snippets that sound exactly like what an AI agent would say during real interactions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            script = response.choices[0].message.content.strip()
            logging.info("✅ Script generated using Groq")
            
            return {
                "script": script,
                "model_used": "groq",
                "success": True
            }
            
        except Exception as e:
            logging.error(f"❌ Groq script generation failed: {e}")
            return self._generate_fallback_script(description)

    def analyze_project_tone(self, description: str) -> Dict[str, Any]:
        """Analyze project tone using Groq only"""
        if not self.groq_client:
            logging.warning("❌ Groq client not available, using fallback analysis")
            return self._get_fallback_analysis()
        
        try:
            prompt = f"""
            Analyze this project description and return a JSON object with the following structure:
            {{
                "tone": "professional|friendly|calm|energetic|authoritative",
                "target_audience": "general|business|healthcare|education|technology",
                "style": "conversational|formal|casual|technical"
            }}
            
            Project: {description}
            
            Return only valid JSON, no other text.
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are an expert in voice and communication analysis. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            try:
                analysis = json.loads(result_text)
                logging.info("✅ Project analysis completed using Groq")
                return analysis
            except json.JSONDecodeError:
                logging.warning("❌ Failed to parse Groq JSON response, using fallback")
                return self._get_fallback_analysis()
                
        except Exception as e:
            logging.error(f"❌ Groq analysis failed: {e}")
            return self._get_fallback_analysis()

    def _generate_fallback_script(self, description: str) -> Dict[str, Any]:
        """Fallback script generation"""
        script = f"{description}\n\nThis script has been optimized for professional tone and general use case. The delivery should be natural and engaging, with appropriate pacing and emphasis to match your project's requirements."
        
        return {
            "script": script,
            "model_used": "fallback",
            "success": True
        }

    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Fallback analysis"""
        return {
            "tone": "professional",
            "target_audience": "general",
            "style": "conversational"
        }

    def is_available(self) -> bool:
        """Check if Groq service is available"""
        return self.groq_client is not None