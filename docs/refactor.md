# 📋 Workout Timer Pro - Codebase Refactoring Plan

**Date:** 2025-10-14
**Reason:** File size compliance - Multiple files exceed 300-400 line maximum
**Status:** Planning Phase
**Tracking:** See `docs/refactoring-journal.md` for daily progress

---

## 🚨 Critical Findings

### Files Exceeding Limits

| File                           | Current Lines | Violation Level | Over Limit By |
|--------------------------------|---------------|-----------------|---------------|
| `src/css/components.css`       | 2,944         | SEVERE          | 7.36x         |
| `src/js/app.js`                | 1,177         | SEVERE          | 2.94x         |
| `src/js/modules/youtube.js`    | 694           | SIGNIFICANT     | 1.74x         |
| `index.html`                   | 436           | MODERATE        | 1.09x         |
| `src/js/utils/song_fetcher.js` | 412           | MINOR           | 1.03x         |

### Files Approaching Limit (Monitor)

| File                                   | Current Lines | Status  |
|----------------------------------------|---------------|---------|
| `src/css/global.css`                   | 489           | Warning |
| `src/js/modules/favorites.js`          | 380           | Warning |
| `src/js/components/search-dropdown.js` | 369           | Warning |
| `src/js/modules/favorites-ui.js`       | 368           | Warning |

---

## 🔄 Module Communication Pattern

### Overview

As the codebase is refactored into smaller, focused modules, a clear communication pattern is essential to prevent tight
coupling and maintain modularity.

### Architecture: Event-Driven with Shared State

**Pattern:** Custom Event Bus + Centralized State Management

#### Core Communication Mechanisms

**1. Event Bus (`src/js/core/event-bus.js`)**

Central pub/sub system for cross-module communication without direct dependencies.

```javascript
// event-bus.js (~100 lines)
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(handler);

    // Return unsubscribe function
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    if (!this.events.has(eventName)) return;
    const handlers = this.events.get(eventName);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(eventName, data) {
    if (!this.events.has(eventName)) return;
    this.events.get(eventName).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }

  once(eventName, handler) {
    const onceHandler = (data) => {
      handler(data);
      this.off(eventName, onceHandler);
    };
    this.on(eventName, onceHandler);
  }
}

export const eventBus = new EventBus();
```

**2. Application State (`src/js/core/app-state.js`)**

Centralized state management for shared application data.

```javascript
// app-state.js (~120 lines)
import {eventBus} from './event-bus.js';

class AppState {
  constructor() {
    this.state = {
      timer: {
        isRunning: false,
        isPaused: false,
        currentTime: 0,
        totalTime: 0,
      },
      music: {
        isPlaying: false,
        currentTrack: null,
        volume: 70,
        mode: 'mood', // 'mood' or 'genre'
      },
      ui: {
        activePanel: null,
        theme: 'dark',
      },
      settings: {},
    };
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.state);

    const oldValue = target[lastKey];
    target[lastKey] = value;

    // Emit state change event
    eventBus.emit('state:changed', {path, value, oldValue});
    eventBus.emit(`state:changed:${path}`, {value, oldValue});
  }

  update(path, updater) {
    const currentValue = this.get(path);
    const newValue = updater(currentValue);
    this.set(path, newValue);
  }

  subscribe(path, handler) {
    return eventBus.on(`state:changed:${path}`, handler);
  }
}

export const appState = new AppState();
```

**3. Event Constants (`src/js/core/events.js`)**

Typed event names for consistency and type safety.

```javascript
// events.js (~80 lines)
export const EVENTS = {
  // Timer events
  TIMER_STARTED: 'timer:started',
  TIMER_PAUSED: 'timer:paused',
  TIMER_RESUMED: 'timer:resumed',
  TIMER_STOPPED: 'timer:stopped',
  TIMER_COMPLETED: 'timer:completed',
  TIMER_TICK: 'timer:tick',

  // Music events
  MUSIC_PLAYING: 'music:playing',
  MUSIC_PAUSED: 'music:paused',
  MUSIC_STOPPED: 'music:stopped',
  MUSIC_TRACK_CHANGED: 'music:track:changed',
  MUSIC_VOLUME_CHANGED: 'music:volume:changed',
  MUSIC_MODE_CHANGED: 'music:mode:changed',

  // UI events
  UI_PANEL_OPENED: 'ui:panel:opened',
  UI_PANEL_CLOSED: 'ui:panel:closed',
  UI_THEME_CHANGED: 'ui:theme:changed',

  // Favorites events
  FAVORITES_ADDED: 'favorites:added',
  FAVORITES_REMOVED: 'favorites:removed',

  // Settings events
  SETTINGS_UPDATED: 'settings:updated',

  // State events
  STATE_CHANGED: 'state:changed',
};
```

#### Event Naming Conventions

**Format:** `<domain>:<action>[:<detail>]`

**Examples:**

- `timer:started`, `timer:paused`, `timer:completed`
- `music:playing`, `music:paused`, `music:track:changed`
- `ui:panel:opened`, `ui:panel:closed`
- `favorites:added`, `favorites:removed`
- `state:changed:timer.isRunning`

#### Module Communication Examples

**Example 1: Timer Module → UI Updates**

```javascript
// In timer.js
import {eventBus} from '../core/event-bus.js';
import {appState} from '../core/app-state.js';
import {EVENTS} from '../core/events.js';

class Timer {
  start() {
    appState.set('timer.isRunning', true);
    eventBus.emit(EVENTS.TIMER_STARTED, {startTime: Date.now()});
  }

  pause() {
    appState.set('timer.isPaused', true);
    eventBus.emit(EVENTS.TIMER_PAUSED, {currentTime: this.currentTime});
  }
}

// In ui/event-handlers.js
import {eventBus} from '../core/event-bus.js';
import {EVENTS} from '../core/events.js';

eventBus.on(EVENTS.TIMER_STARTED, (data) => {
  updateTimerDisplay();
  updateButtonStates();
});

eventBus.on(EVENTS.TIMER_PAUSED, (data) => {
  showPauseIndicator();
});
```

**Example 2: Music Module → Multiple Listeners**

```javascript
// In modules/youtube/index.js
import {eventBus} from '../../core/event-bus.js';
import {appState} from '../../core/app-state.js';
import {EVENTS} from '../../core/events.js';

export function playVideo(videoId) {
  // Play logic...
  appState.set('music.isPlaying', true);
  appState.set('music.currentTrack', videoId);
  eventBus.emit(EVENTS.MUSIC_PLAYING, {videoId, title});
}

// In ui/music-controls.js
eventBus.on(EVENTS.MUSIC_PLAYING, ({videoId, title}) => {
  showMusicControls();
  updateNowPlaying(title);
});

// In modules/favorites-ui.js
eventBus.on(EVENTS.MUSIC_PLAYING, ({videoId}) => {
  highlightCurrentTrack(videoId);
});

// In core/notifications.js
eventBus.on(EVENTS.MUSIC_PLAYING, ({title}) => {
  showNotification(`Now playing: ${title}`);
});
```

