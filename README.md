# Workout Timer Pro

A Progressive Web App (PWA) designed to help you manage workout sessions with precision timing, multiple repetitions, and audio/visual alerts.

## Features

- ⏱️ **Customizable Timer** - Set workout duration from 5 seconds to 1 hour
- 🔁 **Multiple Repetitions** - Track up to 99 consecutive workout sets
- 🔊 **Audio Alerts** - Built-in Web Audio API beeps (no audio files needed)
- 📱 **Mobile-Optimized** - Responsive design with dark theme
- 🎵 **YouTube Integration** - Optional music playback during workouts
- 💾 **Settings Persistence** - Your preferences saved via localStorage
- 📴 **Offline-First PWA** - Works without internet after first visit
- 🚀 **Lightning Fast** - Vanilla JavaScript with Vite for optimal performance

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Preview production build
npm run preview
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### Working Prototype

For immediate testing, open `example/code.html` directly in your browser. This is a fully functional standalone version while the modular Vite implementation is in progress.

## Usage

1. **Set Your Timer**
   - Duration: Total workout time per set (default: 30 seconds)
   - Alert Time: Countdown beep starts this many seconds before finish (default: 5 seconds)
   - Repetitions: Number of sets to complete (default: 3)

2. **Optional: Load Music**
   - Paste a YouTube URL and click "Load" for background music

3. **Start Your Workout**
   - Click START to begin
   - Timer counts down with visual display
   - Alert beeps during final countdown
   - Completion melody plays between sets
   - Settings panel hides during workout

4. **Control Options**
   - PAUSE/RESUME: Pause and resume current set
   - RESET: Stop timer and return to settings

## Technology Stack

### Core
- **Vite 7.1+** - Build tool and lightning-fast dev server
- **Vanilla JavaScript (ES6+)** - No framework overhead
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with variables and gradients

### PWA Technologies
- **vite-plugin-pwa** - PWA generation and service worker management
- **Workbox** - Advanced caching strategies
- **Web App Manifest** - Installation metadata

### Browser APIs
- **Web Audio API** - Generated beep sounds (no audio files required)
- **YouTube IFrame API** - Optional music integration
- **localStorage** - Settings persistence
- **Service Workers** - Offline functionality

## Project Status

🚧 **Currently in Migration Phase**

- ✅ Working prototype: `example/code.html` (fully functional)
- 🚧 Modular architecture: Being implemented in `src/` directory
- 📋 PWA features: Planned with vite-plugin-pwa
- 📱 Installation: Coming soon

See `docs/plan.md` for detailed implementation roadmap.

## Design System

### Color Palette
- Primary Gradient: `#ff5722` → `#ff006e`
- Background: `#121212` → `#1a1a1a` gradient
- Alert Color: `#ff006e`
- Accent: `#ff6b6b`

### Audio Specifications
- Alert Beeps: 800Hz, 0.1s duration
- Completion (between reps): 523Hz + 659Hz (double beep)
- Final Completion: 523Hz + 659Hz + 784Hz (triple beep)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS and macOS)
- ✅ Samsung Internet

**Note**: PWA installation requires HTTPS (automatic on localhost for development).

## Performance Targets

- Lighthouse PWA Score: 90+
- Time to Interactive: <3s
- First Contentful Paint: <1.5s
- Bundle Size: <100KB
- Animations: 60fps

## Why Vanilla JavaScript?

This project deliberately uses vanilla JavaScript instead of React/Vue/Angular for several reasons:

- **Smaller Bundle Size**: ~40KB savings vs. framework overhead
- **Faster Performance**: Direct DOM manipulation, no virtual DOM
- **Simpler Architecture**: Perfect for single-page timer application
- **Easier to Learn**: Standard JavaScript without JSX or framework-specific concepts
- **Native Browser APIs**: Direct access without wrappers

## Future Enhancements

### Phase 2
- Custom workout presets
- Workout history tracking
- Statistics and analytics
- Export/import settings

### Phase 3
- Push notifications for reminders
- Social features and challenges
- Fitness tracker integration
- Voice commands

## Documentation

- `docs/plan.md` - Comprehensive implementation plan and architecture
- `CLAUDE.md` - Development guidance for AI assistants
- `docs/DESIGN.md` - Visual design guidelines (planned)
- `docs/ARCHITECTURE.md` - Technical architecture (planned)
- `docs/PWA-IMPLEMENTATION.md` - PWA strategy details (planned)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please read the documentation in `docs/` before submitting pull requests.

---

**Built with ❤️ using Vite + Vanilla JavaScript** 
