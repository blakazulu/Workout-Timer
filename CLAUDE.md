# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Workout Timer Pro** is a Progressive Web App (PWA) for managing workout sessions with precision timing, built using Vite and vanilla JavaScript. The app features customizable timers, repetition tracking, audio/visual alerts, and optional YouTube music integration.

## Development Commands

```bash
# Start development server
npm run dev

# Preview production build (note: build command is disabled per user config)
npm run preview
```

## Project Status & Architecture

This project is currently in **migration phase**. There are two versions:

1. **Example prototype** (`example/code.html` and `example/index.html` - identical files) - A working monolithic HTML file with inline styles and JavaScript containing the complete timer implementation. This is the reference implementation that works perfectly as a standalone file.
2. **Vite scaffold** (`src/main.js`, `index.html`) - Fresh Vite vanilla JS setup with default boilerplate that needs to be replaced with the modular timer implementation

### Planned Architecture (per docs/plan.md)

The project will follow a modular ES6 architecture:

- **src/js/modules/** - Core feature modules
  - `timer.js` - Timer class with duration, alert time, repetitions logic
  - `audio.js` - AudioManager using Web Audio API for beeps/alerts
  - `youtube.js` - YouTubePlayer for optional music integration
  - `storage.js` - localStorage persistence for settings

- **src/js/utils/** - Utility functions
  - `dom.js` - DOM helper functions ($, $$, addClass, etc.)
  - `time.js` - Time formatting utilities (formatTime, parseTime)
  - `validation.js` - Input validation

- **src/js/app.js** - Main entry point with PWA service worker registration

### PWA Configuration

The project uses `vite-plugin-pwa` with Workbox for:
- Auto-update service worker strategy
- Offline-first caching for static assets
- Runtime caching for YouTube embeds (Cache-First)
- localStorage for timer settings persistence

**Important**: vite.config.js needs to be created following the comprehensive template in docs/plan.md:165-248

## Key Implementation Details

### Timer Logic (from example/code.html)
- Uses Web Audio API's AudioContext for beep sounds (no external audio files)
- Alert beeps trigger when remaining time ≤ alertDuration (during countdown)
- Completion beeps: double beep (523Hz + 659Hz) between reps, triple beep (523Hz + 659Hz + 784Hz) on final completion
- Timer state managed with: currentTime, currentRep, isRunning, timerInterval
- Uses `setInterval(tick, 1000)` for second-by-second countdown
- Settings are read from input fields only when START is pressed (allows modification between sets)
- PAUSE/RESUME preserves current timer state

### Audio System
- Frequency: 800Hz for countdown alerts, 523/659/784Hz for completion melodies
- Duration: 0.1s for regular beeps, 0.2s for final completion beep
- Gain ramping for smooth audio decay (0.3 → 0.01 exponential ramp)
- Uses oscillator + gain node pattern: create oscillator, connect to gain, connect to destination
- Beeps are staggered with setTimeout (100ms, 200ms delays) for melodic completion sounds
- No external audio files required - all sounds generated programmatically

### YouTube Integration
- Supports both youtube.com/watch?v= and youtu.be/ URL formats
- URL parsing: `url.split('v=')[1]?.split('&')[0]` for regular format
- Short URL: `url.split('/').pop()?.split('?')[0]` for youtu.be links
- Embeds as iframe with dimensions: 100% width × 200px height
- Handles optional music playback (gracefully degrades when offline)
- YouTube section has distinct styling with rgba(255, 87, 34, 0.05) background

### UI States
- Settings panel hidden during timer execution (`.settings.hidden { display: none; }`)
- Timer display adds 'alert' class during final countdown (triggers pulse animation + border color change)
- Timer value adds 'warning' class to change color from #ff5722 to #ff006e
- START button text changes: "START" → "PAUSE" → "RESUME" → "START"
- Rep counter states: "Ready" (idle) → "Rep X / Y" (running) → "✓ Complete!" (finished)
- Alert state triggers when: `currentTime <= alertDuration && currentTime > 0 && isRunning`

## Migration Tasks (from docs/plan.md)

When implementing features, follow this sequence:
1. Extract inline JavaScript from example/index.html into ES6 modules
2. Extract CSS into separate files (global.css, variables.css, components.css, animations.css)
3. Create vite.config.js with PWA plugin configuration
4. Generate app icons (72px to 512px) for public/icons/
5. Implement service worker registration in app.js
6. Add install prompt handling for PWA installation
7. Test offline functionality and update mechanism

## Design System

### Colors
- Primary gradient: #ff5722 → #ff006e
- Background: #121212 → #1a1a1a gradient
- Alert color: #ff006e
- Accent: #ff6b6b

### Typography
- Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Timer display: 72px, weight 900
- Headers: 32px, weight 800 with gradient text

### Key Animations
- Pulse animation on alert state (scale 1 → 1.02)
- Button active state: scale(0.98)
- Backdrop blur: 10px on timer display

## Technical Decisions

### Why Vanilla JS + Vite (not React)
- Smaller bundle size (~40KB saved, target <100KB total)
- Faster performance with direct DOM manipulation
- Simpler for single-page timer application
- Native browser API access without framework overhead
- See docs/plan.md:667-677 for full rationale

### PWA Strategy
- registerType: 'autoUpdate' for seamless background updates
- Precache all static assets (HTML, CSS, JS, images)
- Runtime cache YouTube embeds with 30-day expiration
- Network-first would be used for future API endpoints

## Browser Compatibility

Must support:
- Chrome/Edge (Chromium)
- Firefox
- Safari (iOS and macOS) - critical for PWA on iOS
- Samsung Internet

Requires HTTPS for PWA features to work.

## Performance Targets

- Lighthouse PWA score: 90+
- Time to Interactive: <3s
- First Contentful Paint: <1.5s
- Bundle size: <100KB
- 60fps animations

## Critical Implementation Details

### Time Display Formatting
- Format: `MM:SS` with padStart(2, '0') for leading zeros
- Calculation: `Math.floor(currentTime / 60)` for minutes, `currentTime % 60` for seconds
- Updates via `updateDisplay()` called after each tick and on state changes

### Timer Tick Logic Flow
1. Check if currentTime > 0
2. If yes: decrement, check for alert condition, beep if needed, update display
3. If no (time's up):
   - Check if currentRep < totalReps
   - If yes: play double beep, increment rep, reset currentTime to totalDuration
   - If no: stop timer, play triple beep, show "✓ Complete!"

### Settings Input Validation
- Duration: `min="5" max="3600"` (5 seconds to 1 hour)
- Alert Time: `min="1" max="60"` (1 to 60 seconds)
- Repetitions: `min="1" max="99"` (1 to 99 reps)
- All use `type="number"` with `parseInt()` when reading values

### Mobile Optimizations (from existing prototype)
- Viewport meta: `maximum-scale=1.0, user-scalable=no` prevents zoom issues
- Container max-width: 400px (optimal for mobile screens)
- Touch-friendly button sizes: 15px padding, easy tap targets
- Backdrop filter for glassmorphism effect (may need fallback for older browsers)

## File References

- Main implementation reference: `example/code.html:244-374` (JavaScript logic)
- Identical copy: `example/index.html` (same implementation)
- Default Vite scaffold: `src/main.js` (needs replacement with timer logic)
- Project plan: `docs/plan.md`
- Vite config template: `docs/plan.md:165-248`
- Module structure examples: `docs/plan.md:426-514`
