// API functions to call Flask backend
class OctaveAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api'; // Flask backend URL
    }

    // Analyze project description and generate script
    async analyzeProject(description) {
        try {
            const response = await fetch(`${this.baseURL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error analyzing project:', error);
            // Return mock data for development
            return this.getMockAnalysis(description);
        }
    }

    // Get voice recommendations
    async getVoiceRecommendations(projectData) {
        try {
            const response = await fetch(`${this.baseURL}/voices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting voice recommendations:', error);
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
    getMockAnalysis(description) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    generated_script: `Based on your project description: "${description}"

This is a professionally crafted script that captures the essence of your project. The tone is engaging and perfectly suited for your target audience, with clear messaging that resonates with your brand values.

The script maintains a balance between professionalism and approachability, ensuring your message is both credible and relatable to your intended audience.`,
                    analysis: {
                        tone: 'professional',
                        target_audience: 'general',
                        style: 'conversational'
                    }
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