**Example 3: State Subscriptions**

```javascript
// In ui/timer-display.js
import {appState} from '../core/app-state.js';

// Subscribe to specific state changes
const unsubscribe = appState.subscribe('timer.currentTime', ({value}) => {
  updateTimerDisplay(value);
});

// Later, clean up
// unsubscribe();
```

#### Communication Matrix

| Module               | Emits Events | Listens To               | Accesses State         |
|----------------------|--------------|--------------------------|------------------------|
| timer.js             | timer:*      | -                        | timer.*                |
| youtube/index.js     | music:*      | timer:completed          | music.*                |
| favorites.js         | favorites:*  | music:playing            | -                      |
| ui/event-handlers.js | -            | timer:*, music:*, ui:*   | ui.*                   |
| ui/library-ui.js     | ui:panel:*   | favorites:*              | music.mode             |
| notifications.js     | -            | timer:completed, music:* | settings.notifications |

#### Benefits of This Pattern

1. **Loose Coupling:** Modules don't need direct references to each other
2. **Testability:** Easy to test modules in isolation
3. **Extensibility:** New modules can listen to existing events
4. **Debuggability:** All communication flows through event bus (can be logged)
5. **State Predictability:** Centralized state makes debugging easier
6. **Event Replay:** Can record and replay events for debugging

#### Implementation Guidelines

**DO:**

- ✅ Use events for cross-module communication
- ✅ Use state for shared data
- ✅ Use direct function calls within the same module
- ✅ Document what events each module emits/listens to
- ✅ Use typed event names (constants from events.js)

**DON'T:**

- ❌ Import UI modules into core modules
- ❌ Create circular dependencies
- ❌ Emit events for internal module logic
- ❌ Store large objects in state (use references)
- ❌ Mutate state directly (always use appState.set())

---

## 📅 Refactoring Roadmap

### Phase 1: CSS Component Split (CRITICAL PRIORITY)

**Target:** `src/css/components.css` (2,944 lines → ~10 files)
**Estimated Time:** 4-6 hours
**Risk Level:** Medium
**Impact:** Massive improvement in maintainability

#### Current Structure Issues

- Single monolithic file with 2,944 lines
- Contains 14+ distinct component groups
- Difficult to navigate and maintain
- High risk of merge conflicts

#### Proposed Structure

```
src/css/
├── components/
│   ├── timer.css              (~150 lines) - Timer Display styles
│   ├── music-controls.css     (~120 lines) - Music Controls & Player
│   ├── music-selection.css    (~400 lines) - Mood/Genre Tags & Selection
│   ├── buttons.css            (~200 lines) - Control Buttons, Install
│   ├── overlays.css           (~220 lines) - Loading, Update Overlays
│   ├── library.css            (~400 lines) - History, Favorites, Library
│   ├── search.css             (~250 lines) - YouTube Search Dropdown
│   ├── favorites.css          (~300 lines) - Favorites System
│   ├── popovers.css           (~400 lines) - Popover styles & animations
│   └── settings.css           (~100 lines) - Settings Panel
├── animations.css             (existing)
├── variables.css              (existing)
├── global.css                 (existing)
└── components.css             (becomes import aggregator)
```

#### Content Breakdown

**timer.css** (~150 lines)

- Timer Display (lines 4-155 from current file)
- Digital clock styles
- Animation states

**music-controls.css** (~120 lines)

- Music Controls & Player (lines 156-270)
- Play/pause buttons
- Volume controls
- Progress bars

**music-selection.css** (~400 lines)

- Music Mode Toggle (lines 543-598)
- Mood Tags - Hexagonal Layout (lines 620-728)
- Genre Tags - Radial Layout (lines 729-988)

**buttons.css** (~200 lines)

- Control Buttons (lines 989-1095)
- Install Button (lines 1096-1131)
- Action buttons

**overlays.css** (~220 lines)

- Loading Overlays (lines 1132-1396)
- Update notifications
- Modal overlays

**library.css** (~400 lines)

- History components (lines 1397-2114)
- Library UI structure
- List views

**search.css** (~250 lines)

- YouTube Search Dropdown (lines 2115-2365)
- Search results styling
- Autocomplete UI

**favorites.css** (~300 lines)

- Favorites system (lines 2392-2944)
- Favorite indicators
- Favorite management UI

**popovers.css** (~400 lines)

- Popover animations (lines 271-436)
- Popover positioning
- Tooltip styles

**settings.css** (~100 lines)

- Settings Panel (lines 437-509)
- YouTube Section (lines 510-542)
- Configuration UI

#### Migration Steps

1. **Preparation**
    - Create `src/css/components/` directory
    - Back up current `components.css`

2. **Extraction** (Do in order)
    - Extract Timer Display → `components/timer.css`
    - Extract Music Controls → `components/music-controls.css`
    - Extract Music Selection → `components/music-selection.css`
    - Extract Buttons → `components/buttons.css`
    - Extract Overlays → `components/overlays.css`
    - Extract Library → `components/library.css`
    - Extract Search → `components/search.css`
    - Extract Favorites → `components/favorites.css`
    - Extract Popovers → `components/popovers.css`
    - Extract Settings → `components/settings.css`

3. **Update Main File**
    - Replace `components.css` content with imports:
   ```css
   /* Component Imports */
   @import './variables.css';
   @import './components/timer.css';
   @import './components/music-controls.css';
   @import './components/music-selection.css';
   @import './components/buttons.css';
   @import './components/overlays.css';
   @import './components/library.css';
   @import './components/search.css';
   @import './components/favorites.css';
   @import './components/popovers.css';
   @import './components/settings.css';
   ```

4. **Testing**
    - Test all UI components render correctly
    - Verify animations work
    - Check responsive layouts
    - Test on multiple browsers

5. **Update Build Process** (if needed)
    - Verify CSS bundler handles nested imports
    - Update any build scripts
    - Ensure source maps work correctly

#### Files Affected

- `index.html` (if it directly imports components.css)
- Build configuration
- Any documentation referencing file structure

---

### Phase 2: App.js Refactoring (CRITICAL PRIORITY)

**Target:** `src/js/app.js` (1,177 lines → ~7 files)
**Estimated Time:** 8-12 hours
**Risk Level:** High
**Impact:** Critical for future development and maintainability

#### Current Structure Issues

