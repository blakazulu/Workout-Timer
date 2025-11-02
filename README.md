# CYCLE

A futuristic Progressive Web App (PWA) designed for high-intensity workout sessions with precision timing, professional workout plans, curated workout music library, and an immersive cyberpunk aesthetic. Features 180+ verified tracks across 8 moods and 10 genres, 12 built-in workout plans, custom plan builder, and smart repetition system.

## ✨ Features

### 🏋️ Workout Plans System

#### Three Workout Modes

- **🚀 Quick Start** - Classic single-duration mode for simple workouts
  - Set duration, rest time, and repetitions
  - Perfect for beginners or quick sessions

- **📋 Built-in Plans** - 12 professionally designed workout programs
  - Beginner HIIT (15 min) - Perfect for getting started
  - Classic HIIT (20 min) - Standard interval training
  - Advanced HIIT (25 min) - High-intensity challenges
  - Tabata Protocol (16 min) - 20s work, 10s rest intervals
  - Boxing Rounds (25 min) - 3-minute rounds with 1-min rest
  - AMRAP 20 (25 min) - As Many Rounds As Possible
  - EMOM 15 (20 min) - Every Minute On the Minute
  - Circuit Training (30 min) - Multi-exercise circuits
  - Pyramid Power (25 min) - Progressive work intervals
  - Quick Burn (10 min) - Fast morning routine
  - Endurance Builder (35 min) - Stamina-focused training
  - MetCon Mix (30 min) - Metabolic conditioning

- **✏️ Custom Plans** - Build your own workout programs
  - 2-step creation wizard with intuitive interface
  - Drag-and-drop segment reordering
  - 26 professional segment types across 6 categories
  - Real-time duration calculation
  - Save, edit, and delete custom plans
  - Visual segment cards with type badges

#### Smart Repetition System 🧠

- **Intelligent Workout Structure**: Warmup/cooldown run once, only workout segments repeat
- **Auto-Recovery Insertion**: 30-second recovery automatically added between rounds
- **Time Efficient**: Saves 10-20 minutes on typical 3-rep workouts
- **Round Tracking**: Clear display of current round and total rounds
- **User Toggle**: Enable/disable via checkbox in settings panel

**Example Benefits:**
- **Without Smart Rep** (3 reps): (Warmup + Workout + Cooldown) × 3 = 60 minutes
- **With Smart Rep** (3 reps): Warmup + (Workout × 3 with recovery) + Cooldown = 41 minutes

#### Segment Type System

**26 Professional Segment Types** organized in 6 categories:

**PREPARATION** (3 types):
- Warmup - General body warmup
- Movement Prep - Dynamic stretches
- Activation - Muscle activation drills

**WORK** (5 types):
- HIIT Work - High-intensity intervals
- Tabata Work - 20s on, 10s off
- VO2 Max - Maximum aerobic capacity
- Threshold - Lactate threshold training
- Tempo - Sustained moderate effort

**REST** (4 types):
- Complete Rest - Full recovery
- Active Recovery - Light movement
- Transition - Movement between exercises
- Round Recovery - Between round rest

**ROUNDS** (4 types):
- Boxing Round - 3-minute fighting rounds
- AMRAP Block - Max rounds in time
- EMOM Round - Every minute on minute
- Circuit Round - Exercise rotation

**TRAINING SPECIFIC** (4 types):
- Strength Set - Heavy lifting sets
- Power Work - Explosive movements
- Endurance Work - Long-duration cardio
- Skill Practice - Technique focus

**COMPLETION** (3 types):
- Cooldown - Gradual heart rate reduction
- Static Stretch - Flexibility work
- Mobility Work - Joint mobility exercises

### Core Timer Functions

- ⏱️ **Customizable Work/Rest Cycles** - Set workout duration (5s-1hr) and rest periods (0-300s)
- 🔁 **Multiple Repetitions** - Track up to 99 consecutive workout sets with automatic progression
- 🧠 **Smart Repetition Mode** - Warmup/cooldown run once, workout segments repeat efficiently
- 📊 **Segment Timeline** - Visual timeline showing upcoming segments with type badges
- 🎯 **Round Counter** - Clear display of current round and total rounds during workouts
- 🔊 **Professional Workout Sounds** - Boxing gym atmosphere with whistle, bell, and completion sounds
  - 🥊 **Boxing Bell** - Rings at the end of each round (just like a real boxing gym)
  - 🎵 **Whistle Sound** - Signals when rest period ends and it's time to work
  - 🔔 **Three Bells** - Celebrates workout completion with triumphant bell sequence
  - ⏸️ **Smart Timing** - Timer pauses while transition sounds play for clear audio feedback
  - 🎚️ **80% Volume** - Perfectly balanced for motivating feedback
- 🔊 **Countdown Alerts** - Web Audio API beeps (3, 2, 1) before each transition
- 📳 **Haptic Feedback** - Vibration patterns for mobile devices during alerts and completions
- 🎯 **Smart Volume Ducking** - Music automatically reduces to 25% during final countdown alerts
- 💾 **Auto-Save Settings** - All preferences automatically persist on change
- 📱 **Screen Wake Lock** - Prevents screen auto-lock during active workouts (mobile)

