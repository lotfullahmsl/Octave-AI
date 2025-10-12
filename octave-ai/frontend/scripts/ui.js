// Handles DOM updates, animations, and UI state management
class UIManager {
    constructor() {
        this.elements = {};
        this.state = {
            loading: false,
            currentStep: 0,
            steps: ['Analyzing Your Project', 'Generating Script', 'Creating Voice Samples']
        };
    }

    // Initialize UI elements
    init() {
        this.elements = {
            projectDescription: document.getElementById('projectDescription'),
            charCounter: document.getElementById('charCounter'),
            findVoiceBtn: document.getElementById('findVoiceBtn'),
            inputSection: document.getElementById('inputSection'),
            loadingSection: document.getElementById('loadingSection'),
            resultsSection: document.getElementById('resultsSection'),
            generatedText: document.getElementById('generatedText'),
            voiceTableBody: document.getElementById('voiceTableBody'),
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3')
        };

        this.updateCharCounter();
        this.updateButtonState();
    }

    // Character counter management
    updateCharCounter() {
        const length = this.elements.projectDescription.value.length;
        this.elements.charCounter.textContent = `${length}/500`;
    }

    // Button state management
    updateButtonState() {
        const hasText = this.elements.projectDescription.value.trim().length > 0;
        this.elements.findVoiceBtn.disabled = !hasText || this.state.loading;
    }

