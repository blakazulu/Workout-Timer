# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CYCLE** is a fully-implemented Progressive Web App (PWA) for high-intensity workout sessions with precision timing.
Built with Vite and vanilla JavaScript, it features work/rest cycles, repetition tracking, audio/visual alerts, haptic
feedback, YouTube background music with mood/genre selection, and an immersive cyberpunk aesthetic.

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Preview production build
npm run preview

# Install dependencies
npm install
```

**Note:** Build and git commit commands are disabled per user configuration.

## Architecture

The project follows a **modular ES6 architecture** with complete separation of concerns:

### Module Structure

```
src/
├── js/
│   ├── modules/
│   │   ├── timer.js          # Core timer with work/rest cycles (Timer class)
│   │   ├── youtube.js        # YouTube IFrame Player API integration
│   │   ├── audio.js          # Web Audio API + Vibration API for alerts
│   │   └── storage.js        # localStorage for settings + song history
│   ├── data/
│   │   └── music-library.js  # Curated music database (moods/genres)
│   ├── utils/
│   │   ├── dom.js            # DOM helpers ($, $$, addClass, removeClass)
│   │   ├── time.js           # Time formatting (formatTime)
│   │   ├── gestures.js       # Touch gesture detection (double tap, swipe)
│   │   └── song_fetcher.js   # Music fetching utilities
│   └── app.js                # Main orchestrator + event handlers
├── css/
│   ├── variables.css         # CSS custom properties (colors, spacing)
│   ├── global.css            # Layout + background effects
│   ├── components.css        # UI component styles
│   └── animations.css        # Keyframe animations
└── main.js                   # Entry point (imports CSS + app.js)
```

### Key Design Patterns

1. **Singleton Pattern** - Timer and Audio managers use singleton instances via `getTimer()` and `getAudio()` factory
   functions
2. **Lazy Loading** - YouTube module loaded on first interaction to reduce initial bundle size
3. **Event-Driven** - Gesture handlers use custom event emitters for touch interactions
4. **Separation of Concerns** - Each module has single responsibility (timer logic, audio, storage, etc.)

## Current Features

### Core Timer

- **Work/Rest Cycles** - Configurable work duration (5-3600s) and rest periods (0-300s)
- **Multiple Repetitions** - Up to 99 consecutive sets with automatic progression
- **Smart Alerts** - Final countdown warning with configurable alert time (1-60s)
- **Visual States** - Cyan glow during work, pink pulse during alerts, cyan tint during rest
- **Volume Ducking** - Music automatically reduces to 25% during final countdown alerts

### Audio & Haptic

- **Web Audio API** - Programmatic beep generation (no audio files needed)
    - Alert beeps: 800Hz during countdown
    - Completion: Double beep (523Hz + 659Hz) between reps
    - Final: Triple beep (523Hz + 659Hz + 784Hz) on completion
- **Vibration API** - Haptic feedback patterns on mobile devices (alert, completion)

### YouTube Integration

- **Fullscreen Background** - YouTube videos as 30% opacity immersive backgrounds
- **Three Input Modes:**
    - **Link Mode** - Direct YouTube URL input (supports youtube.com/watch?v= and youtu.be/)
    - **Mood Mode** - Select from 8 mood presets (Beast Mode, Intense, Energetic, Power, Aggressive, Pump Up, Focus,
      Motivated)
    - **Genre Mode** - Select from 10 genres (EDM, Rock, Hip Hop, Metal, Trap, Dubstep, Hardstyle, Techno, Phonk, DnB)
- **Music Controls Widget** - Play/pause, progress bar with seeking, time display, song info tooltip
- **Song History** - Tracks played songs with play counts, Recent/Most Played tabs

### User Experience

- **Touch Gestures** - Double tap timer to start/pause, swipe down to reset (mobile)
- **Keyboard Shortcuts** - Space to start/pause, R to reset (desktop)
- **Settings Persistence** - Preferences saved to localStorage, auto-load on startup
- **PWA Installation** - Install prompt with "Install App" button when available
- **Offline-First** - Service worker caches all assets, works without internet after first visit

### Visual Design (Cyberpunk Theme)

- **Animated Background** - Tech grid pattern with scanlines and floating neon orbs
- **Dynamic Glow Effects** - State-based color transitions (cyan/pink/purple)
- **Loading States** - App loader on startup, overlay when loading videos
- **Responsive Layout** - Mobile-optimized with touch-friendly controls

## Key Implementation Details

### Timer Logic (src/js/modules/timer.js)

The `Timer` class manages all workout timing logic:

```javascript
// State properties
this.duration        // Work time per set
this.alertTime       // Countdown warning time
this.repetitions     // Total sets to complete
this.restTime        // Break between sets
this.currentTime     // Countdown value
this.currentRep      // Current set number
this.isRunning       // Timer active state
this.isResting       // Rest period state
this.isAlertActive   // Alert state for volume ducking
```

**Timer Tick Flow** (src/js/modules/timer.js:140-180):

1. Decrement `currentTime` every second
2. Check if in alert zone (`currentTime <= alertTime`) → play beep, duck music volume
3. When `currentTime` reaches 0:
    - If `isResting`: Start next rep work period
    - Else if `currentRep < repetitions`: Play completion beep, start rest period (if restTime > 0)
    - Else: Stop timer, play final completion beep, show "✓ Complete!"

**Key Methods:**

- `start()` - Reads settings from inputs, starts interval, hides settings panel
- `pause()` - Clears interval, restores music volume
- `stop()` - Resets to initial state, shows settings panel
- `reset()` - Stops and resets counters
- `tick()` - Called every second, handles all timer logic
- `updateDisplay()` - Updates UI (timer value, rep counter, alert/rest states)

### Audio System (src/js/modules/audio.js)

Uses Web Audio API with no external files:

```javascript
// Audio context initialized on first user interaction
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Oscillator + Gain node pattern for each beep
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
```

**Beep Generation:**

- Alert: 800Hz, 0.1s duration
- Completion: 523Hz + 659Hz staggered (100ms apart)
- Final: 523Hz + 659Hz + 784Hz staggered (100ms, 200ms)
- Gain ramping: 0.3 → 0.01 exponential decay

**Vibration Patterns** (mobile only):

- Alert: Single 200ms pulse
- Completion: [200, 100, 200] pattern
- Final: [200, 100, 200, 100, 200] pattern

### YouTube Integration (src/js/modules/youtube.js)

**Lazy Loading Pattern** (src/js/app.js:34-41):

```javascript
async function loadYouTubeModule() {
  if (!youtubeModule) {
    const module = await import("./modules/youtube.js");
    youtubeModule = module.initYouTube("#youtube-player-iframe");
  }
  return youtubeModule;
}
```

**YouTube Player Methods:**

- `loadVideo(url)` - Parses URL, loads video, shows controls widget
- `play()` / `pause()` / `stop()` - Playback control
- `setVolume(level)` - 0-100 volume control (used for ducking)
- `getVolume()` - Returns current volume
- `seekTo(seconds)` - Seek to timestamp
- `getDuration()` - Get video length
- `getCurrentTime()` - Get current playback position

**URL Parsing:**

- `youtube.com/watch?v=VIDEO_ID` → extracts VIDEO_ID
- `youtu.be/VIDEO_ID` → extracts VIDEO_ID
- Embeds as fullscreen background iframe

### Music Library System (src/js/data/music-library.js)

Curated database of workout music organized by mood and genre:

```javascript
// Query functions
getMoodPlaylists(query)  // Returns array of playlist objects
getGenreSongs(query)     // Returns array of song objects
isMoodQuery(query)       // Determines if query is mood or genre