### Music Integration

#### Three Music Modes

- 🔗 **Link Mode** - Load any YouTube video by pasting URL or live search
- 😄 **Mood Mode** - Choose from 8 curated workout moods:
    - Beast Mode • Intense • Energetic • Power • Aggressive • Pump Up • Focus • Motivated
- 🎸 **Genre Mode** - Select from 10 workout music genres:
    - EDM • Rock • Hip Hop • Metal • Trap • Dubstep • Hardstyle • Techno • Phonk • DnB

#### Live YouTube Search

- 🔍 **Smart Search Input** - Type any song or artist name to search YouTube in real-time
- 🎬 **Video Results with Thumbnails** - See actual videos (not just suggestions) with preview images
- ⏱️ **Duration Display** - Each result shows video length (MM:SS or HH:MM:SS format)
- 🎯 **Click to Play** - Instantly load and play any video from search results
- 💖 **Inline Favorite Buttons** - Add any search result directly to favorites
- 🔗 **URL Detection** - Paste a YouTube link → dropdown hides, loads video directly
- 🔎 **Live Autocomplete** - Type to search → dropdown shows 6 real video results with metadata
- ⌨️ **Keyboard Navigation** - Arrow keys (↑↓) to navigate, Enter to select
- ⚡ **Serverless Backend** - Secure YouTube API integration via Netlify Functions (TypeScript)
- 🎵 **No Filters** - Find songs (3-4 min) or long mixes (1+ hour) - complete flexibility

#### Curated Music Library

- 📚 **180+ Verified Tracks** - Curated collection of 30+ minute workout mixes
- 🎯 **Quality Filtered** - All tracks have 10K+ views and verified playability
- 🔄 **Auto-Updating** - Music library refreshes every 30 days for compliance
- 🎲 **Smart Fallback** - Auto-loads alternative song if embedding is disabled (Error 150)
- 💖 **Favorite Any Song** - Inline favorite buttons on ALL song lists
- 🌟 **Visual Highlights** - Favorited songs stand out with pink gradient effects

#### Playback Features

- 🎵 **Fullscreen Background Video** - YouTube videos as immersive 30% opacity backgrounds
- 🎛️ **Music Controls Widget** - Play/pause, progress bar with seeking, time display
- 📊 **Song Information** - Title, artist, duration in detailed tooltip
- 💖 **Primary Favorite Button** - Quick favorite from music controls widget
- 🔄 **Seamless Playback** - Music continues during rest periods, syncs with timer lifecycle
- 🎼 **Music Selection UI** - Beautiful grid with thumbnails, duration, and artist info

### Media Library & Favorites

- 📚 **Music Library** - Track all songs you've played with timestamps
- 🏆 **Most Played** - View your top 20 most-played workout tracks
- 💖 **Favorite Songs** - Save your favorite tracks for quick access across ALL music views
- 🔀 **Random Favorites** - Randomly play from your favorited collection (Fisher-Yates shuffle)
- 📤 **Export Favorites** - Download favorites as JSON with metadata
- 📥 **Import Favorites** - Import and merge favorites from backup files
- 🎯 **Global Sync** - All favorite buttons update across entire app in real-time
- 🖼️ **Visual Library** - Thumbnails, titles, play counts, durations with enhanced styling
- 🔄 **Quick Replay** - Click any library item to instantly reload that song
- ⭐ **Favorite Highlighting** - Favorited songs stand out with pink gradient effects everywhere
- 🏷️ **Heart Badges** - Visual indicators on favorited items throughout the app
- 🔢 **Badge Counter** - Real-time count on Library button header

### Dynamic Settings Panel

- 🎛️ **Context-Aware Layout** - Adapts to selected workout mode:
  - **Quick Start**: 2×2 grid (Duration, Alert Time, Repetitions, Rest Time)
  - **Preset Plans**: Plan card + Alert Time + Repetitions + Smart Repetition toggle
  - **Custom Plans**: Plan card + settings + Edit button for modifications
- 🧠 **Smart Repetition Toggle** - Enable/disable with informational popover
- 💾 **Auto-Save** - All settings persist automatically on change
- 🎯 **Plan Selector Button** - Easy access to change workout plans with visual arrow
- 👁️ **View Details** - Inspect preset plan segments before starting

### User Experience

- 👆 **Touch Gestures** - Double tap to start/pause, swipe down to reset (mobile)
- ⌨️ **Keyboard Shortcuts** - Space to start/pause, R to reset (desktop)
- 💾 **Settings Persistence** - All preferences saved via localStorage
- 📱 **Mobile-Optimized** - Responsive design with touch-friendly controls
- 📴 **Offline-First PWA** - Installable app that works without internet after first visit
- 🔔 **Smart Notifications** - Visual feedback for actions, errors, and song loading
- 📲 **Install Prompt** - One-click PWA installation with native app experience
- 🔄 **Version Check System** - Automatic client-server version comparison with force update
- 🛡️ **Smart Updates** - Preserves user data (settings, history, favorites, plans) during cache clearing
- ✨ **Visual Update Overlay** - Animated cyberpunk update screen with progress steps
- 🏷️ **Dynamic Version Display** - Real-time version info synced from package.json
- 📱 **Screen Wake Lock** - Keeps screen on during active workouts (mobile browsers)
- 📊 **Privacy-Focused Analytics** - Anonymous usage tracking with PostHog (opt-out available)

