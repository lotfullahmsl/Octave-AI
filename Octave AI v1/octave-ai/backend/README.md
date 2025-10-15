# 🎵 Octave AI Backend

Flask-based backend API for Octave AI voice generation platform.

## 🏗️ Architecture

```
backend/
├── app.py                     # Main Flask app entry point
├── requirements.txt           # Flask + API dependencies
├── .env                       # API keys + MongoDB URI
│
├── routes/
│   ├── generate_text.py       # Endpoint for LLM (Gemini or GPT)
│   └── generate_voices.py     # Endpoint for voice generation
│
├── services/
│   ├── llm_service.py         # For Gemini or GPT text generation
│   ├── tts_service.py         # For ElevenLabs, OpenAI TTS, etc.
│   └── mongodb_service.py     # MongoDB Atlas connection
│
├── utils/
│   └── meta_prompt.py         # Generates meta prompts like "Calm, confident tone…"
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup
Copy `.env` file and add your API keys:
```bash
# LLM API Keys
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_API_KEY=your-google-gemini-api-key-here

# TTS API Keys
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
AZURE_SPEECH_KEY=your-azure-speech-key-here
AZURE_SPEECH_REGION=your-azure-region-here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/octave-ai
```

### 3. Run Development Server
```bash
python app.py
```

Server runs on `http://localhost:5000`

## 📡 API Endpoints

### Text Generation
- `POST /api/analyze` - Analyze project and generate script
- `POST /api/regenerate-script` - Regenerate script variation

### Voice Generation  
- `POST /api/voices` - Get voice recommendations
- `POST /api/generate-audio` - Generate audio sample
- `GET /api/voices/providers` - Get available providers
- `GET /api/voices/<provider>` - Get voices by provider

### Health Check
- `GET /` - Basic health check
- `GET /api/health` - Detailed health status

## 🔧 Services

### LLM Service (`llm_service.py`)
- **Primary**: Google Gemini Pro
- **Fallback**: OpenAI GPT-3.5-turbo
- **Features**: Script generation, tone analysis

### TTS Service (`tts_service.py`)
- **ElevenLabs**: High-quality voice cloning
- **OpenAI TTS**: Fast, reliable generation
- **Azure Speech**: Enterprise-grade, multi-language

### MongoDB Service (`mongodb_service.py`)
- **Database**: MongoDB Atlas
- **Collections**: projects, voice_generations, analytics
- **Features**: Project storage, usage analytics

## 🎯 Meta Prompt System

The `meta_prompt.py` utility generates contextual prompts:

```python
# Input: "Medical appointment scheduling assistant"
# Output: "Calm, professional tone for healthcare professionals with medical clarity"

# Input: "Educational learning platform" 
# Output: "Friendly, engaging tone for students with educational warmth"
```

## 🔐 Security

- Environment variables for all API keys
- CORS configured for frontend domains
- Input validation on all endpoints
- Error handling with proper HTTP status codes

## 📊 Monitoring

- Health check endpoints
- Usage analytics storage
- Error logging
- Performance metrics

## 🚀 Deployment

### Local Development
```bash
FLASK_ENV=development python app.py
```

### Production (Heroku/Railway/etc.)
```bash
gunicorn app:app
```

### Environment Variables Required:
- `OPENAI_API_KEY` or `GOOGLE_API_KEY` (at least one)
- `ELEVENLABS_API_KEY`, `AZURE_SPEECH_KEY` (optional)
- `MONGODB_URI` (for data persistence)

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

## 📝 API Usage Examples

### Analyze Project
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"description": "A medical appointment scheduling assistant"}'
```

### Get Voice Recommendations
```bash
curl -X POST http://localhost:5000/api/voices \
  -H "Content-Type: application/json" \
  -d '{"tone": "professional", "target_audience": "healthcare", "style": "calm"}'
```

### Generate Audio Sample
```bash
curl -X POST http://localhost:5000/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"voice_id": "openai_nova", "text": "Hello, this is a test message."}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.