- Monolithic entry point with 1,177 lines
- Mixes initialization, UI logic, event handling
- Hard to test individual components
- High coupling between features

#### Proposed Structure

```
src/js/
├── app.js                     (~150 lines) - Main orchestration only
├── core/
│   ├── event-bus.js          (~100 lines) - ⭐ Event communication system
│   ├── app-state.js          (~120 lines) - ⭐ Centralized state management
│   ├── events.js             (~80 lines) - ⭐ Event constants
│   ├── notifications.js       (~100 lines) - Notification system
│   ├── pwa-install.js        (~80 lines) - PWA install handling
│   └── gestures-handler.js   (~60 lines) - Touch gesture setup
├── ui/
│   ├── event-handlers.js     (~200 lines) - All event listeners
│   ├── tooltip-handler.js    (~80 lines) - Tooltip positioning
│   ├── library-ui.js         (~250 lines) - Music library UI
│   └── mode-toggle.js        (~300 lines) - Music mode toggle system
└── search/
    └── youtube-search-ui.js  (~120 lines) - YouTube search autocomplete
```

#### Content Breakdown

**app.js** (~150 lines)

- Module imports
- Main initialization orchestration
- Settings loading
- Minimal coordination logic

```javascript
// Core infrastructure (must be imported first)
import './core/event-bus.js';    // ⭐ Initialize event system
import './core/app-state.js';    // ⭐ Initialize state management
import './core/events.js';       // ⭐ Event constants available globally

import {initNotifications} from './core/notifications.js';
import {initPWAInstall} from './core/pwa-install.js';
import {initGestureHandlers} from './core/gestures-handler.js';
import {initEventHandlers} from './ui/event-handlers.js';
import {initLibraryUI} from './ui/library-ui.js';
import {initModeToggle} from './ui/mode-toggle.js';
import {initYouTubeSearchUI} from './search/youtube-search-ui.js';

async function init() {
  const settings = loadSettings();
  applySettings(settings);

  // Initialize core systems
  initNotifications();
  initPWAInstall();
  initGestureHandlers();

  // Initialize UI components (these will listen to events)
  initEventHandlers();
  initLibraryUI();
  initModeToggle();
  initYouTubeSearchUI();

  hideAppLoader();
}

init();
```

**core/event-bus.js** (~100 lines) ⭐ NEW

- Event pub/sub system
- Event subscription/unsubscription
- Event emission with error handling
- See "Module Communication Pattern" section above for full implementation

**core/app-state.js** (~120 lines) ⭐ NEW

- Centralized application state
- State getter/setter with path notation
- State change events
- State subscriptions
- See "Module Communication Pattern" section above for full implementation

**core/events.js** (~80 lines) ⭐ NEW

- Event name constants
- Typed event names for IDE autocomplete
- Prevents typos in event names
- See "Module Communication Pattern" section above for full implementation

**core/notifications.js** (~100 lines)

- Notification system (lines 48-150 from current app.js)
- Permission requests
- Notification display
- Platform-specific handling

**core/pwa-install.js** (~80 lines)

- PWA install handling (lines 466-493)
- Install button handler (lines 579-601)
- beforeinstallprompt event
- Install flow management

**core/gestures-handler.js** (~60 lines)

- Touch gestures (lines 494-517)
- Swipe detection
- Gesture event setup

**ui/event-handlers.js** (~200 lines)

- Event listeners setup (lines 285-465)
- Button click handlers
- Form submissions
- UI interaction events

**ui/tooltip-handler.js** (~80 lines)

- Tooltip positioning (lines 518-578)
- Dynamic tooltip placement
- Tooltip show/hide logic

**ui/library-ui.js** (~250 lines)

- Music library system (lines 602-807)
- Library rendering
- Track display
- Category navigation

**ui/mode-toggle.js** (~300 lines)

- Music mode toggle (lines 808-1068)
- Mood/Genre switching
- UI state management
- Animation handling

**search/youtube-search-ui.js** (~120 lines)

- YouTube search autocomplete (lines 1069-1164)
- Search input handling
- Results display
- Selection logic

#### Migration Steps

1. **Preparation**
    - Create directory structure (`core/`, `ui/`, `search/`)
    - Back up current `app.js`
    - Set up test harness for critical functions

2. **Create Communication Infrastructure** ⭐ (Do FIRST - Foundation for all modules)
    - Create `core/event-bus.js` (see Module Communication Pattern section)
    - Create `core/app-state.js` (see Module Communication Pattern section)
    - Create `core/events.js` (see Module Communication Pattern section)
    - Test event system independently
    - Test state management independently

3. **Extract Core Functions** (Do second - lowest risk)
    - Extract notification system → `core/notifications.js`
    - Extract PWA install → `core/pwa-install.js`
    - Extract gesture handlers → `core/gestures-handler.js`
    - Update each to use event bus where appropriate
    - Test each extraction independently

4. **Extract UI Functions** (Medium risk)
    - Extract event handlers → `ui/event-handlers.js`
    - Extract tooltip logic → `ui/tooltip-handler.js`
    - Extract library UI → `ui/library-ui.js`
    - Extract mode toggle → `ui/mode-toggle.js`
    - Update each to use event bus and state management
    - Test UI interactions after each extraction

5. **Extract Search Functions** (Low risk)
    - Extract YouTube search UI → `search/youtube-search-ui.js`
    - Update to use event bus
    - Test search functionality

6. **Refactor Main App**
    - Update `app.js` to import communication infrastructure first
    - Import and orchestrate all modules
    - Remove old code
    - Ensure clean initialization flow

7. **Update Imports**
    - Update all files that import from `app.js`
    - Fix any broken dependencies
    - Update window exports if needed
    - Ensure all modules import from correct paths

8. **Comprehensive Testing**
    - Test full app initialization
    - Test all UI interactions
    - Test PWA installation
    - Test notifications
    - Test music library
    - Test search functionality
    - Test on multiple browsers/devices

#### Files Affected

- Any module that imports from `app.js`
- `index.html` (script imports)
- Test files
- Documentation

#### Risk Mitigation

- Create feature branch
- Test thoroughly after each extraction
- Keep backup of working version
- Have rollback plan ready
- Consider pair programming for this phase

---

### Phase 3: YouTube Module Split (HIGH PRIORITY)

**Target:** `src/js/modules/youtube.js` (694 lines → 5 files)
**Estimated Time:** 6-8 hours
**Risk Level:** Medium-High
**Impact:** Better organization of complex video player module

#### Current Structure Issues

- Single 694-line class handling all YouTube functionality
- Mixes API loading, video management, playback, and UI
- Hard to test individual features
- Complex interdependencies

#### Proposed Structure

