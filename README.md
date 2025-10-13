# CYCLE

A futuristic Progressive Web App (PWA) designed for high-intensity workout sessions with precision timing, curated workout music library, and an immersive cyberpunk aesthetic. Features 180+ verified tracks across 8 moods and 10 genres, all 30+ minutes long for uninterrupted workouts.

## ✨ Features

### Core Timer Functions
- ⏱️ **Customizable Work/Rest Cycles** - Set workout duration (5s-1hr) and rest periods (0-300s)
- 🔁 **Multiple Repetitions** - Track up to 99 consecutive workout sets with automatic progression
- 🔊 **Audio Alerts** - Web Audio API beeps with custom frequencies (no audio files needed)
- 📳 **Haptic Feedback** - Vibration patterns for mobile devices during alerts and completions
- 🎯 **Smart Volume Ducking** - Music automatically reduces to 25% during final countdown alerts
- 💾 **Auto-Save Settings** - All preferences automatically persist on change

### Music Integration

#### Three Music Modes
- 🔗 **Link Mode** - Load any YouTube video by pasting URL
- 😄 **Mood Mode** - Choose from 8 curated workout moods:
  - Beast Mode • Intense • Energetic • Power • Aggressive • Pump Up • Focus • Motivated
- 🎸 **Genre Mode** - Select from 10 workout music genres:
  - EDM • Rock • Hip Hop • Metal • Trap • Dubstep • Hardstyle • Techno • Phonk • DnB

#### Live YouTube Search
- 🔍 **Smart Search Input** - Type any song or artist name to search YouTube in real-time
- 🎬 **Video Results with Thumbnails** - See actual videos (not just suggestions) with preview images
- ⏱️ **Duration Display** - Each result shows video length (MM:SS or HH:MM:SS format)
- 🎯 **Click to Play** - Instantly load and play any video from search results
- 🔗 **URL Detection** - Paste a YouTube link → dropdown hides, loads video directly
- 🔎 **Live Autocomplete** - Type to search → dropdown shows 6 real video results with metadata
- ⚡ **Serverless Backend** - Secure YouTube API integration via Netlify Functions
- 🎵 **No Filters** - Find songs (3-4 min) or long mixes (1+ hour) - complete flexibility

#### Curated Music Library
- 📚 **180+ Verified Tracks** - Curated collection of 30+ minute workout mixes
- 🎯 **Quality Filtered** - All tracks have 10K+ views and verified playability
- 🔄 **Auto-Updating** - Music library refreshes every 30 days for compliance
- 🎲 **Smart Fallback** - Auto-loads alternative song if embedding is disabled (Error 150)

#### Playback Features
- 🎵 **Fullscreen Background Video** - YouTube videos as immersive 30% opacity backgrounds
- 🎛️ **Music Controls Widget** - Play/pause, progress bar with seeking, time display
- 📊 **Song Information** - Title, artist, duration in detailed tooltip
- 🔄 **Seamless Playback** - Music continues during rest periods, syncs with timer lifecycle
- 🎼 **Music Selection UI** - Beautiful grid with thumbnails, duration, and artist info

### History & Tracking
- 📜 **Song History** - Track all songs you've played with timestamps
- 🏆 **Most Played** - View your top 20 most-played workout tracks
- 🖼️ **Visual History** - Thumbnails, titles, artists, play counts, and durations
- 🔄 **Quick Replay** - Click any history item to instantly reload that song

### User Experience
- 👆 **Touch Gestures** - Double tap to start/pause, swipe down to reset (mobile)
- ⌨️ **Keyboard Shortcuts** - Space to start/pause, R to reset (desktop)
- 💾 **Settings Persistence** - All preferences saved via localStorage
- 📱 **Mobile-Optimized** - Responsive design with touch-friendly controls
- 📴 **Offline-First PWA** - Installable app that works without internet after first visit
- 🔔 **Smart Notifications** - Visual feedback for actions, errors, and song loading
- 📲 **Install Prompt** - One-click PWA installation with native app experience
- 🔄 **Version Check System** - Automatic client-server version comparison with force update
- 🛡️ **Smart Updates** - Preserves user data (settings, history) during cache clearing
- ✨ **Visual Update Overlay** - Animated cyberpunk update screen with progress steps
- 🏷️ **Dynamic Version Display** - Real-time version info synced from package.json

