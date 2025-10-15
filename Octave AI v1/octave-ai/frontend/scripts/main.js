// Main application initialization and flow management
class OctaveApp {
    constructor() {
        this.initialized = false;
        this.version = '1.0.0';
    }

    // Initialize the entire application
    async init() {
        try {
            console.log('🎵 Initializing Octave AI Frontend v' + this.version);

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize all managers in order
            this.initializeUI();
            this.initializeEvents();
            this.setupErrorHandling();
            this.checkBackendConnection();

            this.initialized = true;
            console.log('✅ Octave AI Frontend initialized successfully');

            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Failed to initialize Octave AI Frontend:', error);
            this.handleInitializationError(error);
        }
    }

    // Initialize UI manager
    initializeUI() {
        console.log('🎨 Initializing UI Manager...');
        uiManager.init();
    }

    // Initialize event manager
    initializeEvents() {
        console.log('⚡ Initializing Event Manager...');
        eventManager.init();
        eventManager.setupWindowEvents();
    }

    // Setup global error handling
    setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Uncaught error:', event.error);
            uiManager.showError('An unexpected error occurred. Please refresh the page.');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            uiManager.showError('A network error occurred. Please check your connection.');
            event.preventDefault();
        });
    }

    // Check backend API connection
    async checkBackendConnection() {
        try {
            console.log('🔌 Checking backend connection...');

            // Try to ping the backend
            const backendURL = 'https://backend-eh7ldzeu5-lotfullah-muslimwals-projects.vercel.app/api';
            const response = await fetch(backendURL + '/health', {
                method: 'GET'
            });

            if (response.ok) {
                console.log('✅ Backend connection established');
                this.showBackendStatus(true);
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error) {
            console.log('⚠️ Backend not available, using mock data');
            console.error('Backend connection error:', error);
            this.showBackendStatus(false);
        }
    }

    // Show backend connection status
    showBackendStatus(connected) {
        const statusElement = document.getElementById('backendStatus');
        if (statusElement) {
            if (connected) {
                statusElement.textContent = '🟢 Connected to backend';
                statusElement.className = 'status-connected';
            } else {
                statusElement.textContent = '🟡 Using demo mode';
                statusElement.className = 'status-demo';
            }
        }
    }

    // Show welcome message
    showWelcomeMessage() {
        // Add a subtle welcome animation or message
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';

            // Animate in
            setTimeout(() => {
                container.style.transition = 'all 0.6s ease-out';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }

        // Show tip about keyboard shortcuts
        setTimeout(() => {
            this.showKeyboardShortcuts();
        }, 2000);
    }

    // Show keyboard shortcuts tip
    showKeyboardShortcuts() {
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #1f2937;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        tip.innerHTML = `
            💡 <strong>Tip:</strong> Press Ctrl+Enter to find voices, Escape to reset
        `;

        document.body.appendChild(tip);

        // Fade in
        setTimeout(() => {
            tip.style.opacity = '1';
        }, 100);

        // Fade out after 4 seconds
        setTimeout(() => {
            tip.style.opacity = '0';
            setTimeout(() => {
                if (tip.parentNode) {
                    tip.parentNode.removeChild(tip);
                }
            }, 300);
        }, 4000);
    }

    // Handle initialization errors
    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: #fee2e2;
            color: #991b1b;
            padding: 16px;
            text-align: center;
            z-index: 9999;
            border-bottom: 1px solid #fecaca;
        `;
        errorMessage.innerHTML = `
            <strong>⚠️ Initialization Error:</strong> 
            Failed to start Octave AI. Please refresh the page or contact support.
            <button onclick="location.reload()" style="margin-left: 12px; padding: 4px 8px; background: #991b1b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Refresh Page
            </button>
        `;

        document.body.insertBefore(errorMessage, document.body.firstChild);
    }

    // Get application info
    getInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            timestamp: new Date().toISOString()
        };
    }

    // Restart the application
    async restart() {
        console.log('🔄 Restarting Octave AI Frontend...');

        // Clean up
        eventManager.stopAllAudio();
        uiManager.reset();

        // Re-initialize
        this.initialized = false;
        await this.init();
    }
}

// Create and initialize the application
const octaveApp = new OctaveApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        octaveApp.init();
    });
} else {
    // DOM is already ready
    octaveApp.init();
}

// Make app available globally for debugging
window.octaveApp = octaveApp;

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { octaveApp, uiManager, eventManager, octaveAPI };
}