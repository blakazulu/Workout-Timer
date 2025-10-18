# Background Timer Accuracy Fix

**Date:** 2025-10-18
**Status:** ✅ Fixed

## Problem Statement

The workout timer was using `setInterval()` to count down, which gets heavily throttled by browsers when:
- Screen is manually locked by user
- App is in background tab
- Device goes to sleep mode

This caused the timer to become inaccurate:
- **Example:** User starts 30-second timer, locks screen for 20 seconds → Timer only shows 5 seconds elapsed when unlocked
- Timer could be minutes behind actual time
- Workout sessions would be severely disrupted

## Root Cause

**Interval-based counting** relies on JavaScript execution:
- `setInterval` fires every 1 second under normal conditions
- When screen locks or app backgrounds, browsers throttle JavaScript to save battery
- Intervals may fire once per minute (or less!) instead of every second
- Timer falls behind real time

## Solution

Implemented **timestamp-based timer tracking** that calculates elapsed time based on actual system timestamps rather than counting intervals.

### Key Changes

#### 1. Timestamp Tracking (`timer.js:26-29`)

Added timestamp properties to track:
```javascript
this.startTimestamp = null;      // When current period started
this.targetEndTime = null;        // When current period should end
this.lastAlertSecond = null;      // Track alert beeps to avoid duplicates
```

#### 2. Visibility Change Handler (`timer.js:60-88`)

Added event listener to detect when page becomes visible:
```javascript
document.addEventListener('visibilitychange', this.handleVisibilityChange);
```

When user unlocks screen or returns to app:
- Recalculates `currentTime` based on actual elapsed milliseconds
- Catches up timer to real-time position
- Handles transitions if time expired while locked

#### 3. Refactored Timer Logic

**Start Method** (`timer.js:111-115`)
- Sets `targetEndTime` when timer starts
- Calculates end time as: `now + (currentTime * 1000)`

**Tick Method** (`timer.js:320-336`)
- Changed from decrementing counter to syncing from timestamp
- Recalculates position every tick
- Ensures accuracy even if ticks are delayed

**Sync Method** (`timer.js:71-88`)
```javascript
syncTimeFromTimestamp() {
  const now = Date.now();
  const remainingMs = this.targetEndTime - now;
  const newCurrentTime = Math.max(0, Math.ceil(remainingMs / 1000));

  this.currentTime = newCurrentTime;
  // Handle completion if time expired
}
```

#### 4. Phase Transitions (`timer.js:338-405`)

Moved phase transition logic to `handleTimerComplete()`:
- Updates timestamps when transitioning from work → rest
- Updates timestamps when transitioning from rest → next rep
- Ensures each phase has accurate start/end times

## Technical Details

### How It Works

**Without Lock:**
```
Start → targetEndTime = now + 30s
Tick 1s → Calculate: 30 - 1 = 29s remaining ✓
Tick 2s → Calculate: 30 - 2 = 28s remaining ✓
```

**With Screen Lock:**
```
Start → targetEndTime = now + 30s
Tick 1s → 29s remaining
[Screen locks for 20 seconds - only 2 ticks happen]
Tick 2s → 28s remaining (WRONG!)
[User unlocks screen]
Visibility change → Recalculate: 30 - 22 = 8s remaining ✓
```

### Alert Deduplication

Added `lastAlertSecond` tracking to prevent duplicate alert sounds:
- When catching up, timer might jump multiple seconds
- Only plays alert once per second value
- Prevents alert spam when unlocking

## Browser Compatibility

This solution works across all modern browsers:
- ✅ Chrome/Edge
- ✅ Safari
- ✅ Firefox
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

`Date.now()` and visibility API have universal support.

## Testing

To test the fix:

1. **Basic Lock Test:**
   - Start 60-second timer
   - Lock screen for 30 seconds
   - Unlock → Should show ~30 seconds remaining (accurate!)

2. **Tab Switch Test:**
   - Start timer
   - Switch to another tab for 20 seconds
   - Return → Timer should be accurate

3. **Complete During Lock:**
   - Start 15-second timer
   - Lock screen for 20 seconds
   - Unlock → Should show "Complete!" or next phase

4. **Multi-Rep Test:**
   - Start timer with 3 reps, 10s work, 5s rest
   - Lock during work period
   - Unlock → Should correctly transition through phases

## User Benefits

✅ **Accurate Timing** - Timer always shows correct elapsed time
✅ **Lock-Safe** - Works perfectly even when screen is manually locked
✅ **Background-Safe** - Continues accurately in background tabs
✅ **Battery Conscious** - No additional battery drain
✅ **Reliable Workouts** - Users can trust the timer during real workouts

## Code Files Modified

- `src/js/modules/timer.js` - Complete refactor to timestamp-based tracking

## Related Features

Works seamlessly with:
- Wake lock prevention (prevents auto-lock)
- Multi-rep workouts with rest periods
- Audio alerts and beeps
- YouTube music playback
- Analytics event tracking

## Performance Impact

**Positive impacts:**
- More accurate timing
- Better battery life (fewer unnecessary updates)
- Resilient to browser throttling

**No negative impacts:**
- Same number of DOM updates
- Minimal additional computation (timestamp math)
- No new intervals or timers created

## Future Enhancements

Potential improvements:
- Service Worker integration for even more reliable background execution
- Visual indicator when timer catches up from background
- Notification API alerts when timer completes while locked
- Web Locks API to prevent duplicate timer instances