### Visual Design
- 🎨 **Cyberpunk Theme** - Neon colors, animated grid, scanlines, floating orbs
- 🌈 **Animated Background** - Tech grid pattern with neon orbs and scanlines
- ✨ **Dynamic Glow Effects** - State-based color transitions (cyan/pink/purple)
- 🔄 **Smooth Animations** - 60fps transitions with GPU-accelerated effects
- 📐 **Responsive Layout** - Adapts from mobile to desktop seamlessly
- ⚡ **Custom Loader** - Branded loading screen with smooth transitions
- 🔄 **Update Overlay** - Animated version update screen with progress steps and checkmarks

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
   - Settings auto-save on every change

2. **Choose Your Workout Music** (Optional but recommended)

   **Option A: Link Mode** (Direct YouTube URL or Live Search)

   **URL Paste:**
   - Paste any YouTube URL (`youtube.com/watch?v=` or `youtu.be/`)
   - Click magnifying glass icon or press Enter
   - Video loads as fullscreen background with music controls widget

   **Live Search:**
   - Type any song name or artist (e.g., "golden", "eminem workout")
   - See real video results with thumbnails and duration
   - Use arrow keys (↑↓) to navigate, Enter to select
   - Or click any video to play instantly
   - Dropdown shows 6 most relevant videos with channel names

   **Option B: Mood Mode** (Curated playlists by feeling)
   - Click the "Mood" button (smiley icon)
   - Select from 8 workout moods:
     - **Beast Mode** - Maximum intensity, dominating workouts
     - **Intense** - Hard-hitting, extreme training music
     - **Energetic** - High energy, upbeat motivation
     - **Power** - Strength and powerlifting focus
     - **Aggressive** - Raw, aggressive trap/hardstyle
     - **Pump Up** - Hype and motivational anthems
     - **Focus** - Instrumental, concentration-focused
     - **Motivated** - Inspirational speeches + music
   - Browse 10+ verified mixes per mood with thumbnails
   - Click any track to load instantly

   **Option C: Genre Mode** (Curated by music style)
   - Click the "Genre" button (music notes icon)
   - Select from 10 workout genres:
     - **EDM** - Electronic dance music and cyberpunk vibes
     - **Rock** - Alternative and hard rock anthems
     - **Hip Hop** - Rap and hip hop workout bangers
     - **Metal** - Heavy metal and power metal
     - **Trap** - Aggressive trap and phonk
     - **Dubstep** - Heavy bass and drops
     - **Hardstyle** - Euphoric and raw hardstyle
     - **Techno** - Hard techno and industrial beats
     - **Phonk** - Drift phonk and Memphis rap
     - **DnB** - Drum and bass / neurofunk
   - Browse 10+ verified mixes per genre with thumbnails
   - Click any track to load instantly

   **Option D: History** (Your recent tracks)
   - Click the history button (clock icon)
   - **Recent Tab**: See your last 20 played songs
   - **Most Played Tab**: View your top 20 tracks
   - Each shows: thumbnail, title, artist, play count, duration
   - Click to instantly replay any song

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
- **Node.js 18+** - Backend automation for music library curation

### PWA Technologies
- **vite-plugin-pwa 1.0.3** - Service worker generation and PWA manifest
- **Workbox 7.3.0** - Advanced caching strategies with auto-update
- **Web App Manifest** - Installation metadata for all icon sizes

### Music Library System
- **YouTube Data API v3** - Automated music curation and verification
- **Smart Caching** - 30-day refresh cycle with timestamp tracking
- **Quality Filters** - 30+ min duration, 10K+ views, visible stats
- **18 Categories** - 8 moods + 10 genres with 10 tracks each
- **JSON Data Store** - Fast, offline-first music metadata

### Browser APIs
- **Web Audio API** - Programmatic beep generation with frequency/duration control
- **YouTube IFrame Player API** - Full playback control, metadata access, error handling
- **YouTube Data API v3** - Music library curation, auto-updating, and live search (backend)
- **Vibration API** - Haptic feedback patterns for mobile devices
- **Popover API** - Native tooltips and modal dialogs with JavaScript positioning fallback
- **localStorage** - Settings persistence, history tracking, play counts across sessions
- **Service Workers** - Offline functionality, background updates, auto-update detection
- **Intersection Observer** - Performance optimization for thumbnails (lazy loading)

