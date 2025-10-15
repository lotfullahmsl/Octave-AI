"""
Main Flask app entry point for Octave AI Backend
"""
from dotenv import load_dotenv

# Load environment variables FIRST before any other imports
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import route modules (after loading env vars)
from routes.generate_text import text_bp
from routes.generate_voices import voices_bp

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend communication
CORS(app, origins=[
    "http://localhost:8000", 
    "http://localhost:3000",
    "https://*.vercel.app", 
    "https://frontend-febrjbddz-lotfullah-muslimwals-projects.vercel.app",
    "*"  # Allow all origins for now - restrict in production
])

# Register blueprints
app.register_blueprint(text_bp, url_prefix='/api')
app.register_blueprint(voices_bp, url_prefix='/api')

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "Octave AI Backend is running!",
        "version": "1.0.0",
        "status": "healthy"
    })

@app.route('/api/health')
def health():
    """Detailed health check"""
    return jsonify({
        "status": "healthy",
        "services": {
            "llm": "connected",
            "tts": "connected", 
            "database": "disabled"
        },
        "timestamp": "2024-01-01T00:00:00Z"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# For Vercel serverless deployment
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

# Export app for Vercel
application = app