### Visual Design

- 🎨 **Cyberpunk Theme** - Neon colors, animated grid, scanlines, floating orbs
- 🌈 **Animated Background** - Tech grid pattern with neon orbs and scanlines
- ✨ **Dynamic Glow Effects** - State-based color transitions (cyan/pink/purple)
- 🔄 **Smooth Animations** - 60fps transitions with GPU-accelerated effects
- 📐 **Responsive Layout** - Adapts from mobile to desktop seamlessly
- ⚡ **Custom Loader** - Branded loading screen with smooth transitions
- 🔄 **Update Overlay** - Animated version update screen with progress steps and checkmarks
- 📜 **Custom Scrollbars** - Beautiful gradient scrollbars matching app theme
- ✅ **Elegant Checkboxes** - Bouncy animations with gradient effects

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

1. **Choose Your Workout Mode**

   **Option A: Quick Start (Classic Single Duration)**
   - Click "Quick Start" in the plan selector
   - Configure Duration, Rest Time, Alert Time, Repetitions in 2×2 grid
   - Perfect for simple workouts or beginners

   **Option B: Built-in Plans (12 Professional Programs)**
   - Click "Built-in Plans" in the plan selector
   - Browse 12 preset workout programs with visual cards
   - Each shows duration, segments, and intensity
   - Click any plan to select and view settings

   **Option C: Custom Plans (Build Your Own)**
   - Click "My Plans" in the plan selector
   - Click "+ New Plan" to open the Plan Builder
   - **Step 1**: Add segments from 26 professional types
     - Choose category: Preparation, Work, Rest, Rounds, Training, Completion
     - Set duration for each segment
     - Drag to reorder segments
     - Delete unwanted segments
   - **Step 2**: Name your plan and add description
   - Click "Save Plan" to save for future workouts
   - Edit or delete plans anytime from My Plans view

2. **Configure Plan Settings** (for Built-in & Custom Plans)
   - **Alert Time**: Countdown warning starts this many seconds before finish (default: 3)
   - **Repetitions**: Number of times to repeat the workout (default: 3)
   - **Smart Repetition** ⭐: Toggle on/off
     - ✅ **ON** (Recommended): Warmup/cooldown run once, workout segments repeat with 30s recovery
     - ❌ **OFF**: Entire plan repeats including warmup/cooldown
     - Click info icon (ℹ️) for detailed explanation

3. **Choose Your Workout Music** (Optional but recommended)

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
    - Click heart icon (💖) to add to favorites
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
    - Click heart icon (💖) on any song to favorite

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
    - Click heart icon (💖) on any song to favorite

   **Option D: Music Library** (Your tracks & favorites)
    - Click the Library button (clock icon) in the header
    - **Recent Tab**: See your last 20 played songs with enhanced card styling
    - **Most Played Tab**: View your top 20 tracks with beautiful gradient effects
    - **Favorites Tab**: Access all your favorited songs in one place
    - Each song shows: thumbnail, title, play count, duration, and favorite button
    - **Favorite Button**: Click the heart icon to save/unsave any song
    - **Favorited Songs**: Highlighted with pink gradient backgrounds everywhere
    - Click any song to instantly replay it
    - **Favorites Actions**:
        - 🔀 **Random** - Play a random song from your favorites (Fisher-Yates shuffle)
        - 📤 **Export** - Download your favorites as JSON backup
        - 📥 **Import** - Import and merge favorites from backup

4. **Start Your Workout**
    - Click START button (or press Space, or double-tap timer)
    - Settings panel hides, timer display appears
    - NEW TIMER and CLEAR ALL buttons appear
    - YouTube music starts playing automatically (if selected)
    - Timer counts down with cyan neon glow
    - Screen wake lock activates (mobile) - screen stays on

### During Workout

**Segment Timeline:**
- Visual timeline shows all upcoming segments
- Current segment highlighted with type badge
- Duration displayed for each segment
- Round numbering when using repetitions (e.g., "Round 2/3")
- Auto-inserted recovery segments marked