// Data structure
{
  url: "youtube.com/watch?v=...",
    title
:
  "Song Title",
    artist
:
  "Artist Name",
    duration
:
  3600,  // seconds
    thumbnail
:
  "https://i.ytimg.com/..."
}
```

### Storage & History (src/js/modules/storage.js)

**Settings Storage:**

```javascript
localStorage.setItem('cycleSettings', JSON.stringify({
  duration: 30,
  alertTime: 3,
  repetitions: 3,
  restTime: 10
}));
```

**Song History Schema:**

```javascript
localStorage.setItem('cycleHistory', JSON.stringify([
  {
    url: "youtube.com/watch?v=...",
    title: "Song Title",
    author: "Artist Name",
    duration: 3600,
    thumbnail: "https://...",
    playCount: 5,
    lastPlayed: 1234567890000  // timestamp
  }
]));
```

**API Functions:**

- `loadSettings()` - Load saved settings (returns defaults if none)
- `saveSettings(settings)` - Persist settings to localStorage
- `addToHistory(videoData)` - Track song play, increment play count
- `getSongHistory()` - Get recent songs (sorted by lastPlayed)
- `getMostPlayedSongs(limit)` - Get top songs (sorted by playCount)

### Touch Gestures (src/js/utils/gestures.js)

Custom gesture detection using touch events:

```javascript
const gestures = createGestureHandler(element);
gestures.on('doubleTap', callback);
gestures.on('swipeDown', callback);
```

**Implementation:**

- Double tap: Two taps within 300ms
- Swipe down: Touch move > 50px downward, completed in < 300ms
- Touch tracking: Records startY, endY, timestamps

### UI States & CSS Classes

**Timer Display States:**

- `.hidden` - Display hidden (settings visible)
- `.alert` - Pink pulsing glow (final countdown)
- `.resting` - Cyan background tint (rest period)

**Timer Value States:**

- `.warning` - Pink color (#ff0096) during alert
- `.rest-mode` - Cyan color (#00ffc8) during rest

**Rep Counter Content:**

- "Ready" - Idle state
- "Rep X / Y" - Work period
- "REST - Next: Rep X / Y" - Rest period
- "✓ Complete!" - All reps finished

**Button States:**

- START → PAUSE → RESUME → START (cycles based on timer state)

### PWA Configuration (vite.config.js)

**Service Worker Strategy:**

- `registerType: 'autoUpdate'` - Seamless background updates
- Precaches: All static assets (HTML, CSS, JS, images, icons)
- Runtime caching: YouTube embeds (CacheFirst, 30-day expiration)

**Manifest:**

- `name: "CYCLE"`
- `theme_color: "#ff5722"`
- `display: "standalone"`
- Icons: 72px to 512px (including maskable)

**Update Flow** (src/js/app.js:18-28):

```javascript
registerSW({
  onNeedRefresh() {
    // Prompt user to reload for update
  },
  onOfflineReady() {
    // App cached and ready for offline use
  }
});
```

### Popover API with Fallbacks

Uses native Popover API (Chrome 114+) with JavaScript positioning fallback:

```javascript
// Native popover (when supported)
<div popover id="tooltip">Content</div>
<button popovertarget="tooltip">Show</button>

