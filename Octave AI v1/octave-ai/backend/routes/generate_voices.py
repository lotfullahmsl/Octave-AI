"""
Endpoint for voice generation and recommendations
"""
from flask import Blueprint, request, jsonify, send_file
from services.tts_service import TTSService
import logging
import io
import os

# Create blueprint
voices_bp = Blueprint('voices', __name__)

# Initialize services
tts_service = TTSService()

@voices_bp.route('/voices', methods=['POST'])
def get_voice_recommendations():
    """
    Get voice recommendations based on project analysis
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Project analysis data is required"}), 400
        
        # Extract project characteristics
        tone = data.get('tone', 'professional')
        target_audience = data.get('target_audience', 'general')
        style = data.get('style', 'conversational')
        
        # Get voice recommendations from TTS service
        voice_recommendations = tts_service.get_recommended_voices(
            tone=tone,
            target_audience=target_audience,
            style=style
        )
        
        return jsonify({
            "success": True,
            "voices": voice_recommendations,
            "total_count": len(voice_recommendations)
        })
        
    except Exception as e:
        logging.error(f"Error in get_voice_recommendations: {str(e)}")
        return jsonify({"error": "Failed to get voice recommendations"}), 500

@voices_bp.route('/generate-audio', methods=['POST'])
def generate_audio_sample():
    """
    Generate audio sample for a specific voice
    """
    try:
        data = request.get_json()
        
        if not data or 'voice_id' not in data or 'text' not in data:
            return jsonify({"error": "voice_id and text are required"}), 400
        
        voice_id = data['voice_id']
        text = data['text'][:200]  # Limit text length for samples
        settings = data.get('settings', {})
        
        logging.info(f"Generating audio for voice_id: {voice_id}, text: {text[:50]}...")
        
        # Check if this is an ElevenLabs voice
        if voice_id.startswith('elevenlabs_'):
            logging.info(f"Using ElevenLabs for {voice_id}")
            if not tts_service.elevenlabs_key:
                logging.error("ElevenLabs API key not found!")
                return jsonify({"error": "ElevenLabs API key not configured"}), 500
        
        # Check if this is a Groq voice
        if voice_id == 'Fritz-PlayAI' or voice_id.startswith('groq_'):
            logging.info(f"Using Groq TTS for {voice_id}")
            if not os.getenv('GROQ_API_KEY'):
                logging.error("Groq API key not found!")
                return jsonify({"error": "Groq API key not configured"}), 500
        
        # Generate audio using TTS service
        audio_data = tts_service.generate_audio(
            voice_id=voice_id,
            text=text,
            settings=settings
        )
        
        if audio_data:
            # Determine the correct mimetype based on the voice provider
            if voice_id == 'Fritz-PlayAI' or voice_id.startswith('groq_'):
                mimetype = 'audio/wav'   # Groq returns WAV
                file_ext = 'wav'
            elif voice_id.startswith('openai'):
                mimetype = 'audio/mpeg'  # OpenAI returns MP3
                file_ext = 'mp3'
            elif voice_id.startswith('elevenlabs'):
                mimetype = 'audio/mpeg'  # ElevenLabs returns MP3
                file_ext = 'mp3'
            else:
                mimetype = 'audio/mpeg'  # Default to MP3
                file_ext = 'mp3'
            
            # Return audio file
            audio_buffer = io.BytesIO(audio_data)
            audio_buffer.seek(0)
            
            logging.info(f"Successfully generated audio for {voice_id}, size: {len(audio_data)} bytes, format: {mimetype}")
            
            return send_file(
                audio_buffer,
                mimetype=mimetype,
                as_attachment=False,  # Allow inline playback
                download_name=f'sample_{voice_id}.{file_ext}'
            )
        else:
            logging.error(f"No audio data generated for {voice_id}")
            return jsonify({"error": "Failed to generate audio - no audio data returned"}), 500
            
    except Exception as e:
        logging.error(f"Error in generate_audio_sample: {str(e)}")
        return jsonify({"error": f"Failed to generate audio sample: {str(e)}"}), 500

@voices_bp.route('/voices/providers', methods=['GET'])
def get_voice_providers():
    """
    Get available voice providers and their capabilities
    """
    try:
        providers = tts_service.get_available_providers()
        
        return jsonify({
            "success": True,
            "providers": providers
        })
        
    except Exception as e:
        logging.error(f"Error in get_voice_providers: {str(e)}")
        return jsonify({"error": "Failed to get voice providers"}), 500

@voices_bp.route('/voices/<provider>', methods=['GET'])
def get_provider_voices(provider):
    """
    Get all voices for a specific provider
    """
    try:
        voices = tts_service.get_voices_by_provider(provider)
        
        return jsonify({
            "success": True,
            "provider": provider,
            "voices": voices,
            "count": len(voices)
        })
        
    except Exception as e:
        logging.error(f"Error in get_provider_voices: {str(e)}")
        return jsonify({"error": f"Failed to get voices for {provider}"}), 500

@voices_bp.route('/favorites', methods=['POST'])
def save_favorites():
    """
    Save user's favorite voices to shortlist
    """
    try:
        data = request.get_json()
        
        if not data or 'voices' not in data:
            return jsonify({"error": "Voice list is required"}), 400
        
        favorites_data = {
            "voices": data['voices'],
            "project_description": data.get('description', ''),
            "user_id": data.get('user_id', 'anonymous'),
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        # Store favorites in database (disabled for simplicity)
        # favorite_id = db_service.store_project(favorites_data)
        favorite_id = "mock_favorite_id"
        
        return jsonify({
            "success": True,
            "favorite_id": favorite_id,
            "message": "Favorites saved successfully"
        })
        
    except Exception as e:
        logging.error(f"Error in save_favorites: {str(e)}")
        return jsonify({"error": "Failed to save favorites"}), 500

@voices_bp.route('/integration/<voice_id>', methods=['GET'])
def get_integration_snippet(voice_id):
    """
    Get integration code snippets for developers
    """
    try:
        # Get voice details
        voice_info = tts_service.get_voice_details(voice_id)
        
        if not voice_info:
            return jsonify({"error": "Voice not found"}), 404
        
        provider = voice_info.get('provider', '').lower()
        
        # Generate integration snippets
        snippets = {
            "curl": f"""curl -X POST https://api.{provider}.com/v1/text-to-speech \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{
    "text": "Your text here",
    "voice": "{voice_id}",
    "output_format": "mp3"
  }}'""",
            
            "python": f"""import requests

url = "https://api.{provider}.com/v1/text-to-speech"
headers = {{
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}}
data = {{
    "text": "Your text here",
    "voice": "{voice_id}",
    "output_format": "mp3"
}}

response = requests.post(url, headers=headers, json=data)
with open("output.mp3", "wb") as f:
    f.write(response.content)""",
            
            "javascript": f"""const response = await fetch('https://api.{provider}.com/v1/text-to-speech', {{
  method: 'POST',
  headers: {{
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }},
  body: JSON.stringify({{
    text: 'Your text here',
    voice: '{voice_id}',
    output_format: 'mp3'
  }})
}});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);""",
            
            "node": f"""const axios = require('axios');
const fs = require('fs');

const response = await axios.post('https://api.{provider}.com/v1/text-to-speech', {{
  text: 'Your text here',
  voice: '{voice_id}',
  output_format: 'mp3'
}}, {{
  headers: {{
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }},
  responseType: 'stream'
}});

response.data.pipe(fs.createWriteStream('output.mp3'));"""
        }
        
        return jsonify({
            "success": True,
            "voice_info": voice_info,
            "integration_snippets": snippets
        })
        
    except Exception as e:
        logging.error(f"Error in get_integration_snippet: {str(e)}")
        return jsonify({"error": "Failed to get integration snippet"}), 500