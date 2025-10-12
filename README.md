# Workout Timer Pro

A futuristic Progressive Web App (PWA) designed for high-intensity workout sessions with precision timing, YouTube background music, and an immersive cyberpunk aesthetic.

## ✨ Features

### Core Timer Functions
- ⏱️ **Customizable Work/Rest Cycles** - Set workout duration (5s-1hr) and rest periods (0-300s)
- 🔁 **Multiple Repetitions** - Track up to 99 consecutive workout sets with automatic progression
- 🔊 **Audio Alerts** - Web Audio API beeps with custom frequencies (no audio files needed)
- 📳 **Haptic Feedback** - Vibration patterns for mobile devices during alerts and completions
- 🎯 **Smart Volume Ducking** - Music automatically reduces to 25% during final countdown alerts

### YouTube Integration
- 🎵 **Fullscreen Background Video** - YouTube videos as immersive 30% opacity backgrounds
- 🎛️ **Music Controls Widget** - Play/pause, progress bar with seeking, time display
- 📊 **Song Information** - Title, artist, duration, and video ID in tooltip
- 🔄 **Seamless Playback** - Music continues during rest periods, syncs with timer lifecycle

### User Experience
- 👆 **Touch Gestures** - Double tap to start/pause, swipe down to reset (mobile)
- ⌨️ **Keyboard Shortcuts** - Space to start/pause, R to reset (desktop)
- 💾 **Settings Persistence** - Preferences saved via localStorage
- 📱 **Mobile-Optimized** - Responsive design with touch-friendly controls
- 📴 **Offline-First PWA** - Installable app that works without internet after first visit
- 🎨 **Cyberpunk Theme** - Neon colors, animated grid, scanlines, floating orbs

### Visual Design
- 🌈 **Animated Background** - Tech grid pattern with neon orbs and scanlines
- ✨ **Dynamic Glow Effects** - State-based color transitions (cyan/pink/purple)
- 🔄 **Smooth Animations** - 60fps transitions with GPU-accelerated effects
- 📐 **Responsive Layout** - Adapts from mobile to desktop seamlessly

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:5173` to see the app in action.

### Production Deployment

The app is configured for Netlify deployment:

```bash
# Build for production (disabled per user config)
# npm run build

