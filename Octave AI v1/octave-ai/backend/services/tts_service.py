"""
TTS Service for ElevenLabs, OpenAI TTS, Azure Speech, etc.
"""
import os
import requests
import logging
import tempfile
import io
from typing import Dict, List, Any, Optional
import json

class TTSService:
    def __init__(self):
        # API Keys
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.azure_key = os.getenv('AZURE_SPEECH_KEY')
        self.azure_region = os.getenv('AZURE_SPEECH_REGION')
        
        # Available providers
        self.providers = []
        if self.groq_key:
            self.providers.append('groq')
        if self.elevenlabs_key:
            self.providers.append('elevenlabs')
        if self.openai_key:
            self.providers.append('openai')
        if self.azure_key:
            self.providers.append('azure')
    
    def get_recommended_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """
        Get voice recommendations based on project characteristics
        Only show providers with valid API keys
        """
        try:
            recommendations = []
            
            # Only show ElevenLabs for now (first version)
            if 'elevenlabs' in self.providers and self.elevenlabs_key:
                elevenlabs_voices = self._get_elevenlabs_voices(tone, target_audience, style)
                recommendations.extend(elevenlabs_voices)
            
            # Other providers are hidden until API keys are added
            # Uncomment when API keys are available:
            
            # if os.getenv('GROQ_API_KEY'):
            #     groq_voices = self._get_groq_voices(tone, target_audience, style)
            #     recommendations.extend(groq_voices)
            
            # if 'openai' in self.providers and self.openai_key:
            #     openai_voices = self._get_openai_voices(tone, target_audience, style)
            #     recommendations.extend(openai_voices)
            
            # if 'azure' in self.providers and self.azure_key:
            #     azure_voices = self._get_azure_voices(tone, target_audience, style)
            #     recommendations.extend(azure_voices)
            
            # If no providers available, return empty list for clean UI
            if not recommendations:
                logging.warning("No TTS providers with valid API keys found")
                return []
            
            return recommendations
            
        except Exception as e:
            logging.error(f"Error getting voice recommendations: {str(e)}")
            return []
    
    def _get_groq_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """Get Groq TTS voice recommendations using playai-tts model"""
        voices = [
            {
                "id": "Fritz-PlayAI",
                "provider": "Groq",
                "name": "Fritz-PlayAI",
                "cost": "Free",
                "description": "Clear and professional AI voice",
                "gender": "male",
                "accent": "American",
                "duration": "3.8s",
                "speed": "Fast",
                "quality": "High",
                "model": "playai-tts"
            }
        ]
        return voices

    def _get_elevenlabs_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """Get ElevenLabs voice recommendations"""
        voices = [
            {
                "id": "elevenlabs_rachel",
                "provider": "ElevenLabs",
                "name": "Rachel",
                "cost": "$0.030",
                "description": "Calm and professional",
                "gender": "female",
                "accent": "American",
                "duration": "4.2s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_josh",
                "provider": "ElevenLabs", 
                "name": "Josh",
                "cost": "$0.030",
                "description": "Deep and authoritative",
                "gender": "male",
                "accent": "American",
                "duration": "4.1s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_bella",
                "provider": "ElevenLabs",
                "name": "Bella",
                "cost": "$0.030",
                "description": "Soft and gentle",
                "gender": "female",
                "accent": "American",
                "duration": "4.3s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_antoni",
                "provider": "ElevenLabs",
                "name": "Antoni",
                "cost": "$0.030",
                "description": "Well-rounded and versatile",
                "gender": "male",
                "accent": "American",
                "duration": "4.2s",
                "speed": "Medium",
                "quality": "Premium"
            }
        ]
        return voices
    
    def _get_openai_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """Get OpenAI voice recommendations"""
        voices = [
            {
                "id": "openai_nova",
                "provider": "OpenAI",
                "name": "Nova",
                "cost": "0.015",
                "description": "Warm and engaging",
                "gender": "female",
                "accent": "American",
                "duration": "4.0s"
            },
            {
                "id": "openai_alloy",
                "provider": "OpenAI",
                "name": "Alloy", 
                "cost": "0.015",
                "description": "Neutral and professional",
                "gender": "neutral",
                "accent": "American",
                "duration": "4.1s"
            }
        ]
        return voices
    
    def _get_azure_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """Get Azure Speech voice recommendations"""
        voices = [
            {
                "id": "azure_jenny",
                "provider": "Azure",
                "name": "Jenny",
                "cost": "0.020",
                "description": "Clear and articulate",
                "gender": "female",
                "accent": "American",
                "duration": "4.3s"
            },
            {
                "id": "azure_guy",
                "provider": "Azure",
                "name": "Guy",
                "cost": "0.020", 
                "description": "Professional and confident",
                "gender": "male",
                "accent": "American",
                "duration": "4.2s"
            }
        ]
        return voices
    
    def _get_mock_voices(self) -> List[Dict[str, Any]]:
        """Mock voices - only show ElevenLabs for first version"""
        return [
            # Only ElevenLabs voices for first version
            # Other providers hidden until API keys are added
            
            # ElevenLabs Voices
            {
                "id": "elevenlabs_rachel",
                "provider": "ElevenLabs",
                "name": "Rachel",
                "cost": "$0.030",
                "description": "Calm and professional",
                "gender": "female",
                "accent": "American",
                "duration": "5.1s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_josh",
                "provider": "ElevenLabs",
                "name": "Josh",
                "cost": "$0.030",
                "description": "Rich and smooth",
                "gender": "male", 
                "accent": "American",
                "duration": "5.2s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_bella",
                "provider": "ElevenLabs",
                "name": "Bella",
                "cost": "$0.030",
                "description": "Soft and gentle",
                "gender": "female",
                "accent": "American", 
                "duration": "5.0s",
                "speed": "Medium",
                "quality": "Premium"
            },
            {
                "id": "elevenlabs_antoni",
                "provider": "ElevenLabs",
                "name": "Antoni",
                "cost": "$0.030",
                "description": "Well-rounded and versatile",
                "gender": "male",
                "accent": "American",
                "duration": "4.2s",
                "speed": "Medium",
                "quality": "Premium"
            }
            
            # Other providers hidden for first version:
            # OpenAI, Azure, Play.ht, Groq
            # Will be shown when API keys are added
        ]
    
    def generate_audio(self, voice_id: str, text: str, settings: Dict[str, Any] = None) -> Optional[bytes]:
        """
        Generate audio using the specified voice
        """
        try:
            provider = voice_id.split('_')[0]
            
            if provider == 'groq' and os.getenv('GROQ_API_KEY'):
                return self._generate_groq_audio(voice_id, text, settings)
            elif voice_id == 'Fritz-PlayAI' and os.getenv('GROQ_API_KEY'):
                return self._generate_groq_audio(voice_id, text, settings)
            elif provider == 'openai' and self.openai_key:
                return self._generate_openai_audio(voice_id, text, settings)
            elif provider == 'elevenlabs' and self.elevenlabs_key:
                return self._generate_elevenlabs_audio(voice_id, text, settings)
            elif provider == 'azure' and self.azure_key:
                return self._generate_azure_audio(voice_id, text, settings)
            else:
                # Try free TTS as fallback
                return self._generate_free_tts_audio(voice_id, text, settings)
                
        except Exception as e:
            logging.error(f"Error generating audio: {str(e)}")
            return self._generate_free_tts_audio(voice_id, text, settings)
    
    def _generate_elevenlabs_audio(self, voice_id: str, text: str, settings: Dict[str, Any]) -> Optional[bytes]:
        """Generate audio using ElevenLabs API"""
        try:
            # Map our voice IDs to ElevenLabs voice IDs
            voice_mapping = {
                'elevenlabs_rachel': 'pNInz6obpgDQGcFmaJgB',  # Rachel
                'elevenlabs_josh': 'TxGEqnHWrfWFTfGW9XjX',   # Josh
                'elevenlabs_bella': 'EXAVITQu4vr4xnSDxMaL',  # Bella
                'elevenlabs_antoni': 'ErXwobaYiN019PkySvjV', # Antoni
                'elevenlabs_elli': 'MF3mGyEYCl7XYWbV9V6O',   # Elli
                'elevenlabs_domi': 'AZnzlk1XvdvUeBnXmlld'    # Domi
            }
            
            # Get the actual ElevenLabs voice ID
            elevenlabs_voice_id = voice_mapping.get(voice_id, 'pNInz6obpgDQGcFmaJgB')  # Default to Rachel
            
            # ElevenLabs API endpoint
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{elevenlabs_voice_id}"
            
            # Request headers
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.elevenlabs_key
            }
            
            # Request data
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": settings.get('stability', 0.5),
                    "similarity_boost": settings.get('similarity_boost', 0.75),
                    "style": settings.get('style', 0.0),
                    "use_speaker_boost": settings.get('use_speaker_boost', True)
                }
            }
            
            # Make the request
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                logging.info(f"Successfully generated ElevenLabs audio for {voice_id}")
                return response.content
            else:
                logging.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logging.error(f"Error generating ElevenLabs audio: {str(e)}")
            return None
    
    def _generate_openai_audio(self, voice_id: str, text: str, settings: Dict[str, Any]) -> Optional[bytes]:
        """Generate audio using OpenAI TTS API"""
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_key)
            
            # Map our voice IDs to OpenAI voice names
            voice_mapping = {
                'openai_nova': 'nova',
                'openai_alloy': 'alloy',
                'openai_echo': 'echo',
                'openai_fable': 'fable',
                'openai_onyx': 'onyx',
                'openai_shimmer': 'shimmer'
            }
            
            openai_voice = voice_mapping.get(voice_id, 'nova')
            
            # Generate speech
            response = client.audio.speech.create(
                model="tts-1",  # or "tts-1-hd" for higher quality
                voice=openai_voice,
                input=text,
                response_format="mp3"
            )
            
            logging.info(f"Successfully generated OpenAI audio for {voice_id}")
            return response.content
            
        except Exception as e:
            logging.error(f"Error generating OpenAI audio: {str(e)}")
            return None
    
    def _generate_azure_audio(self, voice_id: str, text: str, settings: Dict[str, Any]) -> Optional[bytes]:
        """Generate audio using Azure Speech API"""
        # Implementation would go here
        logging.info(f"Would generate Azure audio for {voice_id}")
        return None
    
    def _generate_free_tts_audio(self, voice_id: str, text: str, settings: Dict[str, Any]) -> Optional[bytes]:
        """Generate audio using free TTS as fallback"""
        try:
            # Try using gTTS (Google Text-to-Speech) as free fallback
            try:
                from gtts import gTTS
                import io
                
                # Create gTTS object
                tts = gTTS(text=text, lang='en', slow=False)
                
                # Save to bytes buffer
                audio_buffer = io.BytesIO()
                tts.write_to_fp(audio_buffer)
                audio_buffer.seek(0)
                
                logging.info(f"Successfully generated free TTS audio for {voice_id}")
                return audio_buffer.read()
                
            except ImportError:
                logging.warning("gTTS not available, trying pyttsx3")
                # Try pyttsx3 as another fallback
                try:
                    import pyttsx3
                    import tempfile
                    
                    engine = pyttsx3.init()
                    
                    # Adjust voice properties based on voice_id
                    voices = engine.getProperty('voices')
                    if voices:
                        if 'female' in voice_id or 'nova' in voice_id or 'rachel' in voice_id:
                            # Try to find female voice
                            for voice in voices:
                                if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                                    engine.setProperty('voice', voice.id)
                                    break
                        else:
                            # Use male voice
                            for voice in voices:
                                if 'male' in voice.name.lower() or 'david' in voice.name.lower():
                                    engine.setProperty('voice', voice.id)
                                    break
                    
                    # Set speech rate
                    engine.setProperty('rate', 150)
                    
                    # Save to temporary file
                    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                        engine.save_to_file(text, temp_file.name)
                        engine.runAndWait()
                        
                        # Read the file
                        with open(temp_file.name, 'rb') as f:
                            audio_data = f.read()
                        
                        # Clean up
                        os.unlink(temp_file.name)
                        
                        logging.info(f"Successfully generated pyttsx3 audio for {voice_id}")
                        return audio_data
                        
                except ImportError:
                    logging.warning("No TTS libraries available")
                    return None
                    
        except Exception as e:
            logging.error(f"Error generating free TTS audio: {str(e)}")
            return None
    
    def _generate_groq_audio(self, voice_id: str, text: str, settings: Dict[str, Any]) -> Optional[bytes]:
        """Generate audio using Groq TTS API"""
        try:
            from groq import Groq
            client = Groq(api_key=os.getenv('GROQ_API_KEY'))
            
            # Use Fritz-PlayAI as default voice for playai-tts model
            groq_voice = 'Fritz-PlayAI'
            
            logging.info(f"Generating Groq TTS audio with model: playai-tts, voice: {groq_voice}")
            
            # Generate speech using Groq TTS with playai-tts model
            response = client.audio.speech.create(
                model="playai-tts",
                voice=groq_voice,
                input=text,
                response_format="wav"
            )
            
            # Handle the response properly - similar to ElevenLabs
            if hasattr(response, 'content'):
                audio_data = response.content
            elif hasattr(response, 'read'):
                audio_data = response.read()
            else:
                # Try to get the response as bytes
                audio_data = bytes(response)
            
            if audio_data and len(audio_data) > 0:
                logging.info(f"Successfully generated Groq TTS audio, size: {len(audio_data)} bytes")
                return audio_data
            else:
                logging.error("Groq TTS returned empty audio data")
                return None
            
        except Exception as e:
            logging.error(f"Error generating Groq TTS audio: {str(e)}")
            logging.error(f"Error type: {type(e)}")
            return None
                    
        except Exception as e:
            logging.error(f"Error generating free TTS audio: {str(e)}")
            return None
    
    def get_available_providers(self) -> List[Dict[str, Any]]:
        """Get list of available TTS providers - only show those with API keys"""
        provider_info = []
        
        # Only show ElevenLabs for first version
        if 'elevenlabs' in self.providers and self.elevenlabs_key:
            provider_info.append({
                "name": "ElevenLabs",
                "id": "elevenlabs",
                "features": ["high_quality", "voice_cloning", "custom_settings"],
                "cost_per_1k_chars": 0.030
            })
        
        # Other providers hidden until API keys are added:
        # Groq, OpenAI, Azure, Play.ht
        
        return provider_info
    
    def get_voices_by_provider(self, provider: str) -> List[Dict[str, Any]]:
        """Get all voices for a specific provider"""
        if provider == 'groq':
            return self._get_groq_voices("", "", "")
        elif provider == 'elevenlabs':
            return self._get_elevenlabs_voices("", "", "")
        elif provider == 'openai':
            return self._get_openai_voices("", "", "")
        elif provider == 'azure':
            return self._get_azure_voices("", "", "")
        elif provider == 'playht':
            return self._get_playht_voices("", "", "")
        else:
            return []
    
    def get_voice_details(self, voice_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific voice"""
        all_voices = self._get_mock_voices()
        
        for voice in all_voices:
            if voice['id'] == voice_id:
                return voice
        
        return None
    
    def _get_playht_voices(self, tone: str, target_audience: str, style: str) -> List[Dict[str, Any]]:
        """Get Play.ht voice recommendations"""
        voices = [
            {
                "id": "playht_sarah",
                "provider": "Play.ht",
                "name": "Sarah",
                "cost": "$0.025",
                "description": "Natural and conversational",
                "gender": "female",
                "accent": "American",
                "duration": "4.6s",
                "speed": "Medium",
                "quality": "High"
            },
            {
                "id": "playht_michael",
                "provider": "Play.ht",
                "name": "Michael", 
                "cost": "$0.025",
                "description": "Engaging and dynamic",
                "gender": "male",
                "accent": "American",
                "duration": "4.5s",
                "speed": "Medium",
                "quality": "High"
            }
        ]
        return voices