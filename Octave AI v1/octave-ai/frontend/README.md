# Octave AI Frontend

A modern, responsive web application for finding the perfect AI voice for your projects. Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.

## 🚀 Features

- **Intelligent Voice Matching**: Analyzes your project description to recommend the best AI voices
- **Multi-Provider Support**: Compare voices from OpenAI, ElevenLabs, Azure, and more
- **Real-time Audio Samples**: Preview how your script sounds with different voices
- **Cost Comparison**: See pricing across different providers
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **No Build Process**: Pure HTML/CSS/JS - just open and run

## 📁 Project Structure

```
frontend/
├── assets/                     # Static assets
│   ├── favicon.ico            # App favicon
│   ├── logo.png               # App logo (optional)
│   └── styles/                # Stylesheets
│       ├── main.css          # Core styles
│       └── table.css         # Voice table styles
│
├── scripts/                   # JavaScript files
│   ├── api.js                # Backend API functions
│   ├── ui.js                 # DOM updates and animations
│   ├── events.js             # Event handlers
│   └── main.js               # App initialization
│
├── pages/                     # HTML pages
│   └── index.html            # Main application page
│
├── .env                      # Environment variables
└── README.md                 # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for CORS compliance)

### Quick Start

1. **Clone or download** the project files
2. **Start a local server** in the frontend directory:

   ```bash
   # Using Python (if installed)
   python -m http.server 8080
   
   # Using Node.js http-server (if installed)
   npx http-server . -p 8080
   
   # Using PHP (if installed)
   php -S localhost:8080
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8080/pages/index.html
   ```

### Alternative: Direct File Access
You can also open `pages/index.html` directly in your browser, but some features may be limited due to CORS restrictions.

## 🎯 Usage

1. **Enter Project Description**: Describe your project, target audience, and desired tone
2. **Click "Find My Voice"**: The system analyzes your input and generates recommendations
3. **Review Generated Script**: See how your description is optimized for voice generation
4. **Compare Voices**: Browse recommended voices with cost comparisons
5. **Preview Audio**: Click play buttons to hear samples (when backend is connected)

## ⚙️ Configuration

### Environment Variables (.env)
```env
API_BASE_URL=http://localhost:5000/api  # Backend API URL
DEBUG_MODE=true                         # Enable debug logging
MOCK_API=true                          # Use mock data when backend unavailable
```

### Customization
- **Styling**: Modify `assets/styles/main.css` and `table.css`
- **API Integration**: Update `scripts/api.js` for your backend
- **UI Behavior**: Customize `scripts/ui.js` and `scripts/events.js`

## 🔌 Backend Integration

The frontend is designed to work with a Flask backend API. Key endpoints:

- `POST /api/analyze` - Analyze project description
- `POST /api/voices` - Get voice recommendations  
- `POST /api/generate-audio` - Generate audio samples
- `GET /api/health` - Health check

When the backend is unavailable, the app automatically falls back to mock data for development.

## 🎨 Architecture

### Component Structure
- **API Layer** (`api.js`): Handles all backend communication
- **UI Manager** (`ui.js`): Manages DOM updates and visual state
- **Event Manager** (`events.js`): Handles user interactions
- **Main App** (`main.js`): Orchestrates initialization and flow

### Key Features
- **Modular Design**: Each script file has a specific responsibility
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: Keyboard shortcuts and screen reader friendly

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- **Netlify**: Drag and drop the frontend folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a GitHub repository
- **AWS S3**: Upload files to an S3 bucket with static hosting

### CDN Integration
The app uses Tailwind CSS via CDN for styling. For production, consider:
- Self-hosting Tailwind CSS
- Using a custom CSS build
- Implementing a build process for optimization

## 🔧 Development

### Adding New Features
1. **API Functions**: Add to `scripts/api.js`
2. **UI Components**: Update `scripts/ui.js`
3. **Event Handlers**: Modify `scripts/events.js`
4. **Styling**: Edit CSS files in `assets/styles/`

### Debugging
- Enable `DEBUG_MODE=true` in `.env`
- Open browser developer tools
- Check console for detailed logging

### Testing
- Test across different browsers
- Verify responsive design on mobile
- Test with and without backend connection

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the browser console for error messages
- Verify your local server is running
- Ensure the backend API is accessible (if using)
- Review the network tab for failed requests

## 🔮 Roadmap

- [ ] Voice comparison side-by-side
- [ ] Export functionality for scripts
- [ ] Voice favorites and history
- [ ] Advanced filtering options
- [ ] Batch processing support
- [ ] Integration with more AI providers

---

Built with ❤️ by Lotfullah | Octave AI v1.0.0