```
src/js/modules/youtube/
├── player.js              (~200 lines) - Core YouTubePlayer class, API
├── video-loader.js        (~150 lines) - Video loading & error handling
├── playback-controls.js   (~150 lines) - Play, pause, stop, volume, seek
├── ui-controls.js         (~200 lines) - Music controls, progress bar
└── index.js               (~50 lines) - Public API, singleton management
```

#### Content Breakdown

**player.js** (~200 lines)

- Core YouTubePlayer class (lines 10-52)
- API loading (lines 10-52)
- Player initialization
- Video ID extraction (lines 54-74)
- API waiting logic (lines 76-101)

```javascript
export class YouTubePlayer {
  constructor(elementId) {
    this.elementId = elementId;
    this.player = null;
    this.apiReady = false;
  }

  async loadAPI() { /* ... */
  }

  waitForAPI() { /* ... */
  }

  extractVideoId(url) { /* ... */
  }
}
```

**video-loader.js** (~150 lines)

- Video loading (lines 103-205)
- onPlayerReady callback (lines 207-250)
- onPlayerError callback (lines 251-322)
- Error handling
- Video state management

```javascript
export class VideoLoader {
  constructor(player) {
    this.player = player;
  }

  async loadVideo(url) { /* ... */
  }

  handlePlayerReady(event) { /* ... */
  }

  handlePlayerError(event) { /* ... */
  }
}
```

**playback-controls.js** (~150 lines)

- Play control (lines 323-350)
- Pause control (lines 351-370)
- Stop control (lines 371-400)
- Volume control (lines 401-430)
- Seek control (lines 431-469)
- Playback state management

```javascript
export class PlaybackControls {
  constructor(player) {
    this.player = player;
  }

  play() { /* ... */
  }

  pause() { /* ... */
  }

  stop() { /* ... */
  }

  setVolume(volume) { /* ... */
  }

  seekTo(seconds) { /* ... */
  }
}
```

**ui-controls.js** (~200 lines)

- Music controls display (lines 470-539)
- Progress updates (lines 540-579)
- Play/pause button updates (lines 580-598)
- Tooltip management
- UI synchronization

```javascript
export class UIControls {
  constructor(player) {
    this.player = player;
  }

  showMusicControls() { /* ... */
  }

  hideMusicControls() { /* ... */
  }

  updateProgress() { /* ... */
  }

  updatePlayPauseButton() { /* ... */
  }
}
```

**index.js** (~50 lines)

- Public API composition
- Singleton management
- Module exports

```javascript
import {YouTubePlayer} from './player.js';
import {VideoLoader} from './video-loader.js';
import {PlaybackControls} from './playback-controls.js';
import {UIControls} from './ui-controls.js';

let instance = null;

export function initYouTube(elementId) {
  if (!instance) {
    const player = new YouTubePlayer(elementId);
    const loader = new VideoLoader(player);
    const playback = new PlaybackControls(player);
    const ui = new UIControls(player);

    instance = {
      loadVideo: (url) => loader.loadVideo(url),
      play: () => playback.play(),
      pause: () => playback.pause(),
      stop: () => playback.stop(),
      setVolume: (v) => playback.setVolume(v),
      seekTo: (s) => playback.seekTo(s),
      // ... expose all methods
    };
  }
  return instance;
}

export function getYouTubePlayer() {
  return instance;
}
```

#### Migration Steps

1. **Preparation**
    - Create `src/js/modules/youtube/` directory
    - Back up current `youtube.js`
    - Document current public API

2. **Extract Core Player** (Do first)
    - Create `player.js` with base class
    - Extract API loading logic
    - Extract video ID parsing
    - Test player initialization

3. **Extract Video Loader**
    - Create `video-loader.js`
    - Extract video loading logic
    - Extract error handling
    - Test video loading independently

4. **Extract Playback Controls**
    - Create `playback-controls.js`
    - Extract all playback methods
    - Test play, pause, stop, volume, seek

5. **Extract UI Controls**
    - Create `ui-controls.js`
    - Extract UI update methods
    - Test UI synchronization

6. **Create Public API**
    - Create `index.js`
    - Compose all modules
    - Expose public interface
    - Maintain backward compatibility

7. **Update Imports**
    - Update `app.js` imports
    - Update `favorites-ui.js` imports
    - Update any other files using YouTube module

8. **Comprehensive Testing**
    - Test video loading
    - Test all playback controls
    - Test UI updates
    - Test error scenarios
    - Test on multiple browsers

#### Files Affected

- `app.js`
- `favorites-ui.js`
- Any file importing YouTube module

---

### Phase 4: Index.html Organization (HIGH PRIORITY - REQUIRED)

**Target:** `index.html` (436 lines → modular partials)
**Estimated Time:** 2-3 hours
**Risk Level:** Low
**Impact:** Essential for maintainability and future development
**Status:** ⭐ REQUIRED - DO NOT DEFER

#### Current Structure Issues

- Single 436-line HTML file (9% over limit and actively growing)
- Mixes meta tags, styles, content, popovers in one monolithic file
- Hard to navigate and maintain as features are added
- **Critical:** Adding 2-3 new features will push this to 600-700+ lines
- No clean way to add new UI components without significant bloat
- Makes parallel development difficult (merge conflicts)
- Violates separation of concerns

#### Why This Phase Is REQUIRED

**This is NOT optional - it's essential infrastructure:**

1. **Active Development:** Project is under active development with new features planned
2. **Imminent Growth:** Current 436 lines will quickly exceed 600+ lines
3. **Prevention Over Cure:** Refactoring at 600+ lines = 4-5 hours + high risk
4. **Investment ROI:** 2-3 hours now saves 2-3+ hours later plus prevents tech debt
5. **Maintainability:** Modular HTML is easier to understand and modify
6. **Team Collaboration:** Partials prevent merge conflicts in team environments
7. **Consistency:** Matches the modular architecture of CSS and JS refactoring

**Bottom Line:** Deferring this phase contradicts the entire refactoring effort. If we're splitting 2,944-line CSS files
and 1,177-line JS files for maintainability, we MUST split the 436-line HTML file that's actively growing.

#### Recommended Approach: HTML Partials with Vite

Since you're already using **Vite** (detected via `virtual:pwa-register`), adding HTML templating is straightforward:

**Proposed Structure (Feature-Oriented):**