# Deploy to Netlify
# Connected via Git - auto-deploys on push to main branch
```

## 📖 Usage Guide

### Setting Up Your Workout

1. **Configure Timer Settings** (2x2 grid layout)
   - **Duration**: Work time per set (default: 30 seconds)
   - **Alert Time**: Countdown warning starts this many seconds before finish (default: 3 seconds)
   - **Repetitions**: Number of sets to complete (default: 3)
   - **Rest Time**: Break between sets (default: 10 seconds)

2. **Load Background Music** (Optional)
   - Paste any YouTube URL (`youtube.com/watch?v=` or `youtu.be/`)
   - Click "Load" or press Enter
   - Video loads as fullscreen background with music controls widget
   - Loading overlay appears while video initializes

3. **Start Your Workout**
   - Click START button (or press Space, or double-tap timer)
   - Settings panel hides, timer display appears
   - YouTube music starts playing automatically
   - Timer counts down with cyan neon glow

### During Workout

**Work Period:**
- Timer displays in cyan (#00ffc8) with glow effects
- Rep counter shows "Rep X / Y"
- Music plays at normal volume

**Alert Period** (Final 3 seconds):
- Timer glows pink (#ff0096) with pulsing animation
- Music volume ducks to 25%
- Rapid beep sounds (800Hz)
- Vibration on mobile devices

**Rest Period:**
- Timer displays "REST - Next: Rep X / Y"
- Background tints cyan
- Music continues at normal volume
- Alert beeps in final 3 seconds

**Between Reps:**
- Double beep melody (523Hz + 659Hz)
- Double vibration pattern
- Automatic progression to next rep after rest

**Completion:**
- Triple beep melody (523Hz + 659Hz + 784Hz)
- Triple vibration pattern
- "✓ Complete!" message
- Music stops, settings panel returns

### Controls

**Buttons:**
- **START/PAUSE** - Toggle timer (cyan gradient button)
- **RESET** - Stop and return to settings (pink gradient button)

**Keyboard Shortcuts:**
- `Space` - Start/Pause timer
- `R` - Reset timer

**Touch Gestures (Mobile):**
- Double tap timer display - Start/Pause
- Swipe down on timer - Reset (with confirmation)

**Music Controls Widget:**
- Play/Pause button - Toggle music independently
- Progress bar - Click to seek to specific time
- Info button (ℹ️) - Show song details tooltip

## 🛠️ Technology Stack

### Core Technologies
- **Vite 7.1.9** - Lightning-fast build tool and dev server
- **Vanilla JavaScript (ES6+)** - No framework overhead, pure performance
- **HTML5** - Semantic markup with modern APIs
- **CSS3** - Custom properties, Grid, Flexbox, animations

### PWA Technologies
- **vite-plugin-pwa 1.0.3** - Service worker generation and PWA manifest
- **Workbox 7.3.0** - Advanced caching strategies with auto-update
- **Web App Manifest** - Installation metadata for all icon sizes

### Browser APIs
- **Web Audio API** - Programmatic beep generation with frequency/duration control
- **YouTube IFrame Player API** - Full playback control and metadata access
- **Vibration API** - Haptic feedback patterns for mobile devices
- **Popover API** - Native tooltip with JavaScript fallback
- **localStorage** - Settings persistence across sessions
- **Service Workers** - Offline functionality and background updates

### Fonts & Typography
- **Orbitron** - Display font for timer and headers (Google Fonts)
- **Rajdhani** - Body font for UI elements (Google Fonts)

## 🎨 Design System

### Color Palette (Cyberpunk Neon)
- **Primary (Cyan):** `#00ffc8` - Timer, borders, success states
- **Accent (Hot Pink):** `#ff0096` - Alerts, music controls, CTA buttons
- **Secondary (Purple):** `#6464ff` - Rep counter, progress bars, info
- **Background:** `#0a0a0a` - Deep black base
- **Gradients:** Multi-color (cyan → pink → purple) for headers and effects

### Visual Effects
- Animated tech grid pattern with 40px cells
- Scanlines overlay (CRT monitor aesthetic)
- 3 floating neon orbs (400-500px, blurred, animated)
- Vignette darkening at edges
- Glow and shadow on all text elements
- Shimmer animations on timer display
- Border glow pulses with gradient

### Typography
- **Display (Orbitron):** Timer value (80px), headers (36px)
- **Body (Rajdhani):** Settings, labels, counters (14-18px)
- **Letter Spacing:** 2-4px for cyberpunk aesthetic
- **Text Shadow:** Neon glow effects on all text

### Animations
- 60fps GPU-accelerated transforms
- Gradient flow on headers (4s infinite)
- Grid movement (30s linear)
- Floating orbs (20-30s ease-in-out)
- Pulse glow on alerts (1s ease-in-out)
- Button ripple effects on interaction

## 📱 Browser Compatibility

### Fully Supported
- ✅ Chrome/Edge (Chromium 90+)
- ✅ Firefox 88+
- ✅ Safari 14+ (iOS and macOS)
- ✅ Samsung Internet 15+

### Feature Support
- **PWA Installation:** Requires HTTPS (auto on localhost)
- **Vibration API:** Mobile devices only
- **Popover API:** Chrome 114+, fallback positioning for others
- **Web Audio API:** All modern browsers
- **YouTube IFrame API:** All browsers with JavaScript enabled

## ⚡ Performance Metrics

### Target Benchmarks
- **Lighthouse PWA Score:** 90+
- **Time to Interactive:** <3s
- **First Contentful Paint:** <1.5s
- **Total Bundle Size:** <100KB (vanilla JS advantage)
- **Animation Frame Rate:** 60fps constant

### Optimization Strategies
- Lazy-loaded YouTube module (code splitting)
- CSS animations on GPU (transform/opacity only)
- Debounced progress updates (500ms interval)
- Efficient DOM manipulation (minimal reflows)
- Service worker caching (offline performance)

