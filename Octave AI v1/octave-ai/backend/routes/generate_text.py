"""
Endpoint for LLM text generation (Gemini or GPT)
"""
from flask import Blueprint, request, jsonify
from services.llm_service import LLMService
from utils.meta_prompt import generate_meta_prompt
import logging
import os

# Create blueprint
text_bp = Blueprint('text', __name__)

# Initialize services lazily
llm_service = None

def get_llm_service():
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service

@text_bp.route('/analyze', methods=['POST'])
def analyze_project():
    """
    Analyze project description and generate script
    """
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({"error": "Project description is required"}), 400
        
        description = data['description'].strip()
        
        if len(description) < 10:
            return jsonify({"error": "Description too short"}), 400
        
        # Generate meta prompt for the project
        meta_prompt = generate_meta_prompt(description)
        
        # Generate script using LLM
        llm = get_llm_service()
        script_result = llm.generate_script(description, meta_prompt)
        
        # Analyze project characteristics
        analysis_result = llm.analyze_project_tone(description)
        
        # Store in database for future reference (disabled for simplicity)
        # project_data = {
        #     "description": description,
        #     "meta_prompt": meta_prompt,
        #     "generated_script": script_result["script"],
        #     "analysis": analysis_result,
        #     "timestamp": "2024-01-01T00:00:00Z"
        # }
        # db_service.store_project(project_data)
        
        return jsonify({
            "success": True,
            "generated_script": script_result["script"],
            "analysis": analysis_result,
            "meta_prompt": meta_prompt
        })
        
    except Exception as e:
        logging.error(f"Error in analyze_project: {str(e)}")
        return jsonify({"error": "Failed to analyze project"}), 500

@text_bp.route('/analyze-with-preferences', methods=['POST'])
def analyze_with_preferences():
    """
    Analyze project with user-selected tone and use case preferences
    """
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({"error": "Project description is required"}), 400
        
        description = data['description'].strip()
        user_tone = data.get('tone', '')
        use_case = data.get('use_case', '')
        
        if len(description) < 10:
            return jsonify({"error": "Description too short"}), 400
        
        # Generate meta prompt with user preferences
        meta_prompt = generate_meta_prompt(description, user_tone=user_tone, use_case=use_case)
        
        # Generate script using LLM
        llm = get_llm_service()
        script_result = llm.generate_script(description, meta_prompt)
        
        # Enhanced analysis with user preferences
        analysis_result = llm.analyze_project_tone(description)
        
        # Override with user preferences if provided
        if user_tone:
            analysis_result['tone'] = user_tone
        if use_case:
            analysis_result['use_case'] = use_case
        
        # Store in database (disabled for simplicity)
        # project_data = {
        #     "description": description,
        #     "user_preferences": {
        #         "tone": user_tone,
        #         "use_case": use_case
        #     },
        #     "meta_prompt": meta_prompt,
        #     "generated_script": script_result["script"],
        #     "analysis": analysis_result,
        #     "timestamp": "2024-01-01T00:00:00Z"
        # }
        # db_service.store_project(project_data)
        
        return jsonify({
            "success": True,
            "generated_script": script_result["script"],
            "analysis": analysis_result,
            "meta_prompt": meta_prompt,
            "model_used": script_result.get("model_used", "unknown")
        })
        
    except Exception as e:
        logging.error(f"Error in analyze_with_preferences: {str(e)}")
        return jsonify({"error": "Failed to analyze project with preferences"}), 500

@text_bp.route('/regenerate-script', methods=['POST'])
def regenerate_script():
    """
    Regenerate script for existing project
    """
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({"error": "Project description is required"}), 400
        
        description = data['description'].strip()
        
        # Generate new meta prompt variation
        meta_prompt = generate_meta_prompt(description, variation=True)
        
        # Generate new script
        llm = get_llm_service()
        script_result = llm.generate_script(description, meta_prompt)
        
        return jsonify({
            "success": True,
            "generated_script": script_result["script"],
            "meta_prompt": meta_prompt,
            "model_used": script_result.get("model_used", "unknown")
        })
        
    except Exception as e:
        logging.error(f"Error in regenerate_script: {str(e)}")
        return jsonify({"error": "Failed to regenerate script"}), 500

@text_bp.route('/debug-llm', methods=['GET'])
def debug_llm():
    """
    Debug endpoint to check LLM service status
    """
    try:
        llm = get_llm_service()
        debug_info = {
            "groq_key_exists": bool(os.getenv('GROQ_API_KEY')),
            "gemini_key_exists": bool(os.getenv('GEMINI_API_KEY')),
            "groq_client_initialized": bool(llm.groq_client) if hasattr(llm, 'groq_client') else False,
            "gemini_model_initialized": bool(llm.gemini_model) if hasattr(llm, 'gemini_model') else False,
            "primary_llm": getattr(llm, 'primary_llm', 'groq'),
            "groq_key_length": len(os.getenv('GROQ_API_KEY', '')) if os.getenv('GROQ_API_KEY') else 0
        }
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@text_bp.route('/optimize-prompt', methods=['POST'])
def optimize_prompt():
    """
    Optimize the voice prompt for better emotion and pacing
    """
    try:
        data = request.get_json()
        
        if not data or 'meta_prompt' not in data:
            return jsonify({"error": "Meta prompt is required"}), 400
        
        current_prompt = data['meta_prompt']
        description = data.get('description', '')
        
        # Use LLM to optimize the prompt
        optimization_prompt = f"""
        Current voice prompt: {current_prompt}
        Project context: {description}
        
        Optimize this voice prompt for better emotion, pacing, and naturalness. 
        Make it more specific and effective for text-to-speech generation.
        Focus on:
        1. Natural pauses and rhythm
        2. Appropriate emotion level
        3. Clear pacing instructions
        4. Voice characteristics that match the content
        
        Return only the optimized prompt, nothing else.
        """
        
        llm = get_llm_service()
        optimized_result = llm.generate_script(description, optimization_prompt)
        
        return jsonify({
            "success": True,
            "original_prompt": current_prompt,
            "optimized_prompt": optimized_result["script"],
            "model_used": optimized_result.get("model_used", "unknown")
        })
        
    except Exception as e:
        logging.error(f"Error in optimize_prompt: {str(e)}")
        return jsonify({"error": "Failed to optimize prompt"}), 500