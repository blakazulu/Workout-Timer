# Timer State Reset Fix

**Date:** 2025-11-01
**Type:** Bug Fix
**Severity:** High
**Component:** Timer

## Problem

After completing a workout and pressing START again, the timer was not properly resetting its state, leading to:

1. **Display issues**: Timer not updating correctly on second run
2. **CSS state issues**: Warning/alert/rest mode classes persisting from previous workout
3. **Segment state issues**: Not resetting to first segment
4. **Visual artifacts**: Alert states, rest mode colors, and transitions from previous workout

### User Report
1. Start a timer and finish it
2. Press START again (or select new plan and start)
3. Timer display doesn't update properly, CSS classes are incorrect, or timer doesn't start from beginning

## Root Cause

The `start()` method's fresh start detection only checked `if (!this.currentTime)`, which didn't account for:

1. **Completed segment-based workouts**: After all segments complete, `currentSegmentIndex` is at the end, but `currentTime` is 0
2. **CSS state persistence**: No cleanup of CSS classes from previous workout
3. **Transition flag**: `transitionInProgress` flag could block state changes

**Original problematic code:**
```javascript
const isFreshStart = !this.currentTime;
```

This didn't detect when segments were completed (`currentSegmentIndex >= planSegments.length`).

## Solution

Enhanced the `start()` method to properly detect fresh starts and clear state:

### 1. Improved Fresh Start Detection

```javascript
// Track if this is a fresh start or resume
// Fresh start if currentTime is 0 OR if we're at the end of segments
const isAtEnd = this.isSegmentMode && this.currentSegmentIndex >= this.planSegments?.length;
const isFreshStart = !this.currentTime || isAtEnd;
```

Now detects fresh start when:
- `currentTime` is 0 (as before)
- **OR** when all segments are completed (`currentSegmentIndex >= planSegments.length`)

### 2. Clear CSS State on Fresh Start

Added cleanup of all CSS state classes when starting fresh:

```javascript
if (isFreshStart) {
  // Clear all CSS state classes from previous run
  removeClass(this.timerDisplay, "alert");
  removeClass(this.timerDisplay, "resting");
  removeClass(this.timerValue, "warning");
  removeClass(this.timerValue, "rest-mode");

  // Reset transition flag
  this.transitionInProgress = false;

  // ... rest of initialization
}
```

### 3. Enhanced `stop()` and `reset()` Methods

Added CSS class cleanup to `stop()` and `reset()` methods:

```javascript
// In both stop() and reset():
removeClass(this.timerDisplay, "alert");
removeClass(this.timerDisplay, "resting");
removeClass(this.timerValue, "warning");
removeClass(this.timerValue, "rest-mode");
this.lastAlertSecond = null;

// In reset() only:
this.currentSegmentIndex = 0;
this.transitionInProgress = false;
```

## Changes Made

### Files Modified
- `src/js/modules/timer.js` (lines 268-317, 423-457, 455-497)

### State Variables Reset
1. **Time state**: `currentTime`, `currentRep`, `isResting`
2. **Segment state**: `currentSegmentIndex`, `transitionInProgress`
3. **Timestamp state**: `startTimestamp`, `targetEndTime`, `lastAlertSecond`
4. **Alert state**: `isAlertActive`, volume restoration
5. **Visual state**: All CSS classes (alert, resting, warning, rest-mode)

### CSS Classes Cleared
- `timerDisplay`: "alert", "resting"
- `timerValue`: "warning", "rest-mode"

## Impact

### Before Fix
- Timer display might show stale data on second run
- Alert/warning colors persist after workout completion
- Rest mode visual state carries over
- Segment index doesn't reset, causing wrong segment to play
- Transition flags can block state changes

### After Fix
- Clean slate for every new plan selection
- All visual states properly cleared
- Correct segment starts from index 0
- No visual artifacts from previous session
- Smooth transitions between workouts

## Testing Scenarios

✅ **Scenario 1**: Complete workout → Select new plan → Start again
- Expected: Timer starts fresh from first segment
- CSS classes: All cleared, no alert/rest states

✅ **Scenario 2**: Complete workout → Change settings → Start again
- Expected: Settings applied, timer starts clean
- Display: Shows new settings correctly

✅ **Scenario 3**: Stop mid-workout → Select new plan → Start
- Expected: Previous workout state completely cleared
- Segments: Starts from segment 1 of new plan

✅ **Scenario 4**: Complete workout with alerts → Start new workout
- Expected: No warning/alert classes from previous run
- Volume: Restored to normal, no alert volume

## Related Code

### Timer State Management
- `src/js/modules/timer.js:268-317` - Enhanced start() method with better fresh start detection
- `src/js/modules/timer.js:423-457` - Enhanced stop() with CSS cleanup
- `src/js/modules/timer.js:455-497` - Enhanced reset() with CSS cleanup

### CSS State Classes
- Alert state: `.alert` on timerDisplay, `.warning` on timerValue
- Rest state: `.resting` on timerDisplay, `.rest-mode` on timerValue

## Notes

The key insight is that fresh start detection needs to check both `currentTime === 0` AND whether segments have completed. This ensures that pressing START after a completed workout properly resets all state and starts from the beginning.