    // Loading state management
    setLoading(isLoading) {
        this.state.loading = isLoading;

        if (isLoading) {
            this.elements.findVoiceBtn.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                </div>
            `;
            this.elements.findVoiceBtn.disabled = true;
        } else {
            this.elements.findVoiceBtn.textContent = 'Find My Voice';
            this.updateButtonState();
        }
    }

    // Show loading section
    showLoading() {
        this.elements.inputSection.classList.add('hidden');
        this.elements.loadingSection.classList.remove('hidden');
        this.elements.resultsSection.classList.add('hidden');
    }

    // Update loading steps to match the exact design
    updateLoadingStep(stepIndex) {
        const steps = [this.elements.step1, this.elements.step2, this.elements.step3];

        steps.forEach((step, index) => {
            const icon = step.querySelector('.w-6');
            const text = step.querySelector('span');

            if (index < stepIndex) {
                // Completed step
                step.className = 'flex items-center p-4 bg-green-50 border border-green-200 rounded-lg';
                icon.className = 'w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3';
                icon.innerHTML = '✓';
                text.className = 'text-green-700 font-medium';
            } else if (index === stepIndex) {
                // Active step
                step.className = 'flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg';
                icon.className = 'w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3';
                icon.innerHTML = '<div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>';
                text.className = 'text-blue-700 font-medium';

                // Add animated dots
                const dots = step.querySelector('.ml-auto');
                if (dots) {
                    dots.innerHTML = `
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                    `;
                }
            } else {
                // Pending step
                step.className = 'flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50';
                icon.className = 'w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3';
                icon.textContent = index + 1;
                text.className = 'text-gray-600';
            }
        });
    }

    // Show results section
    showResults() {
        this.elements.loadingSection.classList.add('hidden');
        this.elements.resultsSection.classList.remove('hidden');
    }

    // Show generated text
    showGeneratedText(text) {
        this.elements.generatedText.textContent = text;
    }

    // Populate voice table with exact design from screenshots
    populateVoiceTable(voices) {
        this.elements.voiceTableBody.innerHTML = '';

        voices.forEach((voice, index) => {
            const row = document.createElement('div');
            row.className = 'voice-row';

            // Provider column with colored dot
            const providerClass = voice.provider.toLowerCase().replace(/\s+/g, '');

            row.innerHTML = `
                <div class="flex items-center">
                    <div class="provider-dot ${providerClass}"></div>
                    <span class="font-medium text-gray-900">${voice.provider}</span>
                </div>
                
                <div class="voice-info">
                    <h4>${voice.name}</h4>
                    <p class="voice-description">${voice.description}</p>
                    <div class="voice-tags">
                        <span class="voice-tag">${voice.gender || 'female'}</span>
                        <span class="voice-tag">${voice.accent || 'American'}</span>
                    </div>
                </div>
                
                <div class="text-center">
                    <button class="play-button" onclick="handlePlayVoice('${voice.id}', '${voice.name}', '${voice.provider}')">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="play-duration">${voice.duration || '4.5s'}</div>
                </div>
                
                <div class="cost-info">
                    <p class="cost-amount">$${voice.cost}</p>
                    <p class="cost-unit">per 1000 chars</p>
                </div>
                
                <div>
                    <button class="customize-btn" onclick="handleCustomizeVoice('${voice.id}', '${voice.name}', '${voice.provider}')">Customize</button>
                </div>
            `;

            this.elements.voiceTableBody.appendChild(row);
        });

        // Add mobile scroll hint for better UX
        this.addMobileScrollHint();
    }

    // Add scroll hint for mobile users
    addMobileScrollHint() {
        if (window.innerWidth <= 768) {
            const wrapper = document.querySelector('.voice-table-wrapper');
            if (wrapper && !wrapper.querySelector('.scroll-hint')) {
                const hint = document.createElement('div');
                hint.className = 'scroll-hint';
                hint.innerHTML = '← Swipe to see more →';
                hint.style.cssText = `
                    position: absolute;
                    bottom: 8px;
                    right: 16px;
                    font-size: 10px;
                    color: #9ca3af;
                    pointer-events: none;
                    opacity: 0.7;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 4px 8px;
                    border-radius: 4px;
                    animation: fadeInOut 3s ease-in-out infinite;
                `;
                wrapper.appendChild(hint);

                // Remove hint after user scrolls
                let scrollTimeout;
                wrapper.addEventListener('scroll', () => {
                    hint.style.opacity = '0';
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (hint.parentNode) {
                            hint.parentNode.removeChild(hint);
                        }
                    }, 1000);
                });
            }
        }
    }

    // Reset UI to initial state
    reset() {
        this.elements.inputSection.classList.remove('hidden');
        this.elements.loadingSection.classList.add('hidden');
        this.elements.resultsSection.classList.add('hidden');
        this.state.currentStep = 0;
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #fee2e2;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Show success message
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #d1fae5;
            color: #065f46;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #a7f3d0;
            z-index: 1000;
            max-width: 300px;
        `;
        successDiv.textContent = message;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Show customization panel for specific voice
    showCustomizationPanel(voiceId, voiceName, provider) {
        const panel = document.getElementById('customizationPanel');
        const title = document.getElementById('customizationTitle');
        const content = document.getElementById('customizationContent');

        title.textContent = `Customize ${voiceName}`;

        // Get voice-specific customization options
        const customizationOptions = this.getVoiceCustomizationOptions(provider, voiceName);

        content.innerHTML = `
            ${this.renderVoiceModelSection(provider, voiceName)}
            ${this.renderVoiceSettingsSection(provider)}
            ${this.renderActionButtons()}
        `;

        // Show the panel
        panel.classList.remove('hidden');

        // Setup event listeners for the customization panel
        this.setupCustomizationEvents(voiceId, voiceName, provider);
    }

    // Get customization options based on voice provider and name
    getVoiceCustomizationOptions(provider, voiceName) {
        const options = {
            showVoiceModels: true,
            availableModels: [],
            settings: ['speed', 'pitch', 'stability']
        };

        switch (provider.toLowerCase()) {
            case 'openai':
                options.availableModels = [
                    { id: 'alloy', name: 'Alloy', description: 'Neutral and professional', gender: 'neutral', accent: 'American' },
                    { id: 'echo', name: 'Echo', description: 'Deep and authoritative', gender: 'male', accent: 'American' },
                    { id: 'fable', name: 'Fable', description: 'Clear and articulate', gender: 'male', accent: 'British' },
                    { id: 'onyx', name: 'Onyx', description: 'Rich and smooth', gender: 'male', accent: 'American' },
                    { id: 'nova', name: 'Nova', description: 'Warm and engaging', gender: 'female', accent: 'American' },
                    { id: 'shimmer', name: 'Shimmer', description: 'Bright and friendly', gender: 'female', accent: 'American' }
                ];
                options.settings = ['speed'];
                break;
            case 'elevenlabs':
                options.availableModels = [
                    { id: 'rachel', name: 'Rachel', description: 'Calm and composed', gender: 'female', accent: 'American' },
                    { id: 'domi', name: 'Domi', description: 'Strong and confident', gender: 'female', accent: 'American' },
                    { id: 'bella', name: 'Bella', description: 'Soft and gentle', gender: 'female', accent: 'American' },
                    { id: 'antoni', name: 'Antoni', description: 'Well-rounded and versatile', gender: 'male', accent: 'American' },
                    { id: 'elli', name: 'Elli', description: 'Emotional and dynamic', gender: 'female', accent: 'American' },
                    { id: 'josh', name: 'Josh', description: 'Deep and authoritative', gender: 'male', accent: 'American' }
                ];
                options.settings = ['speed', 'stability', 'clarity'];
                break;
            case 'azure':
                options.availableModels = [
                    { id: 'jenny', name: 'Jenny', description: 'Friendly and approachable', gender: 'female', accent: 'American' },
                    { id: 'guy', name: 'Guy', description: 'Professional and clear', gender: 'male', accent: 'American' },
                    { id: 'aria', name: 'Aria', description: 'Expressive and natural', gender: 'female', accent: 'American' },
                    { id: 'davis', name: 'Davis', description: 'Confident and engaging', gender: 'male', accent: 'American' },
                    { id: 'jane', name: 'Jane', description: 'Warm and conversational', gender: 'female', accent: 'American' },
                    { id: 'jason', name: 'Jason', description: 'Casual and friendly', gender: 'male', accent: 'American' }
                ];
                options.settings = ['speed', 'pitch'];
                break;
        }

        return options;
    }

    // Render voice model selection section
    renderVoiceModelSection(provider, currentVoice) {
        const options = this.getVoiceCustomizationOptions(provider, currentVoice);

        return `
            <div class="voice-model-section">
                <h4 class="setting-label">Select Voice Model</h4>
                <div class="voice-model-grid">
                    ${options.availableModels.map(model => `
                        <div class="voice-model-card ${model.name === currentVoice ? 'selected' : ''}" data-voice-id="${model.id}">
                            <div class="voice-model-name">${model.name}</div>
                            <div class="voice-model-description">${model.description}</div>
                            <div class="voice-model-tags">
                                <span class="voice-model-tag">${model.gender}</span>
                                <span class="voice-model-tag">${model.accent}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render voice settings section
    renderVoiceSettingsSection(provider) {
        const options = this.getVoiceCustomizationOptions(provider);
        let settingsHTML = '<div class="voice-settings-section"><h4 class="setting-label">Voice Settings</h4>';

        if (options.settings.includes('speed')) {
            settingsHTML += `
                <div class="setting-group">
                    <label class="setting-label">Speed</label>
                    <div class="speed-options">
                        <div class="speed-option" data-speed="0.75">
                            <div class="speed-label">Slow</div>
                            <div class="speed-value">0.75x</div>
                        </div>
                        <div class="speed-option selected" data-speed="1.0">
                            <div class="speed-label">Normal</div>
                            <div class="speed-value">1.0x</div>
                        </div>
                        <div class="speed-option" data-speed="1.25">
                            <div class="speed-label">Fast</div>
                            <div class="speed-value">1.25x</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (options.settings.includes('pitch')) {
            settingsHTML += `
                <div class="setting-group">
                    <div class="slider-container">
                        <div class="slider-header">
                            <label class="setting-label">Pitch</label>
                            <span class="slider-value">0.00</span>
                        </div>
                        <input type="range" class="slider" id="pitchSlider" min="-20" max="20" value="0" step="1">
                        <div class="slider-labels">
                            <span>Lower</span>
                            <span>Normal</span>
                            <span>Higher</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (options.settings.includes('stability')) {
            settingsHTML += `
                <div class="setting-group">
                    <div class="slider-container">
                        <div class="slider-header">
                            <label class="setting-label">Stability</label>
                            <span class="slider-value">50%</span>
                        </div>
                        <input type="range" class="slider" id="stabilitySlider" min="0" max="100" value="50" step="1">
                        <div class="slider-labels">
                            <span>More Variable</span>
                            <span>Balanced</span>
                            <span>More Stable</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (options.settings.includes('clarity')) {
            settingsHTML += `
                <div class="setting-group">
                    <div class="slider-container">
                        <div class="slider-header">
                            <label class="setting-label">Clarity & Similarity</label>
                            <span class="slider-value">75%</span>
                        </div>
                        <input type="range" class="slider" id="claritySlider" min="0" max="100" value="75" step="1">
                        <div class="slider-labels">
                            <span>More Similar</span>
                            <span>Balanced</span>
                            <span>More Clear</span>
                        </div>
                    </div>
                </div>
            `;
        }

        settingsHTML += '</div>';
        return settingsHTML;
    }

    // Render action buttons
    renderActionButtons() {
        return `
            <div class="customization-actions">
                <button class="cancel-btn" id="cancelCustomization">Cancel</button>
                <button class="apply-btn" id="applyCustomization">Apply & Generate</button>
            </div>
        `;
    }

    // Setup event listeners for customization panel
    setupCustomizationEvents(voiceId, voiceName, provider) {
        // Close button
        document.getElementById('closeCustomization').addEventListener('click', () => {
            this.hideCustomizationPanel();
        });

        // Cancel button
        document.getElementById('cancelCustomization').addEventListener('click', () => {
            this.hideCustomizationPanel();
        });

        // Apply button
        document.getElementById('applyCustomization').addEventListener('click', () => {
            this.applyCustomization(voiceId, voiceName, provider);
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideCustomizationPanel();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Voice model selection
        document.querySelectorAll('.voice-model-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.voice-model-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Speed selection
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.speed-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Slider updates
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = e.target.closest('.slider-container').querySelector('.slider-value');
                const value = e.target.value;

                if (e.target.id === 'pitchSlider') {
                    valueSpan.textContent = value > 0 ? `+${value}` : value;
                } else {
                    valueSpan.textContent = `${value}%`;
                }
            });
        });
    }

    // Hide customization panel
    hideCustomizationPanel() {
        const panel = document.getElementById('customizationPanel');
        panel.classList.add('hidden');
    }

    // Apply customization settings
    applyCustomization(voiceId, voiceName, provider) {
        // Collect all settings
        const settings = {
            voiceId: voiceId,
            voiceName: voiceName,
            provider: provider
        };

        // Get selected voice model if available
        const selectedModel = document.querySelector('.voice-model-card.selected');
        if (selectedModel) {
            settings.selectedModel = selectedModel.dataset.voiceId;
        }

        // Get speed setting
        const selectedSpeed = document.querySelector('.speed-option.selected');
        if (selectedSpeed) {
            settings.speed = parseFloat(selectedSpeed.dataset.speed);
        }

        // Get slider values
        const pitchSlider = document.getElementById('pitchSlider');
        if (pitchSlider) {
            settings.pitch = parseInt(pitchSlider.value);
        }

        const stabilitySlider = document.getElementById('stabilitySlider');
        if (stabilitySlider) {
            settings.stability = parseInt(stabilitySlider.value);
        }

        const claritySlider = document.getElementById('claritySlider');
        if (claritySlider) {
            settings.clarity = parseInt(claritySlider.value);
        }

        console.log('Applying customization:', settings);
        this.showSuccess(`Applied customization for ${voiceName}`);
        this.hideCustomizationPanel();

        // Here you would typically send the settings to your API
        // octaveAPI.applyVoiceCustomization(settings);
    }
}

// Export UI manager instance
const uiManager = new UIManager();