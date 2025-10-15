# 🎉 Octave AI - AI Voice Comparison Tool

## ✅ Live Application

**Your AI-powered voice comparison tool is live and functional!**

- **Frontend**: Deploy with `vercel --prod` in frontend folder
- **Backend**: `https://backend-eh7ldzeu5-lotfullah-muslimwals-projects.vercel.app`

## 🚀 What It Does

**Octave AI** helps users find the perfect AI voice by:

1. **AI Script Generation** - Takes user text and generates optimized voice scripts using Groq LLM
2. **Voice Recommendations** - Provides voice options from multiple TTS providers
3. **Cost Comparison** - Shows pricing across different voice services
4. **Voice Previews** - Allows users to test voice samples

## 🛠️ Tech Stack

### Backend (`/backend`)
- **Framework**: Flask (Python)
- **AI**: Groq API with Llama 3.1 8B model
- **TTS**: ElevenLabs, OpenAI, Azure Speech
- **Deployment**: Vercel

### Frontend (`/frontend`)
- **Framework**: Vanilla JavaScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Deployment

### Backend
```bash
cd backend
vercel --prod
```

### Frontend
```bash
cd frontend
vercel --prod
```

## 🔧 Environment Variables (Vercel Backend)

Add these to your Vercel backend project settings:

```
GROQ_API_KEY=your_groq_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key
GOOGLE_API_KEY=your_google_key
FLASK_ENV=production
```

## 🎯 Features

- ✅ Real-time AI script generation
- ✅ Multi-provider voice comparison
- ✅ Cost analysis and recommendations
- ✅ Voice sample previews
- ✅ Responsive web interface
- ✅ CORS-enabled API

## 🌟 Success!

Your AI voice comparison tool is ready for users! The app successfully generates AI-optimized scripts and provides comprehensive voice recommendations across multiple TTS providers.

**Built with ❤️ using AI-powered development**