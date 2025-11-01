# Quick Start Plan Repetitions Fix

**Date:** 2025-11-01
**Type:** Bug Fix
**Severity:** High
**Component:** Timer / Plan System

## Problem

The Quick Start plan was only executing **1 round** instead of the configured number of repetitions.

### User Report
- Configuration: Duration 10s, Repetitions 5, Rest 10s
- Expected: 10 segments (5 rounds of work+rest)
- Actual: 2 segments (1 round of work+rest)

## Root Cause

The `createQuickStartPlan()` function in `src/js/modules/plans/storage.js` was creating only the base segment pattern (1 work + 1 rest) and storing the `repetitions` value, but **never using it to multiply the segments**.

### Why This Happened
- All 12 preset plans manually expand their segments using loops
- Quick Start is dynamically generated and was missing the expansion logic
- The timer's segment mode expects all segments pre-generated in the array
- There's no runtime repetition support in segment mode

## Solution

Modified `createQuickStartPlan()` to generate all segments upfront based on repetitions:

```javascript
// Generate all segments for all repetitions
const segments = [];

for (let i = 0; i < repetitions; i++) {
  // Work segment for this round
  segments.push({
    type: "hiit-work",
    duration: duration,
    intensity: "very-hard",
    name: `Work - Round ${i + 1}`,
    soundCue: "alert"
  });

  // Rest segment (skip after final round)
  if (restTime > 0 && i < repetitions - 1) {
    segments.push({
      type: "complete-rest",
      duration: restTime,
      intensity: "light",
      name: `Rest - Round ${i + 1}`,
      soundCue: "rest-end"
    });
  }
}

// Set final segment sound to completion
if (segments.length > 0) {
  segments[segments.length - 1].soundCue = "final-complete";
}
```

## Changes Made

### Files Modified
- `src/js/modules/plans/storage.js` (lines 484-532)
- `src/js/modules/timer.js` (lines 134-169, 824-826)

### Behavior Changes
1. **Segment Generation**: Now creates all segments upfront (e.g., 5 reps = 9-10 segments)
2. **Segment Names**: Include round numbers ("Work - Round 1", "Rest - Round 1", etc.)
3. **Sound Cues**: Final segment now uses "final-complete" instead of "rest-end"
4. **Rest After Final Round**: Skipped (consistent with preset plan behavior)
5. **Progress Display**: Shows round-based progress (e.g., "1/5") instead of segment-based (e.g., "1/9")

## Impact

### Before Fix
- Quick Start with 5 reps, 10s work, 10s rest = 2 segments, 20s total
- Workout ended after 1 round

### After Fix
- Quick Start with 5 reps, 10s work, 10s rest = 9 segments, 90s total
- Workout completes all 5 rounds as expected

## Testing Scenarios

✅ **Scenario 1**: Quick Start - 5 reps, 10s work, 10s rest
- Expected: 9 segments (5 work + 4 rest)
- Total duration: 90 seconds

✅ **Scenario 2**: Quick Start - 3 reps, 30s work, 0s rest
- Expected: 3 segments (3 work only)
- Total duration: 90 seconds

✅ **Scenario 3**: Quick Start - 1 rep, 45s work, 15s rest
- Expected: 1 segment (just work, no rest after final)
- Total duration: 45 seconds

## Timer Display Enhancement

### Added Round-Based Progress Counter
Added `getSegmentRoundInfo()` method to calculate current round by counting work segments:

```javascript
getSegmentRoundInfo() {
  // Count work segments to determine total rounds
  const workSegments = this.planSegments.filter(seg =>
    seg.type === 'hiit-work' || seg.type === 'cardio-moderate' || seg.type === 'strength-training'
  );
  const totalRounds = workSegments.length;

  // Count how many work segments we've passed
  let currentRound = 0;
  for (let i = 0; i <= this.currentSegmentIndex && i < this.planSegments.length; i++) {
    const seg = this.planSegments[i];
    if (seg.type === 'hiit-work' || seg.type === 'cardio-moderate' || seg.type === 'strength-training') {
      currentRound++;
    }
  }

  return { currentRound, totalRounds };
}
```

### Display Examples
- **Work segment**: "Work - Round 1 (1/5)"
- **Rest segment**: "Rest - Round 1 (1/5)"
- **Work segment**: "Work - Round 5 (5/5)"

## Related Code

### Timer Segment Loading
- `src/js/app.js:228-236` - Plan selection event handler
- `src/js/modules/timer.js:251-269` - Segment mode initialization
- `src/js/modules/timer.js:542-606` - Segment completion logic
- `src/js/modules/timer.js:138-169` - NEW: Round info calculator
- `src/js/modules/timer.js:824-826` - NEW: Updated display logic

### Plan System
- `src/js/modules/plans/presets.js` - All preset plans expand segments
- `src/js/ui/plan-builder.js` - Simple plan settings UI

## Notes

This fix makes Quick Start consistent with how all preset plans work - segments are fully expanded at plan creation time rather than relying on runtime repetition logic.