### Backend & Serverless
- **Netlify Functions** - TypeScript serverless functions for secure API access
- **YouTube Search API** - Real-time video search with thumbnails, duration, and metadata
- **Environment Variables** - Secure API key storage in Netlify (YT_API_KEY)
- **Edge Functions** - `/api/youtube-search` endpoint for client-side searches

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
- Update overlay animations (icon rotation, step slide-ins, checkmark pops)

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
│   │   └── storage.js     # localStorage persistence + history tracking
│   ├── components/
│   │   └── search-dropdown.js  # YouTube search dropdown UI with thumbnails
│   ├── utils/
│   │   ├── dom.js         # DOM helper functions
│   │   ├── time.js        # Time formatting utilities
│   │   ├── gestures.js    # Touch gesture detection
│   │   ├── youtube-search.js   # YouTube search API + URL detection
│   │   ├── song_fetcher.js     # YouTube API music library automation
│   │   └── version-check.js    # Client-server version comparison + force update
│   ├── data/
│   │   ├── music-library.js        # Music library API + queries
│   │   ├── workout_music.json      # Curated music data (180+ tracks)
│   │   └── workout_music_cache.json # Cache with timestamps for refresh
│   └── app.js             # Main orchestrator + event handlers
├── css/
│   ├── variables.css      # Design tokens (colors, spacing, etc.)
│   ├── global.css         # Layout + background effects
│   ├── components.css     # UI element styles (includes search dropdown)
│   └── animations.css     # Keyframe animations
├── scripts/
│   └── generate-version.js # Build script for version.json generation
├── public/
│   └── version.json       # Generated version metadata (v, build time)
├── netlify/
│   └── functions/
│       └── youtube-search.mts  # Serverless function for secure YouTube API access
└── main.js                # Entry point + PWA registration
```

### State Management
- **Timer State:** currentTime, currentRep, isRunning, isResting
- **YouTube State:** player instance, isReady, currentVideoId, lazy-loaded
- **Audio State:** audioContext, vibrationEnabled, volumeDucking
- **Settings State:** Persisted in localStorage, auto-saved on change
- **History State:** Song play history, play counts, timestamps (localStorage)
- **Music Library:** 18 categories (8 moods + 10 genres) with metadata

### Music Library System
The app includes a sophisticated music curation system:

**song_fetcher.js** (Backend automation):
- YouTube Data API v3 integration with quota management
- Fetches 10 verified tracks per category (180+ total)
- Filters: 30+ minute videos, 10K+ views, no live/upcoming
- Auto-refresh every 30 days for policy compliance
- Rate limiting: 250ms between requests, 9000 unit daily budget
- Outputs: `workout_music.json` (clean) + `workout_music_cache.json` (timestamps)

**music-library.js** (Frontend API):
- Imports curated JSON data
- Provides functions: `getMoodPlaylists()`, `getGenreSongs()`, `getRandomSong()`
- Handles duplicate detection across categories
- Powers mood/genre selection UI

**Error Handling**:
- Error 150 (embedding disabled) detection
- Auto-loads random alternative track from library
- User notifications for errors and recoveries

### Version Check System
The app includes robust client-server version synchronization with visual feedback:

**Build-Time Generation** (`scripts/generate-version.js`):
- Reads version from `package.json` (single source of truth)
- Generates `version.json` with version, build time, build ID
- Runs automatically before every dev/build command
- Injected into client code via Vite define plugin

**Dynamic Version Display**:
- Version number in HTML header auto-updates on app load
- Reads from embedded `__APP_VERSION__` constant
- Single source of truth eliminates hardcoded versions
- Always displays current version from package.json

**Client-Side Checking** (`src/js/utils/version-check.js`):
- Fetches `/version.json` from server with cache-busting
- Compares client version (injected at build) with server version
- Checks every 5 minutes for active users
- Initial check on app load

**Visual Update Overlay**:
When version mismatch detected, displays animated cyberpunk overlay with:
- **Version Transition** - Shows old version → new version (e.g., `v1.0.4 → v1.0.5`)
- **Animated Icon** - Rotating, pulsing cyberpunk logo with color shifts
- **Progress Steps** - 3 animated steps with checkmarks:
  1. ✓ Clearing caches... (spins while active)
  2. ✓ Preserving your data... (spins while active)
  3. ✓ Loading new version... (spins while active)
- **Smooth Animations** - Cyan/pink glows, slide-ins, checkmark pops
- **Professional UX** - Users see exactly what's happening during update

**Force Update Flow**:
1. Version mismatch detected
2. Show visual update overlay with version numbers
3. Step 1: Unregister service workers + clear caches (animated)
4. Step 2: Preserve user data (`cycleSettings`, `cycleHistory`) (animated)
5. Step 3: Reload with cache-busting parameter (animated)
6. Page reloads with new version (~3-4 seconds total)

**Benefits**:
- ✅ Guarantees users run latest deployed version
- ✅ Critical fixes reach users immediately
- ✅ Prevents stale cache issues
- ✅ User data survives updates
- ✅ Professional visual feedback during updates
- ✅ Clear communication (shows old → new version)
- ✅ Branded cyberpunk aesthetic maintained

## 🚀 Why Vanilla JavaScript?

This project deliberately avoids frameworks for several advantages:

1. **Performance** - Direct DOM manipulation, no virtual DOM overhead
2. **Bundle Size** - Minimal overhead vs. 40KB+ for React alone
3. **Simplicity** - Single-page app doesn't need complex state management
4. **Learning** - Standard JavaScript, no framework-specific concepts
5. **Native APIs** - Direct access to Web Audio, YouTube, Vibration, Popover APIs
6. **Future-Proof** - No framework versioning or breaking changes

### Codebase Statistics
- **Total Lines:** ~3,200+ lines of production code
- **JavaScript:** ~2,000 lines (ES6 modules)
- **CSS:** ~800 lines (custom properties, animations)
- **HTML:** ~360 lines (semantic markup)
- **Data:** ~180 curated tracks with metadata
- **Dependencies:** Just 2 runtime deps (vite-plugin-pwa, workbox-window)

## 🎯 Project Status

### ✅ Completed Features (v1.0.5)
- [x] Core timer with work/rest cycles
- [x] YouTube background video integration
- [x] Music controls widget with seeking
- [x] **Curated Music Library** - 180+ tracks across 18 categories
- [x] **Three Music Modes** - Link, Mood (8), Genre (10)
- [x] **Live YouTube Search** - Real-time search with video thumbnails and duration
- [x] **Smart Search Dropdown** - 6 results with thumbnails, click to play instantly
- [x] **Serverless Backend** - Secure YouTube API via Netlify Functions
- [x] **URL Detection** - Auto-detects URLs vs search terms
- [x] **Song History System** - Recent + Most Played tabs
- [x] **Auto-Updating Library** - 30-day refresh automation
- [x] **Smart Error Recovery** - Error 150 fallback with alternatives
- [x] Touch gestures for mobile (double tap, swipe down)
- [x] Vibration API for haptic feedback
- [x] PWA with service worker + install prompt
- [x] Offline functionality with caching
- [x] Auto-save settings on change
- [x] Loading states with branded loader
- [x] Cyberpunk theme with animations
- [x] Smart volume ducking during alerts
- [x] Song info tooltip with popover
- [x] Keyboard shortcuts (Space, R)
- [x] Visual notifications system
- [x] **Version Check System** - Client-server comparison every 5 minutes
- [x] **Force Update Capability** - Clears cache while preserving user data
- [x] **Build-time version injection** - Single source of truth (package.json)
- [x] **Visual Update Overlay** - Animated cyberpunk update screen with progress
- [x] **Dynamic Version Display** - Auto-synced version number in HTML header
- [x] Netlify deployment configuration
- [x] Anchor positioning fallback for older browsers

### 🔮 Future Enhancements

**Phase 2 - User Customization:**
- Custom workout presets (save/load configurations)
- Workout session history tracking with statistics (duration, sets, dates)
- Export/import settings as JSON
- Multiple timers/intervals in sequence (complex HIIT programs)
- Custom alert sounds (upload MP3/WAV files)
- Playlist creation from library favorites
- Advanced search filters (duration range, channel, upload date)

**Phase 3 - Advanced Features:**
- Push notifications for workout reminders
- Background sync for workout logs
- Social features (share workouts, challenges, leaderboards)
- Fitness tracker integration (Apple Health, Google Fit)
- Voice commands (Web Speech API) - "Start workout", "Skip to rest"
- Dark/Light theme toggle with multiple color schemes
- Weekly workout statistics dashboard
- Spotify integration as alternative to YouTube

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

*Experience the future of workout timing with immersive visuals and a curated music library.*

🔗 **Live Demo:** [https://workouttimerpro.netlify.app](https://workouttimerpro.netlify.app)

🎮 **Key Features:**
- 🔍 **Live YouTube Search** - Find any song or mix instantly with real-time search
- 🎵 **180+ Curated Tracks** across 8 moods & 10 genres
- ⏱️ **Precision Timer** with work/rest cycles
- 📜 **Smart History** tracking your workout music
- 🎨 **Cyberpunk Theme** with neon animations
- 📱 **PWA** - Install and use offline
- 🔄 **Auto-Updating** music library
- ⚡ **Serverless Backend** - Secure API integration via Netlify