// Fallback positioning (src/js/app.js:280-328)
if (!CSS.supports('position-anchor', '--test')) {
  // Manual positioning with getBoundingClientRect()
  // Viewport bounds checking
  // Scroll/resize listeners
}
```

## Design System

### Color Palette (Cyberpunk Neon)

- **Primary (Cyan):** `#00ffc8` - Timer text, borders, success states
- **Accent (Hot Pink):** `#ff0096` - Alerts, music controls, CTA buttons
- **Secondary (Purple):** `#6464ff` - Rep counter, progress bars
- **Background:** `#0a0a0a` - Deep black base
- **Multi-Gradient:** `linear-gradient(135deg, #00ffc8 0%, #ff0096 50%, #6464ff 100%)`

### Typography

- **Display Font:** Orbitron (Google Fonts) - Timer value, headers
- **Body Font:** Rajdhani (Google Fonts) - Settings, labels, UI text
- **Timer Display:** 80px, weight 900, letter-spacing 4px
- **Headers:** 36px, weight 800, gradient text fill

### Key Animations

- **Pulse Glow** - Alert state (1s ease-in-out infinite, scale 1 → 1.02)
- **Gradient Flow** - Header text (4s linear infinite)
- **Grid Movement** - Background pattern (30s linear infinite)
- **Floating Orbs** - 3 orbs with 20-30s ease-in-out animations
- **Shimmer** - Timer display text shadow animation

### Visual Effects

- Animated tech grid (40px cells, moving pattern)
- Scanlines overlay (CRT monitor aesthetic)
- 3 floating neon orbs (400-500px, blurred, animated)
- Vignette darkening at edges
- Text glow shadows on all elements
- Border glow pulses with gradient

## Browser Compatibility

### Fully Supported

- Chrome/Edge 90+ (Chromium)
- Firefox 88+
- Safari 14+ (iOS and macOS)
- Samsung Internet 15+

### Feature Support

- **PWA Installation:** Requires HTTPS (localhost exempt)
- **Vibration API:** Mobile devices only
- **Popover API:** Chrome 114+, JavaScript fallback for others
- **Web Audio API:** All modern browsers
- **YouTube IFrame API:** All browsers with JavaScript enabled

## Performance Targets

