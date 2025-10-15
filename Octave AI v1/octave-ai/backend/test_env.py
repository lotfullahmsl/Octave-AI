#!/usr/bin/env python3
"""
Test script to check environment variables and API connections
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_env_vars():
    print("🔍 Testing Environment Variables...")
    
    # Check API keys
    groq_key = os.getenv('GROQ_API_KEY')
    gemini_key = os.getenv('GEMINI_API_KEY')
    elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    print(f"✅ GROQ_API_KEY: {'✓ Set' if groq_key else '❌ Missing'} ({len(groq_key) if groq_key else 0} chars)")
    print(f"✅ GEMINI_API_KEY: {'✓ Set' if gemini_key else '❌ Missing'} ({len(gemini_key) if gemini_key else 0} chars)")
    print(f"✅ ELEVENLABS_API_KEY: {'✓ Set' if elevenlabs_key else '❌ Missing'} ({len(elevenlabs_key) if elevenlabs_key else 0} chars)")
    
    return groq_key, gemini_key, elevenlabs_key

def test_groq_connection(api_key):
    if not api_key:
        print("❌ Groq: No API key")
        return False
        
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10
        )
        
        print("✅ Groq: Connection successful")
        return True
    except Exception as e:
        print(f"❌ Groq: Connection failed - {e}")
        return False

def test_llm_service():
    print("\n🔍 Testing LLM Service...")
    
    try:
        from services.llm_service import LLMService
        llm = LLMService()
        
        print(f"Primary LLM: {llm.primary_llm}")
        print(f"Groq client: {'✓' if llm.groq_client else '❌'}")
        print(f"Gemini model: {'✓' if llm.gemini_model else '❌'}")
        
        # Test script generation
        result = llm.generate_script("Test medical assistant", "professional tone")
        print(f"Script generation: {'✅ Success' if result.get('script') else '❌ Failed'}")
        print(f"Model used: {result.get('model_used', 'unknown')}")
        
        return True
    except Exception as e:
        print(f"❌ LLM Service failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Octave AI Backend Environment Test\n")
    
    # Test environment variables
    groq_key, gemini_key, elevenlabs_key = test_env_vars()
    
    # Test API connections
    print("\n🔍 Testing API Connections...")
    test_groq_connection(groq_key)
    
    # Test LLM service
    test_llm_service()
    
    print("\n✅ Test completed!")