```
src/
├── index.html              (~100 lines) - Main structure + imports
├── partials/
│   ├── meta/
│   │   ├── head.html      (~60 lines) - Meta tags, fonts, SEO
│   │   └── pwa-manifest.html (~20 lines) - PWA config
│   ├── layout/
│   │   ├── app-loader.html (~30 lines) - Loading screen
│   │   └── backgrounds.html (~20 lines) - Visual effects
│   ├── features/
│   │   ├── timer-controls.html (~80 lines) - Main timer UI
│   │   ├── music-player.html   (~70 lines) - Music controls
│   │   └── settings-panel.html (~60 lines) - Settings
│   └── popovers/
│       ├── music-library.html (~80 lines) - Library popup
│       ├── mood-selector.html (~70 lines) - Mood tags
│       └── genre-selector.html (~70 lines) - Genre tags
└── styles/
    └── inline-critical.css (~40 lines) - Critical path CSS
```

**Main index.html:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <%- include('partials/meta/head.html') %>
  <%- include('partials/meta/pwa-manifest.html') %>
  <style>
    <
    %
    -
    include

    (
    'styles/inline-critical.css'
    )
    %
    >
  </style>
</head>
<body>
<!-- Layout -->
<%- include('partials/layout/app-loader.html') %>
<%- include('partials/layout/backgrounds.html') %>

<!-- Core Features -->
<main>
  <%- include('partials/features/timer-controls.html') %>
  <%- include('partials/features/music-player.html') %>
  <%- include('partials/features/settings-panel.html') %>
</main>

<!-- Popovers -->
<%- include('partials/popovers/music-library.html') %>
<%- include('partials/popovers/mood-selector.html') %>
<%- include('partials/popovers/genre-selector.html') %>

<script type="module" src="/src/main.js"></script>
</body>
</html>
```

#### Vite Setup Instructions

**1. Install Vite HTML Plugin**

```bash
npm install --save-dev vite-plugin-html
```

**2. Update vite.config.js**

Create or update `vite.config.js`:

```javascript
import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'
import {createHtmlPlugin} from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
      // EJS template support
      template: 'index.html',
    }),
    VitePWA({
      // ... existing PWA config
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
})
```

**Alternative: Simple HTML Partials (No Plugin)**

If you prefer not to add dependencies, use Vite's built-in multi-page setup:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        // Partials loaded via fetch() in JavaScript
      }
    }
  }
})
```

Then load partials dynamically:

```javascript
// In app.js
async function loadPartial(url, targetId) {
  const response = await fetch(url);
  const html = await response.text();
  document.getElementById(targetId).innerHTML = html;
}
```

#### Migration Steps

1. **Preparation**
    - Install `vite-plugin-html` OR decide on dynamic loading
    - Create directory structure: `src/partials/{meta,layout,features,popovers}/`
    - Back up current `index.html`

2. **Setup Vite Configuration**
    - Update `vite.config.js` with HTML plugin
    - Test dev server: `npm run dev`
    - Verify build works: `npm run build`

3. **Extract Partials (Do in logical order)**
    - Extract head/meta → `partials/meta/head.html`
    - Extract PWA manifest → `partials/meta/pwa-manifest.html`
    - Extract app loader → `partials/layout/app-loader.html`
    - Extract backgrounds → `partials/layout/backgrounds.html`
    - Extract timer controls → `partials/features/timer-controls.html`
    - Extract music player → `partials/features/music-player.html`
    - Extract settings panel → `partials/features/settings-panel.html`
    - Extract music library → `partials/popovers/music-library.html`
    - Extract mood selector → `partials/popovers/mood-selector.html`
    - Extract genre selector → `partials/popovers/genre-selector.html`

4. **Extract Critical CSS**
    - Create `src/styles/inline-critical.css`
    - Move app loader styles (currently inline)
    - Keep only above-the-fold critical styles

5. **Update Main HTML**
    - Replace extracted sections with `<%- include(...) %>` statements
    - Maintain proper HTML structure
    - Test build output

6. **Testing**
    - Test dev server renders correctly
    - Test production build
    - Verify all styles load
    - Test all interactive elements
    - Check PWA functionality
    - Test on multiple browsers

7. **Update Documentation**
    - Document partial structure
    - Add guidelines for new features
    - Update deployment docs if needed

#### Files Affected

- `vite.config.js` (add HTML plugin)
- `package.json` (add dependency)
- Build/deployment scripts (verify compatibility)
- Any documentation referencing HTML structure

#### Future Benefits

**Adding New Features:**

- New popup? Just create `partials/popovers/new-feature.html` (~50-80 lines)
- New control panel? Create `partials/features/new-panel.html` (~60-100 lines)
- **No more scrolling through 600+ line files**
- **Each partial stays focused and manageable**
- **Easier to find and modify specific UI components**

---

### Phase 5: Song Fetcher Utility Split (MEDIUM PRIORITY)

**Target:** `src/js/utils/song_fetcher.js` (412 lines → 5 files)
**Estimated Time:** 2-3 hours
**Risk Level:** Low
**Impact:** Cleaner utility structure

#### Current Structure Issues

- Single 412-line utility script
- Mixes configuration, API calls, filtering, caching
- Hard to test individual functions
- Difficult to modify one aspect without affecting others

#### Proposed Structure

```
src/js/utils/song_fetcher/
├── config.js          (~100 lines) - Configuration & categories
├── youtube-api.js     (~120 lines) - API calls & rate limiting
├── filters.js         (~80 lines) - Filter & transform functions
├── cache.js           (~60 lines) - Cache management
└── index.js           (~80 lines) - Main orchestration
```

#### Content Breakdown

**config.js** (~100 lines)

- Configuration constants (lines 1-36)
- Category query definitions (lines 38-133)
- API settings
- File paths

```javascript
export const CONFIG = {
  WANT_PER_CATEGORY: 10,
  MIN_SECONDS: 30 * 60,
  MAX_SECONDS: 90 * 60,
  MIN_VIEWS: 10_000,
  REFRESH_DAYS: 30,
  DAILY_BUDGET_UNITS: 9800,
  CACHE_PATH: './src/js/data/workout_music_cache.json',
  OUTPUT_PATH: './src/js/data/workout_music.json',
};

export const categories = {
  "beast mode workout music": {
    id: "beast-mode",
    queryStrings: [
      "beast mode workout mix",
      "aggressive gym music",
      // ...
    ],
  },
  // ... all categories
};
```

**youtube-api.js** (~120 lines)

- YouTube API client (lines 181-245)
- Rate limiter (lines 163-179)
- Search requests
- Video detail requests
- Error handling

```javascript
export class YouTubeAPI {
  constructor(apiKey, budget) {
    this.apiKey = apiKey;
    this.budget = {used: 0, limit: budget};
  }

  async searchVideos(query, maxResults, pageToken) {
    // Rate limiting
    // API call
    // Error handling
  }

  async fetchVideoDetails(videoIds) {
    // API call
    // Parse response
  }

  getRemainingBudget() {
    return this.budget.limit - this.budget.used;
  }
}
```