- **Lighthouse PWA Score:** 90+
- **Time to Interactive:** <3s
- **First Contentful Paint:** <1.5s
- **Total Bundle Size:** <100KB (benefits of vanilla JS)
- **Animation Frame Rate:** 60fps constant

## Common Development Tasks

### Adding New Mood/Genre Options

Edit `src/js/data/music-library.js`:

```javascript
// Add to moodPlaylists or genreSongs arrays
{
  url: "youtube.com/watch?v=VIDEO_ID",
    title
:
  "Song Title",
    artist
:
  "Artist Name",
    duration
:
  3600,
    thumbnail
:
  "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg"
}
```

Then update HTML in `index.html` to add button in mood/genre popover.

### Modifying Timer Behavior

Core timer logic in `src/js/modules/timer.js`:

- `tick()` method handles countdown logic
- `updateDisplay()` manages UI state updates
- Alert detection: `currentTime <= alertTime && currentTime > 0 && isRunning`

### Customizing Audio Alerts

Edit `src/js/modules/audio.js`:

- Change frequencies in `playAlert()`, `playComplete()`, `playFinalComplete()`
- Adjust durations with `oscillator.start()` and `oscillator.stop()` timings
- Modify vibration patterns in corresponding methods

### Updating Design System

CSS custom properties in `src/css/variables.css`:

```css
--color-primary: #00ffc8

;
--color-accent: #ff0096

;
--color-secondary: #6464ff

;
--font-family-display:

'Orbitron'
,
monospace

;
--font-family-base:

'Rajdhani'
,
sans-serif

;
```

## Technical Decisions

### Why Vanilla JS + Vite (not React)?

1. **Performance** - Direct DOM manipulation, no virtual DOM overhead
2. **Bundle Size** - ~40KB saved vs React (target <100KB total)
3. **Simplicity** - Single-page app doesn't need complex state management
4. **Native APIs** - Direct access to Web Audio, YouTube, Vibration APIs without wrappers
5. **Future-Proof** - No framework versioning or breaking changes

### Why Lazy Load YouTube Module?

- Reduces initial bundle size by ~15KB
- Most users may not use music feature
- Loaded on first interaction (button click, Enter key)
- Pattern: `await import("./modules/youtube.js")`

### Why Singleton Pattern for Timer/Audio?

- Single timer instance needed per application
- Prevents multiple audio contexts (browser limitation)
- Factory functions provide controlled access: `getTimer()`, `getAudio()`

## File References

- **Main entry point:** `src/main.js`
- **App orchestrator:** `src/js/app.js` (739 lines, all event handlers)
- **Timer implementation:** `src/js/modules/timer.js` (264 lines, core logic)
- **Audio system:** `src/js/modules/audio.js`
- **YouTube player:** `src/js/modules/youtube.js`
- **Music database:** `src/js/data/music-library.js`
- **Storage utilities:** `src/js/modules/storage.js`
- **PWA config:** `vite.config.js`
- **Design docs:** `docs/app_style.md`, `docs/plan.md`
- **HTML structure:** `index.html` (326 lines, includes popovers)

## Debugging Tips

### Timer Not Starting

- Check if audio context is initialized (requires user gesture)
- Verify settings values are valid (duration >= alertTime)
- Check console for errors in `timer.start()`

### YouTube Not Loading

- Verify YouTube IFrame API loaded (check network tab)
- Confirm valid YouTube URL format
- Check CORS errors in console
- Verify internet connection (API requires network)

### Music Not Ducking During Alerts

- Ensure YouTube player connected to timer: `timer.setYouTubePlayer(youtube)`
- Check `isAlertActive` state in `timer.updateDisplay()`
- Verify `setVolume()` method called in `updateDisplay()` at line 208

### PWA Not Installing

- Requires HTTPS (localhost is exempt)
- Check service worker registration in DevTools → Application
- Verify manifest.json served correctly
- Check console for PWA install criteria errors

### Gestures Not Working on Mobile

- Confirm `createGestureHandler()` called in `setupGestures()`
- Check touch events not blocked by other handlers
- Verify element has touch-action CSS property set

## Related Documentation

- `README.md` - User-facing documentation, feature list, usage guide
- `docs/plan.md` - Original implementation plan and architecture decisions
- `docs/app_style.md` - Complete design system documentation
- `PHOSPHOR_ICONS_GUIDE.md` - Icon usage patterns
- `AUTOMATED_MUSIC_UPDATES.md` - Music library update procedures