**Work Period:**
- Timer displays in cyan (#00ffc8) with glow effects
- Segment info shows current type (e.g., "HIIT Work - Round 2/3")
- Music plays at normal volume

**Alert Period** (Final 3 seconds):
- Timer glows pink (#ff0096) with pulsing animation
- Music volume ducks to 25%
- Countdown beeps at 3s, 2s, 1s (800Hz)
- Vibration on mobile devices

**Segment Complete:**
- Timer pauses at 0:00
- 🔔 **Boxing bell rings** (professional gym sound at 80% volume)
- Vibration pattern
- Bell finishes (timer waits), then next segment begins
- Music continues at normal volume

**Rest Period:**
- Timer displays "REST - Next: [Segment Name]"
- Background tints cyan
- Music continues at normal volume
- Alert beeps at 3s, 2s, 1s

**Rest Complete:**
- Timer pauses at 0:00
- 🎵 **Whistle blows** (sharp, motivating sound at 80% volume)
- Vibration pattern
- Whistle finishes (timer waits), then work starts

**Recovery Between Rounds** (Smart Repetition only):
- 30-second recovery automatically inserted
- Displays "Round Recovery - Next: Round X/Y"
- Same countdown alerts and whistle on completion

**Workout Completion:**
- Timer pauses at 0:00
- 🔔🔔🔔 **Three bells ring** (triumphant sequence at 80% volume)
- Triple vibration pattern
- Bells finish (timer waits), timer stops
- "✓ Complete!" message
- Music stops, settings panel returns
- Screen wake lock releases

### Controls

**Buttons:**
- **START/PAUSE** - Toggle timer (cyan gradient button, always visible)
- **NEW TIMER** - Stop timer, return to home, keep music playing (pink gradient, visible only when timer active)
- **CLEAR ALL** - Stop timer and music, clear everything, return to home (red gradient, visible only when timer active)

**Button Visibility:**
- **Home Page:** Only START button visible
- **Timer Active:** All three buttons (START/PAUSE, NEW TIMER, CLEAR ALL) visible

**Keyboard Shortcuts:**
- `Space` - Start/Pause timer
- `R` - Start new timer (keeps music playing)

**Touch Gestures (Mobile):**
- Double tap timer display - Start/Pause
- Swipe down on timer - Start new timer (with confirmation, keeps music playing)

**Music Controls Widget:**
- Play/Pause button - Toggle music independently
- Progress bar - Click to seek to specific time
- Info button (ℹ️) - Show song details tooltip
- Heart button (💖) - Add/remove from favorites

**Plan Selector:**
- View Details button - Inspect preset plan segments
- Edit button - Modify custom plans in Plan Builder
- Delete button - Remove custom plans (with confirmation)
- Active plan highlighted with cyan gradient

**Plan Builder:**
- Add Segment dropdown - Choose from 26 segment types
- Drag handles - Reorder segments with drag-and-drop
- Delete buttons - Remove unwanted segments
- Duration inputs - Set time for each segment
- Real-time total - See workout duration update

## 🛠️ Technology Stack

### Core Technologies

- **Vite 7.1.10** - Lightning-fast build tool and dev server
- **Vanilla JavaScript (ES6+)** - No framework overhead, pure performance
- **Tailwind CSS v4** - Utility-first CSS framework with custom design tokens
- **HTML5 with EJS** - Semantic markup with template partials
- **CSS3** - Custom properties, Grid, Flexbox, animations, custom scrollbars
- **Node.js 18+** - Backend automation for music library curation

### PWA Technologies

- **vite-plugin-pwa 1.0.3** - Service worker generation and PWA manifest
- **Workbox 7.3.0** - Advanced caching strategies with auto-update
- **Web App Manifest** - Installation metadata for all icon sizes

### Development Tools

- **vite-plugin-ejs 1.7.0** - EJS templating for HTML partials
- **sharp 0.34.4** - Image optimization
- **@tailwindcss/vite 4.1.14** - Tailwind CSS v4 integration
- **Playwright 1.48.2** - E2E testing framework

### Music Library System

- **YouTube Data API v3** - Automated music curation and verification
- **Smart Caching** - 30-day refresh cycle with timestamp tracking
- **Quality Filters** - 30+ min duration, 10K+ views, visible stats
- **18 Categories** - 8 moods + 10 genres with 10 tracks each
- **JSON Data Store** - Fast, offline-first music metadata

### Browser APIs

- **Web Audio API** - Programmatic beep generation with frequency/duration control
- **HTML5 Audio API** - Professional workout sound effects (MP3 playback with callbacks)
- **YouTube IFrame Player API** - Full playback control, metadata access, error handling
- **YouTube Data API v3** - Music library curation, auto-updating, and live search (backend)
- **Vibration API** - Haptic feedback patterns for mobile devices
- **Screen Wake Lock API** - Prevents screen auto-lock during workouts
- **Popover API** - Native tooltips and modal dialogs with JavaScript positioning fallback
- **localStorage** - Settings persistence, history tracking, play counts, favorites, plans across sessions
- **Service Workers** - Offline functionality, background updates, auto-update detection
- **Intersection Observer** - Performance optimization for thumbnails (lazy loading)

### Backend & Serverless

- **Netlify Functions** - TypeScript serverless functions for secure API access
- **YouTube Search API** - Real-time video search with thumbnails, duration, and metadata
- **Environment Variables** - Secure API key storage in Netlify (YT_API_KEY)
- **Edge Functions** - `/api/youtube-search` endpoint for client-side searches

### Analytics & Monitoring

- **PostHog** - Privacy-focused product analytics (anonymous, GDPR compliant)
- **Event Tracking** - Timer, music, favorites, plans, app engagement
- **User Opt-Out** - localStorage-based preference
- **Debug Mode** - Performance monitoring and diagnostics

### Fonts & Typography

- **Orbitron** - Display font for timer and headers (Google Fonts)
- **Rajdhani** - Body font for UI elements (Google Fonts)

## 🎨 Design System

### Color Palette (Cyberpunk Neon)

- **Primary (Cyan):** `#00ffc8` - Timer, borders, success states, segments
- **Accent (Hot Pink):** `#ff0096` - Alerts, music controls, CTA buttons
- **Secondary (Purple):** `#6464ff` - Rep counter, progress bars, info, plan highlights
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
- Custom gradient scrollbars (6px wide, animated)
- Bouncy checkbox animations with color shifts

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
- Smooth scrollbar transitions with hover glows
- Checkmark pop animation with bounce effect

## 📱 Browser Compatibility

### Fully Supported

- ✅ Chrome/Edge (Chromium 90+)
- ✅ Firefox 88+
- ✅ Safari 14+ (iOS and macOS)
- ✅ Samsung Internet 15+

### Feature Support

- **PWA Installation:** Requires HTTPS (auto on localhost)
- **Vibration API:** Mobile devices only
- **Screen Wake Lock API:** Chrome/Edge 84+, Safari 16.4+ (iOS)
- **Popover API:** Chrome 114+, fallback positioning for others
- **Web Audio API:** All modern browsers
- **YouTube IFrame API:** All browsers with JavaScript enabled

## ⚡ Performance Metrics

### Target Benchmarks

- **Lighthouse PWA Score:** 90+
- **Time to Interactive:** <3s
- **First Contentful Paint:** <1.5s
- **Total Bundle Size:** <200KB (vanilla JS + modular architecture)
- **Animation Frame Rate:** 60fps constant

### Optimization Strategies

- Lazy-loaded YouTube module (code splitting)
- CSS animations on GPU (transform/opacity only)
- Debounced progress updates (500ms interval)
- Efficient DOM manipulation (minimal reflows)
- Service worker caching (offline performance)
- Modular architecture (57 ES6 modules)
- Efficient audio memory management
- Wake lock for uninterrupted sessions

## 🏗️ Architecture

### Module Structure

```
src/
├── js/                     # 57 JavaScript modules (~3,200 lines)
│   ├── core/               # Core infrastructure (8 modules)
│   │   ├── app-state.js        # Centralized state management
│   │   ├── event-bus.js        # Pub/sub event system
│   │   ├── events.js           # Event definitions
│   │   ├── gesture-handler.js  # Touch gesture factory
│   │   ├── notifications.js    # Toast notification system
│   │   ├── pwa-install.js      # PWA installation prompt
│   │   ├── analytics.js        # PostHog wrapper
│   │   └── analytics-tracker.js # Event tracking automation
│   ├── modules/            # Business logic modules
│   │   ├── timer.js            # Core timer + smart repetition (334 lines)
│   │   ├── plans/              # Workout plans system (4 submodules)
│   │   │   ├── index.js            # Public API
│   │   │   ├── storage.js          # Plan CRUD operations
│   │   │   ├── presets.js          # 12 built-in plans
│   │   │   └── segment-types.js    # 26 segment type definitions
│   │   ├── youtube/            # IFrame Player API (5 submodules)
│   │   │   ├── index.js
│   │   │   ├── player.js
│   │   │   ├── video-loader.js
│   │   │   ├── playback-controls.js
│   │   │   └── ui-controls.js
│   │   ├── favorites/          # Favorites storage (3 submodules)
│   │   │   ├── index.js
│   │   │   ├── storage.js
│   │   │   └── shuffle.js          # Fisher-Yates shuffle
│   │   ├── favorites-ui/       # Favorites UI (6 submodules)
│   │   │   ├── index.js
│   │   │   ├── actions.js
│   │   │   ├── rendering.js
│   │   │   ├── state.js
│   │   │   ├── initialization.js
│   │   │   └── utils.js
│   │   ├── audio.js            # Web Audio + vibration + sounds
│   │   └── storage.js          # localStorage + history (207 lines)
│   ├── components/         # UI components
│   │   └── search-dropdown/    # YouTube search UI (6 submodules)
│   │       ├── index.js
│   │       ├── core.js
│   │       ├── events.js
│   │       ├── rendering.js
│   │       ├── navigation.js
│   │       └── utils.js
│   ├── ui/                 # UI controllers (7 modules)
│   │   ├── event-handlers.js   # Central event coordination
│   │   ├── library-ui.js       # Music library popover
│   │   ├── mode-toggle.js      # Mood/Genre selector
│   │   ├── tooltip-handler.js  # Music info tooltip
│   │   ├── plan-selector.js    # Plan selection interface
│   │   ├── plan-builder.js     # Plan creation wizard
│   │   └── settings-panel.js   # Dynamic settings coordination
│   ├── utils/              # Utilities (10 modules)
│   │   ├── dom.js
│   │   ├── time.js
│   │   ├── gestures.js
│   │   ├── youtube-search.js
│   │   ├── favorite-button.js
│   │   ├── wake-lock.js        # Screen wake lock manager
│   │   ├── version-check.js    # Version system (238 lines)
│   │   └── song_fetcher/       # YouTube API automation (5 submodules)
│   │       ├── index.js
│   │       ├── config.js
│   │       ├── youtube-api.js
│   │       ├── filters.js
│   │       └── cache.js
│   ├── data/
│   │   ├── music-library.js        # Music library API
│   │   ├── workout_music.json      # 180+ curated tracks
│   │   └── workout_music_cache.json # Cache timestamps
│   ├── app.js              # Main orchestrator + event handlers
│   └── main.js             # Entry point + PWA registration
├── css/                    # 30+ CSS files (~4,000 lines)
│   ├── variables.css       # Design tokens (colors, spacing)
│   ├── global/             # Global styles (5 files)
│   │   ├── base.css
│   │   ├── background.css
│   │   ├── branding.css
│   │   ├── responsive.css
│   │   └── scrollbars.css      # Custom gradient scrollbars
│   ├── components/         # Component styles (25+ files)
│   │   ├── buttons.css
│   │   ├── timer.css
│   │   ├── music-controls.css
│   │   ├── plans.css           # Plan selector & builder styles
│   │   ├── settings.css        # Settings panel + checkboxes
│   │   ├── favorites/          # Favorites styling (2 files)
│   │   ├── library/            # Library styling (3 files)
│   │   ├── music-selection/    # Music selection (4 files)
│   │   └── ...
│   └── animations.css      # Keyframe animations
├── partials/               # HTML template partials (15 files)
│   ├── features/           # Feature components (8 files)
│   ├── layout/             # Layout templates (3 files)
│   ├── meta/               # Head & meta tags (2 files)
│   └── popovers/           # Popover dialogs (5 files)
├── scripts/
│   └── generate-version.js # Build-time version generation
├── public/
│   ├── sounds/             # Professional workout sound effects
│   │   ├── end_of_rest.mp3     # Whistle sound (rest complete)
│   │   ├── end_of_round.mp3    # Boxing bell (round complete)
│   │   └── workout_over.mp3    # Three bells (workout complete)
│   └── version.json        # Generated version metadata
├── netlify/
│   └── functions/
│       └── youtube-search.mts  # TypeScript serverless function (174 lines)
└── index.html              # Main HTML entry point (35 lines with EJS)
```

### State Management

- **Timer State:** currentTime, currentRep, isRunning, isResting, currentSegment
- **Plan State:** activePlanId, planType (simple/preset/custom), smartRepetition
- **YouTube State:** player instance, isReady, currentVideoId, lazy-loaded
- **Audio State:**
  - Web Audio API beeps: audioContext, vibrationEnabled, volumeDucking
  - Sound Effects: preloaded MP3s (whistle, bell, three bells), active clones tracking
  - Callback-based timing: timer waits for transition sounds to finish
  - Memory management: automatic cleanup of cloned audio elements
- **Settings State:** Persisted in localStorage, auto-saved on change
- **Library State:** Song play history, play counts, timestamps (localStorage)
- **Favorites State:** Favorited songs with metadata (localStorage)
- **Plans State:** Custom plans, active plan, usage stats (localStorage)
- **Music Library:** 18 categories (8 moods + 10 genres) with metadata
- **Wake Lock:** Screen wake lock status for mobile devices

### Workout Plans System

The app includes a sophisticated workout plan system:

**Preset Plans** (`/src/js/modules/plans/presets.js`):
- 12 professionally designed workout programs
- Each includes: name, description, duration, segments array
- Metadata: intensity level, category, focus areas
- Easy duplication and modification

**Segment Type System** (`/src/js/modules/plans/segment-types.js`):
- 26 segment types organized in 6 categories
- Each type includes: name, description, category, intensity, sound cues
- Supports custom durations per segment
- Icons and colors for visual identification

**Plan Storage** (`/src/js/modules/plans/storage.js`):
- Full CRUD operations for custom plans
- Active plan tracking and persistence
- Plan usage statistics and sorting
- Export/import as JSON
- Validation and error handling

**Smart Repetition** (`/src/js/modules/timer.js`):
- Category-based segment filtering
- Automatic recovery insertion (30s between rounds)
- Round counter with display
- Timer integration with segment progression
- Works with all plan types

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
4. Step 2: Preserve user data (`cycleSettings`, `cycleHistory`, `cycleFavorites`, `cyclePlans`) (animated)
5. Step 3: Reload with cache-busting parameter (animated)
6. Page reloads with new version (~3-4 seconds total)

**Benefits**:
- ✅ Guarantees users run latest deployed version
- ✅ Critical fixes reach users immediately
- ✅ Prevents stale cache issues
- ✅ User data survives updates (settings, history, favorites, plans)
- ✅ Professional visual feedback during updates
- ✅ Clear communication (shows old → new version)
- ✅ Branded cyberpunk aesthetic maintained

## 🚀 Why Vanilla JavaScript?

This project deliberately avoids frameworks for several advantages:

1. **Performance** - Direct DOM manipulation, no virtual DOM overhead
2. **Bundle Size** - Minimal overhead vs. 40KB+ for React alone
3. **Simplicity** - Single-page app doesn't need complex state management
4. **Learning** - Standard JavaScript, no framework-specific concepts
5. **Native APIs** - Direct access to Web Audio, YouTube, Vibration, Wake Lock, Popover APIs
6. **Future-Proof** - No framework versioning or breaking changes

### Codebase Statistics

- **Total Lines:** ~7,500+ lines of production code
- **JavaScript:** ~3,200 lines across 57 ES6 modules
- **CSS:** ~4,000 lines across 30+ files (Tailwind v4 + custom components)
- **HTML:** ~380 lines (index.html + 15 EJS partials)
- **TypeScript:** ~174 lines (Netlify serverless function)
- **Data:** ~180 curated tracks with metadata
- **Dependencies:** 4 production deps (Tailwind CSS v4, vite-plugin-pwa, workbox-window, sharp)

### Key Modules by Size
- `timer.js` - 334 lines (core timer + smart repetition logic)
- `version-check.js` - 238 lines (version sync system)
- `storage.js` - 207 lines (localStorage + history)
- `youtube-search.mts` - 174 lines (serverless backend)

## 🎯 Project Status

### ✅ Completed Features (v1.0.48)

**Core Workout System:**
- [x] Core timer with work/rest cycles
- [x] **Workout Plans System** - 12 built-in plans + custom plan builder
- [x] **Smart Repetition** - Warmup/cooldown once, workout segments repeat
- [x] **26 Segment Types** - Across 6 professional categories
- [x] **Plan Builder** - 2-step wizard with drag-and-drop
- [x] **Plan Selector** - 3 modes (Quick Start, Built-in, Custom)
- [x] **Dynamic Settings Panel** - Context-aware layout switching
- [x] **Segment Timeline** - Visual upcoming segments display
- [x] **Round Tracking** - Clear display of current/total rounds

**Audio & Sound:**
- [x] **Professional Workout Sounds** - Boxing bell, whistle, and completion bells
- [x] **Smart Audio Timing** - Timer pauses during transition sounds for clear feedback
- [x] **Countdown Beeps** - Alert sounds at 3, 2, 1 before transitions
- [x] **Memory-Optimized Audio** - Efficient sound playback with automatic cleanup
- [x] **Debug Mode** - Performance monitoring and audio diagnostics (developer tools)

**Music Integration:**
- [x] YouTube background video integration
- [x] Music controls widget with seeking
- [x] **Curated Music Library** - 180+ tracks across 18 categories
- [x] **Three Music Modes** - Link, Mood (8), Genre (10)
- [x] **Live YouTube Search** - Real-time search with video thumbnails and duration
- [x] **Smart Search Dropdown** - 6 results with thumbnails, click to play instantly
- [x] **Serverless Backend** - Secure YouTube API via Netlify Functions (TypeScript)
- [x] **URL Detection** - Auto-detects URLs vs search terms

**Favorites & Library:**
- [x] **Music Library System** - Recent + Most Played + Favorites tabs
- [x] **Favorite Songs** - Save, manage, and highlight your favorite tracks
- [x] **Inline Favorite Buttons** - Add favorites from ALL music views
- [x] **Global Sync** - All favorite buttons update across app in real-time
- [x] **Favorites Management** - Random playback, export/import JSON
- [x] **Fisher-Yates Shuffle** - True random distribution
- [x] **Enhanced Library Styling** - Beautiful gradient effects matching music selection UI
- [x] **Visual Highlights** - Favorited songs with pink gradients everywhere
- [x] **Badge Counter** - Real-time count on Library button

**Data Management:**
- [x] **Auto-Updating Library** - 30-day refresh automation
- [x] **Smart Error Recovery** - Error 150 fallback with alternatives
- [x] Touch gestures for mobile (double tap, swipe down)
- [x] Vibration API for haptic feedback
- [x] **Screen Wake Lock** - Keeps screen on during workouts (mobile)

**PWA & Installation:**
- [x] PWA with service worker + install prompt
- [x] Offline functionality with caching
- [x] Auto-save settings on change
- [x] Loading states with branded loader

**Visual Design:**
- [x] Cyberpunk theme with animations
- [x] Smart volume ducking during alerts
- [x] Song info tooltip with popover
- [x] Keyboard shortcuts (Space, R)
- [x] Visual notifications system
- [x] **Custom Scrollbars** - Beautiful gradient scrollbars (6px, animated)
- [x] **Elegant Checkboxes** - Bouncy animations with gradient effects

**Version Management:**
- [x] **Version Check System** - Client-server comparison every 5 minutes
- [x] **Force Update Capability** - Clears cache while preserving user data
- [x] **Build-time version injection** - Single source of truth (package.json)
- [x] **Visual Update Overlay** - Animated cyberpunk update screen with progress
- [x] **Dynamic Version Display** - Auto-synced version number in HTML header

**Infrastructure:**
- [x] Netlify deployment configuration
- [x] Anchor positioning fallback for older browsers
- [x] **PostHog Analytics** - Privacy-focused anonymous tracking
- [x] **Event Bus Architecture** - Decoupled pub/sub communication
- [x] **57 ES6 Modules** - Clean modular architecture

### 🎨 UI/UX Enhancements (v1.0.25+)
- [x] **Phosphor Icons** - Modern icon system with consistent styling
- [x] **Event Bus Architecture** - Decoupled pub/sub communication pattern
- [x] **Centralized App State** - Framework-free state management
- [x] **HTML Partials System** - Modular EJS templates for maintainability
- [x] **Mobile Font Accessibility** - Enhanced font sizing for better readability
- [x] **Genre Icon Hover Effects** - Visual feedback improvements
- [x] **Video Progress Bar Mobile Redesign** - Touch-optimized seeking
- [x] **Tailwind CSS v4 Migration** - Modern utility-first styling system
- [x] **Favorites System Enhancements** - Visual highlights and gradient effects
- [x] **Song Card Unification** - Consistent styling across all music views
- [x] **Custom Scrollbar Design** - Gradient scrollbars matching app theme
- [x] **Checkbox Group Redesign** - One-line layout with bouncy animations

### 🏗️ Architecture Improvements (v1.0.20+)
- [x] **Modular Refactoring** - Split monolithic files into 57 focused modules
- [x] **Test Infrastructure** - Playwright E2E testing setup
- [x] **Component Architecture** - Separated core, modules, components, UI, utils
- [x] **Submodule Organization** - YouTube (5), Favorites (3+6), Search (6), Song Fetcher (5), Plans (4)

### 🔮 Future Enhancements

**Phase 2 - Enhanced Plans:**
- Workout session history tracking with statistics (duration, sets, dates, plans used)
- Plan analytics (most used, completion rate, favorite segments)
- Export/import plans as JSON
- Share plans with friends (QR codes or URLs)
- Community plan library (browse and download)
- Advanced plan templates (progressive overload, periodization)

**Phase 3 - Music Features:**
- Custom alert sounds (upload MP3/WAV files)
- Playlist creation from library favorites
- Advanced search filters (duration range, channel, upload date)
- Spotify integration as alternative to YouTube
- Local music file support (MP3, WAV)
- Music mood detection and auto-matching to workout intensity

**Phase 4 - Advanced Features:**
- Push notifications for workout reminders
- Background sync for workout logs
- Social features (share workouts, challenges, leaderboards)
- Fitness tracker integration (Apple Health, Google Fit, Garmin)
- Voice commands (Web Speech API) - "Start workout", "Skip to rest"
- Dark/Light theme toggle with multiple color schemes
- Weekly workout statistics dashboard
- Achievement system and progress tracking

**Technical Improvements:**
- TypeScript migration for type safety
- Comprehensive unit tests with Vitest
- Enhanced E2E test coverage
- CI/CD pipeline with GitHub Actions
- Internationalization (i18n) for multiple languages
- Web Components for better modularity
- Accessibility audit (WCAG AA compliance)
- Performance monitoring (Core Web Vitals)

## 📚 Documentation

- `docs/plan.md` - Comprehensive implementation plan and architecture
- `docs/app_style.md` - Complete design system documentation
- `docs/features/` - Individual feature documentation (30+ files)
- `docs/fixes/` - Bug fix and improvement logs (50+ files)
- `CLAUDE.md` - Development guidance for AI assistants
- `netlify.toml` - Deployment configuration

## 🤝 Contributing

Contributions are welcome! Please:

1. Read the documentation in `docs/`
2. Follow the existing code style (ES6 modules, JSDoc comments)
3. Test on multiple browsers before submitting
4. Update documentation for new features
5. Keep the cyberpunk aesthetic consistent
6. Add tests for new features (Playwright E2E)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with 💜 using Vite + Vanilla JavaScript**

*Experience the future of workout timing with professional plans, immersive visuals, and a curated music library.*

🔗 **Live Demo:** [https://workouttimerpro.netlify.app](https://workouttimerpro.netlify.app)

🎮 **Key Features:**

- 🏋️ **12 Built-in Workout Plans** - Professional programs from beginner to advanced
- ✏️ **Custom Plan Builder** - Create plans with 26 segment types across 6 categories
- 🧠 **Smart Repetition** - Warmup/cooldown once, workout repeats efficiently
- 🔍 **Live YouTube Search** - Find any song or mix instantly with real-time search
- 🎵 **180+ Curated Tracks** across 8 moods & 10 genres
- 💖 **Favorite Songs** - Save and play random favorites from your collection everywhere
- ⏱️ **Precision Timer** with work/rest cycles and segment timeline
- 🥊 **Professional Sounds** - Boxing bell, whistle, and completion sounds for authentic gym experience
- 📚 **Music Library** - Beautiful visual library tracking your workout music with favorites
- 🎨 **Cyberpunk Theme** with neon gradient animations and custom scrollbars
- 📱 **PWA** - Install and use offline with screen wake lock
- 🔄 **Auto-Updating** music library every 30 days
- ⚡ **Serverless Backend** - Secure API integration via Netlify TypeScript Functions
- 📊 **Privacy-Focused Analytics** - Anonymous PostHog tracking with opt-out
