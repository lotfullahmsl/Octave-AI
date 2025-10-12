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

    // Main find voice handler - matches the exact flow from screenshots
    async handleFindVoice() {
        const description = document.getElementById('projectDescription').value.trim();

        if (!description) {
            uiManager.showError('Please enter a project description');
            return;
        }

        if (description.length < 10) {
            uiManager.showError('Please provide a more detailed description (at least 10 characters)');
            return;
        }

        try {
            // Start loading state
            uiManager.setLoading(true);
            uiManager.showLoading();

            // Step 1: Analyzing Your Project
            uiManager.updateLoadingStep(0);
            await octaveAPI.delay(2000);

            // Step 2: Generating Script
            uiManager.updateLoadingStep(1);
            const analysisResult = await octaveAPI.analyzeProject(description);
            await octaveAPI.delay(1500);

            // Step 3: Creating Voice Samples
            uiManager.updateLoadingStep(2);
            const voicesResult = await octaveAPI.getVoiceRecommendations(analysisResult.analysis);
            await octaveAPI.delay(1500);

            // Show results
            uiManager.showResults();
            uiManager.showGeneratedText(analysisResult.generated_script);
            uiManager.populateVoiceTable(voicesResult.voices);

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