**filters.js** (~80 lines)

- Video filtering logic (lines 247-276)
- Duration filters
- View count filters
- Duplicate removal
- Data transformation

```javascript
export function filterVideos(videos, config) {
  return videos.filter(video => {
    const duration = parseDuration(video.duration);
    return (
      duration >= config.MIN_SECONDS &&
      duration <= config.MAX_SECONDS &&
      video.viewCount >= config.MIN_VIEWS
    );
  });
}

export function parseDuration(duration) {
  // ISO 8601 duration parsing
}

export function transformToLibraryFormat(videos, categoryId) {
  return videos.map(video => ({
    id: video.id,
    title: video.title,
    category: categoryId,
    duration: video.duration,
    views: video.viewCount,
  }));
}
```

**cache.js** (~60 lines)

- Cache loading (lines 321-340)
- Cache saving (lines 341-355)
- Cache validation
- Cache merging

```javascript
export class Cache {
  constructor(cachePath) {
    this.cachePath = cachePath;
    this.data = {};
  }

  async load() {
    // Read cache file
    // Parse JSON
    // Validate
  }

  async save() {
    // Serialize data
    // Write file
  }

  shouldRefresh(categoryId, refreshDays) {
    // Check last update timestamp
  }

  merge(newData) {
    // Merge with existing cache
  }
}
```

**index.js** (~80 lines)

- Main orchestration (lines 357-412)
- Fetcher logic (lines 278-319)
- Workflow coordination

```javascript
import {CONFIG, categories} from './config.js';
import {YouTubeAPI} from './youtube-api.js';
import {filterVideos, transformToLibraryFormat} from './filters.js';
import {Cache} from './cache.js';

async function main() {
  const api = new YouTubeAPI(process.env.YOUTUBE_API_KEY, CONFIG.DAILY_BUDGET_UNITS);
  const cache = new Cache(CONFIG.CACHE_PATH);

  await cache.load();

  for (const [categoryName, categoryData] of Object.entries(categories)) {
    if (!cache.shouldRefresh(categoryData.id, CONFIG.REFRESH_DAYS)) {
      continue;
    }

    const videos = await fetchCategoryVideos(api, categoryData, CONFIG);
    const filtered = filterVideos(videos, CONFIG);
    const transformed = transformToLibraryFormat(filtered, categoryData.id);

    cache.merge(categoryData.id, transformed);
  }

  await cache.save();
}

main();
```

#### Migration Steps

1. **Preparation**
    - Create `src/js/utils/song_fetcher/` directory
    - Back up current `song_fetcher.js`
    - Test current functionality

2. **Extract Configuration**
    - Create `config.js`
    - Move all configuration constants
    - Move category definitions
    - Test config imports

3. **Extract API Client**
    - Create `youtube-api.js`
    - Move API call functions
    - Move rate limiting logic
    - Test API calls independently

4. **Extract Filters**
    - Create `filters.js`
    - Move filter functions
    - Move transformation functions
    - Test filter logic

5. **Extract Cache Management**
    - Create `cache.js`
    - Move cache loading/saving
    - Move cache validation
    - Test cache operations

6. **Create Main Orchestrator**
    - Create `index.js`
    - Import all modules
    - Coordinate workflow
    - Test end-to-end

7. **Update GitHub Actions**
    - Update workflow file (`.github/workflows/update-music.yml`)
    - Update script path if needed
    - Test workflow execution

8. **Testing**
    - Test full data fetch workflow
    - Verify cache works correctly
    - Check output files
    - Validate API usage

#### Files Affected

- `.github/workflows/update-music.yml`
- Any scripts that run song_fetcher

---

### Phase 6: Monitoring & Prevention (ONGOING)

**Objective:** Prevent future file size violations
**Priority:** Ongoing
**Estimated Setup Time:** 2-3 hours

#### Files to Monitor

Track these files that are approaching the 400-line limit:

| File                                   | Current Lines | Action Threshold |
|----------------------------------------|---------------|------------------|
| `src/css/global.css`                   | 489           | Split if > 450   |
| `src/js/modules/favorites.js`          | 380           | Split if > 400   |
| `src/js/components/search-dropdown.js` | 369           | Split if > 400   |
| `src/js/modules/favorites-ui.js`       | 368           | Split if > 400   |

#### Prevention Measures

**1. Pre-commit Hook**

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Checking file sizes..."

MAX_LINES=400
WARNING_LINES=350
ERRORS=0

for file in $(git diff --cached --name-only | grep -E '\.(js|css|html)$'); do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")

    if [ $lines -gt $MAX_LINES ]; then
      echo "❌ ERROR: $file has $lines lines (max $MAX_LINES)"
      ERRORS=$((ERRORS + 1))
    elif [ $lines -gt $WARNING_LINES ]; then
      echo "⚠️  WARNING: $file has $lines lines (approaching limit of $MAX_LINES)"
    fi
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "Commit rejected due to file size violations."
  echo "Please refactor files exceeding $MAX_LINES lines."
  exit 1
fi

exit 0
```

Make executable:

```bash
chmod +x .git/hooks/pre-commit
```

**2. ESLint Configuration**

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "max-lines": [
      "error",
      {
        "max": 400,
        "skipBlankLines": true,
        "skipComments": true
      }
    ]
  }
}
```

**3. Stylelint Configuration**

Add to `.stylelintrc.json`:

```json
{
  "rules": {
    "max-lines": 400
  }
}
```

**4. GitHub Actions Check**

Create `.github/workflows/file-size-check.yml`:

```yaml
name: File Size Check

on: [ pull_request ]

jobs:
  check-file-sizes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check file sizes
        run: |
          MAX_LINES=400
          ERRORS=0

          for file in $(find src -name "*.js" -o -name "*.css" -o -name "*.html"); do
            lines=$(wc -l < "$file")
            if [ $lines -gt $MAX_LINES ]; then
              echo "❌ $file: $lines lines (max $MAX_LINES)"
              ERRORS=$((ERRORS + 1))
            fi
          done

          if [ $ERRORS -gt 0 ]; then
            echo "Found $ERRORS file(s) exceeding size limit"
            exit 1
          fi
```

**5. Documentation**

Create `docs/coding-standards.md`:

```markdown
# Coding Standards

## File Size Limits

- Maximum lines per file: **400 lines**
- Warning threshold: **350 lines**
- Target: **< 300 lines**

### When a File Approaches the Limit

1. Review the file's responsibilities
2. Identify logical boundaries for splitting
3. Create new focused modules
4. Refactor and test
5. Update imports

### Refactoring Guidelines

- Use Single Responsibility Principle
- Split by feature or concern
- Maintain clear module boundaries
- Keep related code together
- Document module relationships
```

