// Handles button clicks, input events, and user interactions
class EventManager {
    constructor() {
        this.audioElements = new Map();
    }

    // Initialize all event listeners
    init() {
        this.setupTextAreaEvents();
        this.setupButtonEvents();
        this.setupKeyboardEvents();
    }

    // Text area event handlers
    setupTextAreaEvents() {
        const textArea = document.getElementById('projectDescription');

        textArea.addEventListener('input', () => {
            uiManager.updateCharCounter();
            uiManager.updateButtonState();
        });

        textArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.handleFindVoice();
            }
        });
    }

    // Button event handlers
    setupButtonEvents() {
        const findVoiceBtn = document.getElementById('findVoiceBtn');

        if (!findVoiceBtn) {
            console.error('findVoiceBtn element not found');
            return;
        }

        findVoiceBtn.addEventListener('click', () => {
            this.handleFindVoice();
        });

        // Setup result section buttons when they become available
        this.setupResultButtons();
    }

    // Setup buttons in the results section
    setupResultButtons() {
        // Use event delegation since these buttons are created dynamically
        document.addEventListener('click', (e) => {
            if (e.target.id === 'tryDifferentDescriptionBtn') {
                this.handleTryDifferentDescription();
            } else if (e.target.id === 'regenerateVoicesBtn') {
                this.handleRegenerateVoices();
            } else if (e.target.id === 'regenerateScriptBtn') {
                this.handleRegenerateScript();
            } else if (e.target.id === 'optimizePromptBtn') {
                this.handleOptimizePrompt();
            } else if (e.target.id === 'saveToShortlistBtn') {
                this.handleSaveToShortlist();
            } else if (e.target.id === 'getIntegrationBtn') {
                this.handleGetIntegration();
            } else if (e.target.id === 'closeShortlistModal') {
                this.closeModal('shortlistModal');
            } else if (e.target.id === 'closeIntegrationModal') {
                this.closeModal('integrationModal');
            }
        });
    }

    // Keyboard shortcuts
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.handleFindVoice();
            }

            if (e.key === 'Escape') {
                this.handleReset();
            }
        });
    }

    // Main find voice handler - enhanced with user preferences
    async handleFindVoice() {
        const descriptionElement = document.getElementById('projectDescription');
        const toneElement = document.getElementById('toneSelect');
        const useCaseElement = document.getElementById('useCaseSelect');

        if (!descriptionElement) {
            uiManager.showError('Project description field not found');
            console.error('projectDescription element not found');
            return;
        }

        const description = descriptionElement.value.trim();
        const tone = toneElement ? toneElement.value : '';
        const useCase = useCaseElement ? useCaseElement.value : '';

        console.log('🔍 Form values:', { description, tone, useCase });

        if (!description) {
            uiManager.showError('Please enter your text');
            return;
        }

        if (description.length < 10) {
            uiManager.showError('Please provide more text (at least 10 characters)');
            return;
        }

        try {
            // Start loading state
            uiManager.setLoading(true);
            uiManager.showLoading();

            // Step 1: Analyzing Your Text
            uiManager.updateLoadingStep(0);
            await octaveAPI.delay(1500);

            // Step 2: Creating Voice Prompts
            uiManager.updateLoadingStep(1);
            const analysisResult = await octaveAPI.analyzeProject(description, tone, useCase);
            await octaveAPI.delay(1000);

            // Step 3: Comparing Voice Providers
            uiManager.updateLoadingStep(2);
            const voicesResult = await octaveAPI.getVoiceRecommendations(analysisResult.analysis);
            await octaveAPI.delay(1000);

            // Show results
            uiManager.showResults();
            uiManager.showGeneratedText(analysisResult.generated_script);
            uiManager.showMetaPrompt(analysisResult.meta_prompt);
            uiManager.populateVoiceTable(voicesResult.voices);

            // Store current data for other operations
            window.currentAnalysis = analysisResult;
            window.currentVoices = voicesResult.voices;

        } catch (error) {
            console.error('Error in handleFindVoice:', error);
            uiManager.showError('An error occurred while processing your request. Please try again.');
            uiManager.reset();
        } finally {
            uiManager.setLoading(false);
        }
    }

    // Handle voice play button clicks
    async handlePlayVoice(voiceId, voiceName, provider) {
        try {
            this.stopAllAudio();

            const generatedText = document.getElementById('generatedText').textContent;
            const sampleText = generatedText ?
                generatedText.substring(0, 200) + '...' :
                'Hello, this is MediCare Assistant. I can help you schedule your appointment or check on your recent lab results. What would you like help with today?';

            const playButton = event.target.closest('.play-button');
            const originalHTML = playButton.innerHTML;

            // Show loading state
            playButton.innerHTML = `
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            `;
            playButton.disabled = true;

            const audioUrl = await octaveAPI.generateAudioSample(voiceId, sampleText);

            if (audioUrl) {
                const audio = new Audio(audioUrl);
                this.audioElements.set(voiceId, audio);

                // Show playing state
                playButton.innerHTML = `
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                `;

                audio.addEventListener('ended', () => {
                    this.cleanupAudio(voiceId);
                    playButton.innerHTML = originalHTML;
                    playButton.disabled = false;
                });

                audio.addEventListener('error', () => {
                    this.cleanupAudio(voiceId);
                    playButton.innerHTML = originalHTML;
                    playButton.disabled = false;
                    uiManager.showError('Failed to play audio sample');
                });

                await audio.play();
            } else {
                this.showVoiceInfo(voiceName, provider);
                playButton.innerHTML = originalHTML;
                playButton.disabled = false;
            }

        } catch (error) {
            console.error('Error playing voice:', error);
            uiManager.showError(`Failed to play ${voiceName} sample`);

            const playButton = event.target.closest('.play-button');
            playButton.innerHTML = `
                <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            playButton.disabled = false;
        }
    }

    // Show voice information when audio is not available
    showVoiceInfo(voiceName, provider) {
        const message = `${voiceName} from ${provider}\n\nThis would play a sample of your generated script using the ${voiceName} voice. Audio samples will be available when connected to the backend API.`;
        alert(message);
    }

    // Stop all currently playing audio
    stopAllAudio() {
        this.audioElements.forEach((audio, voiceId) => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
            this.cleanupAudio(voiceId);
        });
    }

    // Clean up audio element
    cleanupAudio(voiceId) {
        const audio = this.audioElements.get(voiceId);
        if (audio) {
            if (audio.src && audio.src.startsWith('blob:')) {
                URL.revokeObjectURL(audio.src);
            }
            this.audioElements.delete(voiceId);
        }
    }

    // Reset the application
    handleReset() {
        this.stopAllAudio();
        uiManager.reset();
        document.getElementById('projectDescription').value = '';
        uiManager.updateCharCounter();
        uiManager.updateButtonState();
    }

    // Handle "Try Different Description" button
    handleTryDifferentDescription() {
        // Reset to input section and clear the description
        uiManager.reset();
        const textArea = document.getElementById('projectDescription');
        textArea.value = '';
        textArea.focus();
        uiManager.updateCharCounter();
        uiManager.updateButtonState();
        uiManager.showSuccess('Ready for a new description!');
    }

    // Handle "Regenerate Voices" button
    async handleRegenerateVoices() {
        const description = document.getElementById('projectDescription').value.trim();

        if (!description) {
            uiManager.showError('No project description found');
            return;
        }

        try {
            // Show loading state for regenerating voices
            const regenerateBtn = document.getElementById('regenerateVoicesBtn');
            const originalText = regenerateBtn.textContent;

            regenerateBtn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Regenerating...</span>
                </div>
            `;
            regenerateBtn.disabled = true;

            // Get new voice recommendations
            const analysisResult = await octaveAPI.analyzeProject(description);
            const voicesResult = await octaveAPI.getVoiceRecommendations(analysisResult.analysis);

            // Update the voice table with new voices
            uiManager.populateVoiceTable(voicesResult.voices);
            uiManager.showSuccess('Generated new voice recommendations!');

        } catch (error) {
            console.error('Error regenerating voices:', error);
            uiManager.showError('Failed to regenerate voices. Please try again.');
        } finally {
            // Reset button state
            const regenerateBtn = document.getElementById('regenerateVoicesBtn');
            regenerateBtn.textContent = 'Regenerate Voices';
            regenerateBtn.disabled = false;
        }
    }

    // Handle "Regenerate Script" button
    async handleRegenerateScript() {
        const description = document.getElementById('projectDescription').value.trim();

        if (!description) {
            uiManager.showError('No project description found');
            return;
        }

        try {
            // Show loading state for regenerating script
            const regenerateBtn = document.getElementById('regenerateScriptBtn');
            const originalHTML = regenerateBtn.innerHTML;

            regenerateBtn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Regenerating...</span>
                </div>
            `;
            regenerateBtn.disabled = true;

            // Generate new script
            const analysisResult = await octaveAPI.analyzeProject(description);

            // Update the generated text
            uiManager.showGeneratedText(analysisResult.generated_script);
            uiManager.showSuccess('Generated new script!');

        } catch (error) {
            console.error('Error regenerating script:', error);
            uiManager.showError('Failed to regenerate script. Please try again.');
        } finally {
            // Reset button state
            const regenerateBtn = document.getElementById('regenerateScriptBtn');
            regenerateBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                    </path>
                </svg>
                Regenerate
            `;
            regenerateBtn.disabled = false;
        }
    }

    // Handle optimize prompt button
    async handleOptimizePrompt() {
        if (!window.currentAnalysis) {
            uiManager.showError('No analysis data available');
            return;
        }

        try {
            const optimizeBtn = document.getElementById('optimizePromptBtn');
            const originalHTML = optimizeBtn.innerHTML;

            optimizeBtn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Optimizing...</span>
                </div>
            `;
            optimizeBtn.disabled = true;

            const description = document.getElementById('projectDescription').value.trim();
            const result = await octaveAPI.optimizePrompt(window.currentAnalysis.meta_prompt, description);

            if (result) {
                uiManager.showMetaPrompt(result.optimized_prompt);
                uiManager.showSuccess('Voice prompt optimized for better emotion and pacing!');
                window.currentAnalysis.meta_prompt = result.optimized_prompt;
            } else {
                uiManager.showError('Failed to optimize prompt');
            }

        } catch (error) {
            console.error('Error optimizing prompt:', error);
            uiManager.showError('Failed to optimize prompt');
        } finally {
            const optimizeBtn = document.getElementById('optimizePromptBtn');
            optimizeBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Optimize
            `;
            optimizeBtn.disabled = false;
        }
    }

    // Handle save to shortlist
    handleSaveToShortlist() {
        if (!window.currentVoices) {
            uiManager.showError('No voices available to save');
            return;
        }

        // Get selected voices (for now, save all)
        const selectedVoices = window.currentVoices.slice(0, 3); // Top 3 voices

        // Show shortlist modal
        document.getElementById('shortlistModal').classList.remove('hidden');

        // In a real app, you'd save to backend here
        console.log('Saving to shortlist:', selectedVoices);
    }

    // Handle get integration code
    handleGetIntegration() {
        if (!window.currentVoices || window.currentVoices.length === 0) {
            uiManager.showError('No voices available for integration');
            return;
        }

        // Use the first voice as example
        const voice = window.currentVoices[0];
        const integrationContent = document.getElementById('integrationContent');

        integrationContent.innerHTML = `
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Integration for ${voice.provider} - ${voice.name}</h4>
                <p class="text-sm text-gray-600 mb-4">Choose your preferred language:</p>
            </div>
            
            <div class="space-y-4">
                <div>
                    <h5 class="font-medium mb-2">Python</h5>
                    <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto"><code>import requests

url = "https://api.${voice.provider.toLowerCase()}.com/v1/text-to-speech"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "text": "${document.getElementById('projectDescription').value.slice(0, 50)}...",
    "voice": "${voice.id}",
    "output_format": "mp3"
}

response = requests.post(url, headers=headers, json=data)
with open("output.mp3", "wb") as f:
    f.write(response.content)</code></pre>
                </div>
                
                <div>
                    <h5 class="font-medium mb-2">JavaScript</h5>
                    <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto"><code>const response = await fetch('https://api.${voice.provider.toLowerCase()}.com/v1/text-to-speech', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '${document.getElementById('projectDescription').value.slice(0, 50)}...',
    voice: '${voice.id}',
    output_format: 'mp3'
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);</code></pre>
                </div>
            </div>
        `;

        document.getElementById('integrationModal').classList.remove('hidden');
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Handle window events
    setupWindowEvents() {
        window.addEventListener('beforeunload', () => {
            this.stopAllAudio();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAllAudio();
            }
        });
    }
}

// Export event manager instance
const eventManager = new EventManager();

// Global function for voice play buttons (called from HTML)
function handlePlayVoice(voiceId, voiceName, provider) {
    eventManager.handlePlayVoice(voiceId, voiceName, provider);
}

// Global function for customize buttons (called from HTML)
function handleCustomizeVoice(voiceId, voiceName, provider) {
    uiManager.showCustomizationPanel(voiceId, voiceName, provider);
}