"""
Vercel entry point for Flask app
"""
from app import app

# Export the Flask app for Vercel
application = app

# This is the entry point for Vercel
if __name__ == "__main__":
    app.run()