**6. Code Review Checklist**

Add to pull request template:

```markdown
## Code Review Checklist

- [ ] No files exceed 400 lines
- [ ] Files over 350 lines have a refactoring plan
- [ ] New features use modular architecture
- [ ] Changes maintain or improve code organization
```

---

## 📁 Final Folder Structure

After completing all phases, the project structure will be:

```
workout-timer-pro/
├── index.html                          (~150 lines or well-organized)
├── docs/
│   ├── refactor.md                     (this file)
│   ├── coding-standards.md             (new)
│   └── fixes/                          (existing)
├── src/
│   ├── css/
│   │   ├── components/
│   │   │   ├── timer.css              (~150 lines)
│   │   │   ├── music-controls.css     (~120 lines)
│   │   │   ├── music-selection.css    (~400 lines)
│   │   │   ├── buttons.css            (~200 lines)
│   │   │   ├── overlays.css           (~220 lines)
│   │   │   ├── library.css            (~400 lines)
│   │   │   ├── search.css             (~250 lines)
│   │   │   ├── favorites.css          (~300 lines)
│   │   │   ├── popovers.css           (~400 lines)
│   │   │   └── settings.css           (~100 lines)
│   │   ├── animations.css             (~144 lines)
│   │   ├── variables.css              (~66 lines)
│   │   ├── global.css                 (~489 lines - monitor)
│   │   └── components.css             (import aggregator)
│   │
│   ├── js/
│   │   ├── app.js                     (~150 lines) ⭐ Refactored
│   │   ├── main.js                    (~13 lines)
│   │   │
│   │   ├── core/                      ⭐ New directory
│   │   │   ├── event-bus.js          (~100 lines) ⭐ NEW - Event system
│   │   │   ├── app-state.js          (~120 lines) ⭐ NEW - State management
│   │   │   ├── events.js             (~80 lines) ⭐ NEW - Event constants
│   │   │   ├── notifications.js       (~100 lines)
│   │   │   ├── pwa-install.js        (~80 lines)
│   │   │   └── gestures-handler.js   (~60 lines)
│   │   │
│   │   ├── ui/                        ⭐ New directory
│   │   │   ├── event-handlers.js     (~200 lines)
│   │   │   ├── tooltip-handler.js    (~80 lines)
│   │   │   ├── library-ui.js         (~250 lines)
│   │   │   └── mode-toggle.js        (~300 lines)
│   │   │
│   │   ├── search/                    ⭐ New directory
│   │   │   └── youtube-search-ui.js  (~120 lines)
│   │   │
│   │   ├── modules/
│   │   │   ├── youtube/               ⭐ New directory
│   │   │   │   ├── player.js         (~200 lines)
│   │   │   │   ├── video-loader.js   (~150 lines)
│   │   │   │   ├── playback-controls.js (~150 lines)
│   │   │   │   ├── ui-controls.js    (~200 lines)
│   │   │   │   └── index.js          (~50 lines)
│   │   │   ├── timer.js              (~326 lines)
│   │   │   ├── audio.js              (~132 lines)
│   │   │   ├── storage.js            (~206 lines)
│   │   │   ├── favorites.js          (~380 lines - monitor)
│   │   │   └── favorites-ui.js       (~368 lines - monitor)
│   │   │
│   │   ├── utils/
│   │   │   ├── song_fetcher/          ⭐ New directory
│   │   │   │   ├── config.js         (~100 lines)
│   │   │   │   ├── youtube-api.js    (~120 lines)
│   │   │   │   ├── filters.js        (~80 lines)
│   │   │   │   ├── cache.js          (~60 lines)
│   │   │   │   └── index.js          (~80 lines)
│   │   │   ├── favorite-button.js    (~320 lines)
│   │   │   ├── version-check.js      (~233 lines)
│   │   │   ├── youtube-search.js     (~224 lines)
│   │   │   ├── gestures.js           (~135 lines)
│   │   │   ├── dom.js                (~64 lines)
│   │   │   └── time.js               (~24 lines)
│   │   │
│   │   ├── components/
│   │   │   └── search-dropdown.js    (~369 lines - monitor)
│   │   │
│   │   └── data/
│   │       ├── music-library.js      (~115 lines)
│   │       ├── workout_music.json
│   │       └── workout_music_cache.json
│   │
│   └── partials/                      ⭐ New directory (Phase 4)
│       ├── meta/
│       │   ├── head.html             (~60 lines)
│       │   └── pwa-manifest.html     (~20 lines)
│       ├── layout/
│       │   ├── app-loader.html       (~30 lines)
│       │   └── backgrounds.html      (~20 lines)
│       ├── features/
│       │   ├── timer-controls.html   (~80 lines)
│       │   ├── music-player.html     (~70 lines)
│       │   └── settings-panel.html   (~60 lines)
│       └── popovers/
│           ├── music-library.html    (~80 lines)
│           ├── mood-selector.html    (~70 lines)
│           └── genre-selector.html   (~70 lines)
│
├── .github/
│   └── workflows/
│       ├── update-music.yml           (update path to song_fetcher)
│       └── file-size-check.yml        ⭐ New
│
├── .git/
│   └── hooks/
│       └── pre-commit                 ⭐ New
│
├── .eslintrc.json                     (add max-lines rule)
├── .stylelintrc.json                  (add max-lines rule)
└── package.json
```

**Summary:**

- ⭐ 13 new directories created (CSS, JS, HTML partials)
- 📝 43 new files created from refactoring:
    - 10 CSS component files
    - 10 JS core/ui/search files (includes 3 new event system files)
    - 5 YouTube module files
    - 5 Song fetcher utility files
    - 13 HTML partial files
- ✂️ 5 large files split into focused modules
- 📊 All files now under 400 lines (except monitored ones)
- 🛡️ Prevention measures in place
- 🚀 Future-proofed for new features

---

## 📈 Progress Tracking

### Phase 1: CSS Component Split

- [ ] Create `src/css/components/` directory
- [ ] Extract Timer Display → `components/timer.css`
- [ ] Extract Music Controls → `components/music-controls.css`
- [ ] Extract Music Selection → `components/music-selection.css`
- [ ] Extract Buttons → `components/buttons.css`
- [ ] Extract Overlays → `components/overlays.css`
- [ ] Extract Library → `components/library.css`
- [ ] Extract Search → `components/search.css`
- [ ] Extract Favorites → `components/favorites.css`
- [ ] Extract Popovers → `components/popovers.css`
- [ ] Extract Settings → `components/settings.css`
- [ ] Update main `components.css` with imports
- [ ] Test all UI components
- [ ] Verify animations work
- [ ] Test responsive layouts
- [ ] Test on multiple browsers

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

