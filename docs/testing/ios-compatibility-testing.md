# iPhone/iOS Compatibility Testing Guide

**Date**: 2025-10-21
**Purpose**: Comprehensive testing checklist to ensure ALL features work on iPhones (Safari + PWA)

---

## 🎯 Testing Scope

This guide covers testing for:
- **iOS Safari Browser** (iOS 14.0+)
- **PWA Standalone Mode** (Add to Home Screen)
- **Edge Cases**: Low Power Mode, Background/Foreground, Offline

---

## 📱 Test Devices Required

### Minimum Requirements:
- iPhone with iOS 14.0 or later
- Safari browser (built-in)
- Stable WiFi connection (for initial testing)

### Recommended for Comprehensive Testing:
- iPhone SE (small screen - 4.7")
- iPhone 14/15 (standard screen - 6.1")
- iPhone 14/15 Pro Max (large screen + notch - 6.7")
- iOS versions: 14.0, 15.0, 16.0, 17.0+

---

## ✅ Feature Testing Checklist

### 1. **Popover Systems** (Critical - Uses Polyfill)

#### Music Library Popover
- [ ] Click library icon - popover opens
- [ ] Popover displays centered on screen
- [ ] Can switch between Recent/Most Played/Favorites tabs
- [ ] Clicking outside closes popover
- [ ] Close button (X) works
- [ ] Clicking song loads it and closes popover
- [ ] No scroll issues or layout breaks

#### Mood Selector Popover
- [ ] Click mood button - popover opens
- [ ] All mood tags visible and scrollable
- [ ] Clicking mood tag closes popover and searches
- [ ] Backdrop click closes popover
- [ ] Icons display correctly (Phosphor or Unicode)

#### Genre Selector Popover
- [ ] Click genre button - popover opens
- [ ] All genre tags visible and scrollable
- [ ] Clicking genre tag closes popover and searches
- [ ] No overlapping or z-index issues

#### Music Info Tooltip
- [ ] Hover/tap on music info icon
- [ ] Tooltip appears with song details
- [ ] Tooltip closes when tapping outside
- [ ] Text is readable (no cutoff)

---

### 2. **Audio System** (iOS-Specific Enhancements)

#### Timer Alert Beeps (Web Audio API)
- [ ] Start timer - beeps play at 3-2-1 countdown
- [ ] Beep frequency: 800Hz audible
- [ ] Beeps work during active use
- [ ] Beeps work after backgrounding (when returning)
- [ ] No audio glitches or stutters

#### Sound Effects (MP3 Files)
- [ ] End of rest sound plays (whistle)
- [ ] Round end sound plays (boxing bell)
- [ ] Workout over sound plays (three bells)
- [ ] Sounds play sequentially on iOS (no concurrent overlap issues)
- [ ] Sounds play even with YouTube music

#### Low Power Mode Testing
- [ ] Enable Low Power Mode (Settings → Battery)
- [ ] Audio still plays (may have delay)
- [ ] Beeps still audible
- [ ] App remains functional

#### Background Audio Testing
- [ ] Start timer, press Home button (background app)
- [ ] Alert beeps continue (may not play while backgrounded)
- [ ] Return to app - missed alerts play catch-up
- [ ] Sound playback resumes properly

---

### 3. **Timer Functionality** (Background Accuracy)

#### Basic Timer Operation
- [ ] Set duration (e.g., 30 seconds)
- [ ] Set alert time (e.g., 3 seconds)
- [ ] Set repetitions (e.g., 3 reps)
- [ ] Set rest time (e.g., 10 seconds)
- [ ] Click START - timer counts down correctly
- [ ] Timer displays updates every second
- [ ] Rep counter shows "Rep 1 / 3" format

#### Background Timer Accuracy
- [ ] Start 60-second timer
- [ ] Press Home button (background app)
- [ ] Wait 30 seconds
- [ ] Return to app - timer should show ~30s remaining
- [ ] Background accuracy ±2 seconds acceptable
- [ ] Missed beeps play on return (iOS feature)

#### Multi-Rep Timer Flow
- [ ] Complete rep 1 - round end sound plays
- [ ] Rest period starts (if restTime > 0)
- [ ] Rest countdown displays correctly
- [ ] Rest end sound plays (whistle)
- [ ] Next rep starts automatically
- [ ] Repeat until all reps complete
- [ ] Final completion sound plays (three bells)

#### Timer State Persistence
- [ ] Pause timer mid-countdown
- [ ] Background app
- [ ] Return to app
- [ ] Resume timer - countdown continues accurately

---

### 4. **YouTube Integration**

#### Video Loading
- [ ] Paste YouTube URL (youtube.com/watch?v=...)
- [ ] Press Enter or click Load
- [ ] Video loads in background (30% opacity)
- [ ] Loading overlay appears then disappears
- [ ] Video title displays in music controls

#### YouTube Playback
- [ ] Click Play button - video plays
- [ ] Audio is audible
- [ ] Progress bar updates
- [ ] Seeking works (drag progress bar)
- [ ] Pause button works
- [ ] Volume ducking works during alert countdown

#### YouTube + Timer Integration
- [ ] Start timer with YouTube video playing
- [ ] Music continues during workout
- [ ] Music volume reduces to 25% during alerts (3-2-1 countdown)
- [ ] Music volume returns to 100% after alert
- [ ] Music continues after rep completion sounds

#### PWA Standalone Mode
- [ ] Install PWA (Add to Home Screen)
- [ ] Open from home screen
- [ ] Load YouTube video in PWA
- [ ] Video plays correctly
- [ ] No embedding errors (Error 101/150 handled)

---

### 5. **Favorites System**

#### Adding Favorites
- [ ] Play a song
- [ ] Click heart icon (empty → filled)
- [ ] Notification: "Added to favorites"
- [ ] Badge shows favorite count
- [ ] Favorite persists after page reload

#### Removing Favorites
- [ ] Click filled heart icon (filled → empty)
- [ ] Notification: "Removed from favorites"
- [ ] Badge count decrements
- [ ] Removal persists after reload

#### Favorites List
- [ ] Open Music Library
- [ ] Click Favorites tab
- [ ] All favorited songs display
- [ ] Random button works (loads random favorite)
- [ ] Clicking favorite loads song
- [ ] Remove button (X) works on each favorite

#### localStorage Limit Testing
- [ ] Add 50 favorites (max limit)
- [ ] Try to add 51st - shows limit message
- [ ] Favorites persist after closing/reopening app
- [ ] No localStorage quota errors on iOS

---

### 6. **UI/UX Touch Interactions**

#### Touch Gestures
- [ ] Double-tap timer display - starts/pauses timer
- [ ] Swipe down on timer - confirms new timer
- [ ] All buttons respond to tap (no delay)
- [ ] No accidental zoom on button taps

#### Scrolling
- [ ] Music library list scrolls smoothly
- [ ] Mood/genre popovers scroll if needed
- [ ] No bounce/rubber-band on fixed elements
- [ ] Webkit smooth scrolling active

#### Input Focus
- [ ] Tap YouTube URL input - keyboard appears
- [ ] Input field zooms to readable size
- [ ] No unintended page zoom
- [ ] Keyboard dismiss works

---

### 7. **PWA Features** (iOS Specific)

#### Installation
- [ ] Safari → Share → Add to Home Screen
- [ ] Icon appears on home screen
- [ ] App name displays as "CYCLE"
- [ ] Icon uses correct size (180x180 apple-touch-icon)

#### Standalone Mode Detection
- [ ] Open PWA from home screen
- [ ] App opens in standalone mode (no Safari UI)
- [ ] Safe area insets respected (notch area clear)
- [ ] No unwanted scrolling
- [ ] Status bar displays correctly

#### PWA Updates
- [ ] Deploy new version (bump package.json version)
- [ ] Open PWA - update overlay appears
- [ ] Accept update - new version loads
- [ ] Old cache cleared automatically
- [ ] Icons still display after update

#### Offline Mode
- [ ] Load app with internet
- [ ] Enable Airplane Mode
- [ ] Open PWA from home screen
- [ ] App loads from cache
- [ ] Timer works offline
- [ ] Icons display (fallbacks active)
- [ ] Local features work (no YouTube)

---

### 8. **Screen Wake Lock** (iOS Limitation)

#### Wake Lock Status
- [ ] Start timer
- [ ] Check if screen stays on (iOS does NOT support Wake Lock API)
- [ ] App detects wake lock unsupported (no errors)
- [ ] Timer continues even if screen locks
- [ ] Accuracy maintained when screen unlocks

**Note**: iOS does NOT support Screen Wake Lock API. This is a known limitation.

---

### 9. **Icon System** (Multi-Layer Fallbacks)

#### Icon Display
- [ ] All icons visible on first load
- [ ] Icons are Unicode (▶♥🔥) or Phosphor glyphs
- [ ] No blank spaces where icons should be
- [ ] Icons in music controls work
- [ ] Icons in library work
- [ ] Icons in popovers work

#### Low Power Mode Icon Test
- [ ] Enable Low Power Mode
- [ ] Reload page
- [ ] Unicode fallback icons display immediately
- [ ] Icons remain functional (clickable)

#### Icon Fallback Verification
- [ ] Test page: `/test-icon-fallbacks.html`
- [ ] Click "Simulate Font Failure"
- [ ] Verify Unicode fallbacks appear
- [ ] All icons still visible and functional

---

### 10. **Storage & Data Persistence**

#### Settings Persistence
- [ ] Change timer settings (duration, reps, etc.)
- [ ] Close/reopen app
- [ ] Settings restored from localStorage
- [ ] Values match last session

#### Song History
- [ ] Play 5 different songs
- [ ] Reload page
- [ ] Open Music Library → Recent tab
- [ ] All 5 songs appear in history
- [ ] Play counts accurate
- [ ] Thumbnails load (last 20 only)

#### Storage Optimization
- [ ] Play 100 songs (stress test)
- [ ] Check localStorage usage (< 50MB limit)
- [ ] Old thumbnails cleared automatically
- [ ] No quota exceeded errors on iOS

---

## 🔬 Edge Case Testing

### Scenario 1: Timer During Phone Call
1. Start timer with music
2. Receive/make phone call
3. Answer call
4. Hang up call
5. **Expected**: Timer paused, music stopped, can resume after call

### Scenario 2: Low Battery + Low Power Mode
1. Drain battery to 20%
2. Enable Low Power Mode automatically
3. Start timer with music
4. **Expected**: App functions, may have performance throttling

### Scenario 3: Rapid App Switching
1. Start timer
2. Quickly switch to 5 different apps
3. Return to CYCLE app
4. **Expected**: Timer syncs accurately, no crashes

### Scenario 4: Long Background Duration
1. Start 30-minute timer
2. Background app for 20 minutes
3. Return to app
4. **Expected**: ~10 minutes remaining, missed alerts play

### Scenario 5: Network Interruption
1. Start YouTube video
2. Enable Airplane Mode mid-playback
3. **Expected**: Music stops, timer continues, no crashes

---

## 📊 Pass/Fail Criteria

### Critical (Must Pass):
- ✅ All popovers open and close correctly
- ✅ Timer countdown accurate (±2s after backgrounding)
- ✅ Audio beeps and sounds play
- ✅ Icons visible (Unicode fallbacks if CDN fails)
- ✅ No crashes or freezes
- ✅ Data persists (localStorage)

### High Priority (Should Pass):
- ✅ YouTube integration works
- ✅ Touch gestures respond
- ✅ PWA installs and updates
- ✅ Favorites system functional
- ✅ Safe area insets respected

### Known Limitations (Acceptable):
- ⚠️ Wake Lock API not supported on iOS (timer continues, screen may lock)
- ⚠️ Vibration API not supported on iOS (no haptic feedback)
- ⚠️ Background audio may not play while app is backgrounded (catches up on return)

---

## 🐛 Bug Reporting Template

If you find an issue, report it with:

```markdown
**Device**: iPhone [model]
**iOS Version**: [version]
**Browser**: Safari / PWA Standalone
**Feature**: [popover/audio/timer/etc.]

**Steps to Reproduce**:
1.
2.
3.

**Expected**:
**Actual**:

**Screenshots**: [if applicable]
```

---

## ✅ Sign-Off Checklist

Before deploying to production:

- [ ] Tested on at least 2 different iPhone models
- [ ] Tested on iOS 14, 15, 16, 17+
- [ ] Tested both Safari browser and PWA standalone
- [ ] All critical features pass
- [ ] Known limitations documented
- [ ] No P0/P1 bugs remaining

---

**Testing Complete**: ___/___/______
**Tester**: _______________
**Build Version**: __________
