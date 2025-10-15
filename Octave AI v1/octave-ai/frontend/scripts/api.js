// API functions to call Flask backend
class OctaveAPI {
    constructor() {
        // Use environment variable or fallback to localhost for development
        this.baseURL = window.location.hostname === 'localhost'
            ? 'http://localhost:5000/api'
            : 'https://backend-eh7ldzeu5-lotfullah-muslimwals-projects.vercel.app/api';
    }

    // Analyze project description with preferences and generate script
    async analyzeProject(description, tone = '', useCase = '') {
        try {
            console.log('🔍 Making API call to:', `${this.baseURL}/analyze-with-preferences`);
            console.log('📤 Request data:', { description, tone, use_case: useCase });

            const response = await fetch(`${this.baseURL}/analyze-with-preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description,
                    tone: tone,
                    use_case: useCase
                })
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ API Success:', result);
            return result;
        } catch (error) {
            console.error('❌ Error analyzing project:', error);
            console.log('🔄 Using mock data as fallback');
            // Return mock data for development
            return this.getMockAnalysis(description, tone, useCase);
        }
    }

    // Optimize voice prompt for better results
    async optimizePrompt(metaPrompt, description) {
        try {
            const response = await fetch(`${this.baseURL}/optimize-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    meta_prompt: metaPrompt,
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error optimizing prompt:', error);
            return null;
        }
    }

    // Get voice recommendations
    async getVoiceRecommendations(projectData) {
        try {
            console.log('🔍 Making API call to:', `${this.baseURL}/voices`);
            console.log('📤 Request data:', projectData);

            const response = await fetch(`${this.baseURL}/voices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ API Success:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting voice recommendations:', error);
            console.log('🔄 Using mock data as fallback');
            // Return mock data for development
            return this.getMockVoices();
        }
    }

    // Generate audio sample
    async generateAudioSample(voiceId, text) {
        try {
            const response = await fetch(`${this.baseURL}/generate-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    voice_id: voiceId,
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error generating audio sample:', error);
            return null;
        }
    }

    // Mock data for development (when backend is not available)
    getMockAnalysis(description, tone = '', useCase = '') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const selectedTone = tone || 'professional';
                const selectedUseCase = useCase || 'general';

                resolve({
                    success: true,
                    generated_script: `${description}

This script has been optimized for ${selectedTone} tone and ${selectedUseCase} use case. The delivery should be natural and engaging, with appropriate pacing and emphasis to match your project's requirements.`,
                    analysis: {
                        tone: selectedTone,
                        target_audience: selectedUseCase === 'app introduction' ? 'app users' : 'general',
                        style: selectedTone === 'calm and confident' ? 'confident' : 'conversational',
                        use_case: selectedUseCase
                    },
                    meta_prompt: `Use a ${selectedTone} tone with natural pacing for ${selectedUseCase}`,
                    model_used: 'mock'
                });
            }, 1500);
        });
    }

    getMockVoices() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    voices: [
                        {
                            id: 'openai_nova',
                            provider: 'OpenAI',
                            name: 'Nova',
                            cost: '0.015',
                            description: 'Warm and engaging',
                            gender: 'female',
                            accent: 'American',
                            duration: '4.2s',
                            sample_url: null
                        },
                        {
                            id: 'elevenlabs_rachel',
                            provider: 'ElevenLabs',
                            name: 'Rachel',
                            cost: '0.030',
                            description: 'Calm and professional',
                            gender: 'female',
                            accent: 'American',
                            duration: '4.5s',
                            sample_url: null
                        },
                        {
                            id: 'azure_jenny',
                            provider: 'Azure',
                            name: 'Jenny',
                            cost: '0.020',
                            description: 'Clear and articulate',
                            gender: 'female',
                            accent: 'American',
                            duration: '4.1s',
                            sample_url: null
                        },
                        {
                            id: 'openai_alloy',
                            provider: 'OpenAI',
                            name: 'Alloy',
                            cost: '0.015',
                            description: 'Neutral and balanced',
                            gender: 'neutral',
                            accent: 'American',
                            duration: '4.3s',
                            sample_url: null
                        }
                    ]
                });
            }, 1000);
        });
    }

    // Utility function to simulate API delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export API instance
const octaveAPI = new OctaveAPI();