### Phase 2: App.js Refactoring

- [ ] Create directory structure (`core/`, `ui/`, `search/`)
- [ ] Back up current `app.js`
- [ ] ⭐ Create `core/event-bus.js` (Event communication system)
- [ ] ⭐ Create `core/app-state.js` (State management)
- [ ] ⭐ Create `core/events.js` (Event constants)
- [ ] ⭐ Test event system independently
- [ ] ⭐ Test state management independently
- [ ] Extract notifications → `core/notifications.js`
- [ ] Test notifications
- [ ] Extract PWA install → `core/pwa-install.js`
- [ ] Test PWA functionality
- [ ] Extract gesture handlers → `core/gestures-handler.js`
- [ ] Test gestures
- [ ] Extract event handlers → `ui/event-handlers.js`
- [ ] Test event handling
- [ ] Extract tooltip logic → `ui/tooltip-handler.js`
- [ ] Test tooltips
- [ ] Extract library UI → `ui/library-ui.js`
- [ ] Test library rendering
- [ ] Extract mode toggle → `ui/mode-toggle.js`
- [ ] Test mode switching
- [ ] Extract YouTube search UI → `search/youtube-search-ui.js`
- [ ] Test search functionality
- [ ] Refactor main `app.js`
- [ ] Update all imports
- [ ] Comprehensive testing
- [ ] Test on multiple browsers/devices

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

### Phase 3: YouTube Module Split

- [ ] Create `src/js/modules/youtube/` directory
- [ ] Back up current `youtube.js`
- [ ] Extract core player → `player.js`
- [ ] Test player initialization
- [ ] Extract video loader → `video-loader.js`
- [ ] Test video loading
- [ ] Extract playback controls → `playback-controls.js`
- [ ] Test playback (play, pause, stop, volume, seek)
- [ ] Extract UI controls → `ui-controls.js`
- [ ] Test UI synchronization
- [ ] Create public API → `index.js`
- [ ] Update imports in `app.js`
- [ ] Update imports in `favorites-ui.js`
- [ ] Comprehensive testing
- [ ] Test error scenarios
- [ ] Test on multiple browsers

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

### Phase 4: Index.html Organization

- [ ] Install `vite-plugin-html` package
- [ ] Update `vite.config.js` with HTML plugin
- [ ] Test dev server and build process
- [ ] Create directory structure: `src/partials/{meta,layout,features,popovers}/`
- [ ] Back up current `index.html`
- [ ] Extract head/meta → `partials/meta/head.html`
- [ ] Extract PWA manifest → `partials/meta/pwa-manifest.html`
- [ ] Extract app loader → `partials/layout/app-loader.html`
- [ ] Extract backgrounds → `partials/layout/backgrounds.html`
- [ ] Extract timer controls → `partials/features/timer-controls.html`
- [ ] Extract music player → `partials/features/music-player.html`
- [ ] Extract settings panel → `partials/features/settings-panel.html`
- [ ] Extract music library → `partials/popovers/music-library.html`
- [ ] Extract mood selector → `partials/popovers/mood-selector.html`
- [ ] Extract genre selector → `partials/popovers/genre-selector.html`
- [ ] Extract critical CSS → `styles/inline-critical.css`
- [ ] Update main `index.html` with includes
- [ ] Test dev server renders correctly
- [ ] Test production build
- [ ] Verify all styles and interactive elements work
- [ ] Update deployment documentation

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

### Phase 5: Song Fetcher Utility Split

- [ ] Create `src/js/utils/song_fetcher/` directory
- [ ] Back up current `song_fetcher.js`
- [ ] Extract configuration → `config.js`
- [ ] Test config imports
- [ ] Extract API client → `youtube-api.js`
- [ ] Test API calls
- [ ] Extract filters → `filters.js`
- [ ] Test filter logic
- [ ] Extract cache management → `cache.js`
- [ ] Test cache operations
- [ ] Create main orchestrator → `index.js`
- [ ] Update GitHub Actions workflow
- [ ] Test full workflow
- [ ] Verify cache works
- [ ] Verify output files
- [ ] Validate API usage

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

### Phase 6: Monitoring & Prevention

- [ ] Create pre-commit hook
- [ ] Make hook executable
- [ ] Test pre-commit hook
- [ ] Add ESLint max-lines rule
- [ ] Add Stylelint max-lines rule
- [ ] Create GitHub Actions file size check
- [ ] Test GitHub Actions check
- [ ] Create `docs/coding-standards.md`
- [ ] Update pull request template
- [ ] Document file organization standards
- [ ] Set up monitoring for files approaching limit

**Status:** Not Started
**Estimated Completion:** ___ / ___ / ___

---

## 📊 Metrics

### Before Refactoring

- **Files over 400 lines:** 5
- **Largest file:** 2,944 lines (components.css)
- **Average file size:** 312 lines
- **Total source files:** 23

### After Refactoring (Target)

- **Files over 400 lines:** 0
- **Largest file:** ~400 lines (max)
- **Average file size:** ~150 lines
- **Total source files:** ~63 (better organized with HTML partials)

### Expected Benefits

- ✅ Improved maintainability
- ✅ Easier code navigation
- ✅ Better testability
- ✅ Clearer module boundaries
- ✅ Reduced merge conflicts
- ✅ Faster onboarding for new developers
- ✅ Better IDE performance
- ✅ Easier to identify and fix bugs

---

## 🎯 Success Criteria

- [ ] All source files are under 400 lines
- [ ] No file exceeds 450 lines
- [ ] Code maintains or improves functionality
- [ ] All tests pass (if applicable)
- [ ] Application works in all supported browsers
- [ ] Performance is maintained or improved
- [ ] Documentation is updated
- [ ] Prevention measures are in place
- [ ] Team is trained on new structure

---

## 📝 Notes

- Always test thoroughly after each refactoring step
- Keep backups of working versions
- Consider creating a feature branch for refactoring
- Document any issues or learnings during the process
- Update this document as you progress
- Don't rush - quality over speed

---

**Total Estimated Effort:** 26-36 hours (includes communication infrastructure)
**Priority Order:** Phase 6 (Prevention) → Phase 1 (CSS) → Phase 2 (App.js) → Phase 3 (YouTube) → Phase 4 (HTML) → Phase
5 (Song Fetcher)
**Recommended Timeline:** 3-4 weeks (depending on available time)
**All Phases Required:** Yes - Phase 4 is NOT optional

---

*Last Updated: 2025-10-14*
*Document Version: 2.0 - Added Module Communication Pattern (Event Bus + State Management), Made Phase 4 REQUIRED*