## 🏗️ Architecture

### Module Structure
```
src/
├── js/
│   ├── modules/
│   │   ├── timer.js       # Core timer logic + work/rest cycles
│   │   ├── youtube.js     # IFrame Player API integration
│   │   ├── audio.js       # Web Audio API + vibration
│   │   └── storage.js     # localStorage persistence
│   ├── utils/
│   │   ├── dom.js         # DOM helper functions
│   │   ├── time.js        # Time formatting utilities
│   │   └── gestures.js    # Touch gesture detection
│   └── app.js             # Main orchestrator + event handlers
├── css/
│   ├── variables.css      # Design tokens (colors, spacing, etc.)
│   ├── global.css         # Layout + background effects
│   ├── components.css     # UI element styles
│   └── animations.css     # Keyframe animations
└── main.js                # Entry point
```

### State Management
- **Timer State:** currentTime, currentRep, isRunning, isResting
- **YouTube State:** player instance, isReady, currentVideoId
- **Audio State:** audioContext, vibrationEnabled
- **Settings State:** Persisted in localStorage, loaded on init

## 🚀 Why Vanilla JavaScript?

This project deliberately avoids frameworks for several advantages:

1. **Performance** - Direct DOM manipulation, no virtual DOM overhead
2. **Bundle Size** - ~2,455 lines total vs. 40KB+ for React alone
3. **Simplicity** - Single-page app doesn't need complex state management
4. **Learning** - Standard JavaScript, no framework-specific concepts
5. **Native APIs** - Direct access to Web Audio, YouTube, Vibration APIs
6. **Future-Proof** - No framework versioning or breaking changes

## 🎯 Project Status

### ✅ Completed Features
- [x] Core timer with work/rest cycles
- [x] YouTube background video integration
- [x] Music controls widget with seeking
- [x] Touch gestures for mobile
- [x] Vibration API for haptic feedback
- [x] PWA with service worker
- [x] Offline functionality
- [x] Settings persistence
- [x] Loading states and error handling
- [x] Install prompt for PWA
- [x] Cyberpunk theme with animations
- [x] Smart volume ducking during alerts
- [x] Song info tooltip
- [x] Keyboard shortcuts
- [x] Netlify deployment configuration

### 🔮 Future Enhancements

**Phase 2 - User Features:**
- Custom workout presets (save/load configurations)
- Workout history tracking with statistics
- Export/import settings as JSON
- Multiple timers/intervals in sequence
- Custom alert sounds (upload MP3)

**Phase 3 - Advanced Features:**
- Push notifications for workout reminders
- Background sync for workout logs
- Social features (share workouts, challenges)
- Fitness tracker integration (Apple Health, Google Fit)
- Voice commands (Web Speech API)
- Dark/Light theme toggle
- More color schemes

**Technical Improvements:**
- TypeScript migration for type safety
- Unit tests with Vitest
- E2E tests with Playwright
- CI/CD pipeline with GitHub Actions
- Internationalization (i18n) for multiple languages
- Web Components for better modularity
- Accessibility audit (WCAG AA compliance)

## 📚 Documentation

- `docs/plan.md` - Comprehensive implementation plan and architecture
- `docs/app_style.md` - Complete design system documentation
- `CLAUDE.md` - Development guidance for AI assistants
- `netlify.toml` - Deployment configuration

## 🤝 Contributing

Contributions are welcome! Please:

1. Read the documentation in `docs/`
2. Follow the existing code style (ES6 modules, JSDoc comments)
3. Test on multiple browsers before submitting
4. Update documentation for new features
5. Keep the cyberpunk aesthetic consistent

## 📄 License

MIT License - See LICENSE file for details

---

**Built with 💜 using Vite + Vanilla JavaScript**

*Experience the future of workout timing with immersive visuals and seamless music integration.*

🔗 **Live Demo:** [Your Netlify URL here]

🎮 **Features:** Cyberpunk Theme • YouTube Background • Work/Rest Cycles • Touch Gestures • PWA
