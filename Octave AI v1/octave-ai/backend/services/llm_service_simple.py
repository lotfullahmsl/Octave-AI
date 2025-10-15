"""
Simplified LLM Service - Groq Only
"""
import os
import logging
from typing import Dict, Any
from groq import Groq

class LLMService:
    def __init__(self):
        """Initialize Groq client only"""
        groq_key = os.getenv('GROQ_API_KEY')
        
        if not groq_key:
            logging.error("GROQ_API_KEY not found in environment variables")
            self.groq_client = None
            return
        
        try:
            self.groq_client = Groq(api_key=groq_key)
            logging.info("✅ Groq client initialized successfully")
        except Exception as e:
            logging.error(f"❌ Failed to initialize Groq: {e}")
            self.groq_client = None

    def generate_script(self, description: str, meta_prompt: str) -> Dict[str, Any]:
        """Generate script using Groq only"""
        if not self.groq_client:
            logging.warning("Groq client not available, using fallback")
            return self._get_fallback_script(description, meta_prompt)
        
        try:
            prompt = f"""
            Project Description: {description}
            Voice Requirements: {meta_prompt}
            
            Generate a professional, engaging script for this project. The script should:
            1. Be 2-3 sentences long (perfect for voice demos)
            2. Match the tone and style indicated in the voice requirements
            3. Be suitable for text-to-speech conversion
            4. Sound natural and conversational
            5. Represent the project's purpose clearly
            
            Return only the script text, nothing else.
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a professional script writer specializing in TTS content. Generate natural, engaging scripts."},
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
            return self._get_fallback_script(description, meta_prompt)

    def analyze_project_tone(self, description: str) -> Dict[str, Any]:
        """Analyze project tone using Groq only"""
        if not self.groq_client:
            logging.warning("Groq client not available, using fallback analysis")
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
                analysis = eval(result_text)  # Simple JSON parsing
                logging.info("✅ Project analysis completed using Groq")
                return analysis
            except:
                logging.warning("Failed to parse Groq JSON response, using fallback")
                return self._get_fallback_analysis()
                
        except Exception as e:
            logging.error(f"❌ Groq analysis failed: {e}")
            return self._get_fallback_analysis()

    def _get_fallback_script(self, description: str, meta_prompt: str) -> Dict[str, Any]:
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