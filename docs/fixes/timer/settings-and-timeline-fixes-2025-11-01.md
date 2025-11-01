# Timer Settings and Timeline Fixes

**Date:** 2025-11-01
**Type:** Bug Fix
**Severity:** Critical
**Components:** Timer, Segment Timeline, Settings Panel

## Overview

Fixed two critical bugs affecting the timer functionality:

1. **Bug 1**: Multiple segments displaying active class simultaneously in segment timeline
2. **Bug 2**: Timer not using updated settings (duration, reps, rest) when starting

---

## Bug 1: Segment Timeline Multiple Active Classes

### Problem

The 3-segment timeline display sometimes showed two different segments with active styling at the same time, causing visual confusion.

### Root Cause

**Location**: `src/js/modules/timer.js` - `updateSegmentTimeline()` method (lines 956-1026)

The method had overly complex slot reassignment logic that created conflicts:

```javascript
// Old problematic code
let currentSlot = this.segmentCurrent;
let previousSlot = this.segmentPrevious;
let nextSlot = this.segmentNext;

if (!hasPrevious && hasNext) {
  currentSlot = this.segmentPrevious;  // Reassigned
  nextSlot = this.segmentCurrent;      // Reassigned
  // previousSlot still points to this.segmentPrevious!
  addClass(this.segmentNext, "hidden");
}
```

**The Problem**:
- `currentSlot` and `previousSlot` both pointed to `this.segmentPrevious`
- Later code tried to hide `previousSlot` while showing `currentSlot`
- This created conflicts where elements got incorrect classes
- Result: Two segments appeared active

### Solution

Implemented a **"rolodex" design pattern** where the current (active) segment rotates through visible positions as the workout progresses, maximizing visual space usage:

```javascript
// CASE 1: First segment (no previous) - Current at TOP, Next in MIDDLE
if (!hasPrevious && hasNext) {
  this.updateSegmentItem(this.segmentPrevious, currentSegment, "current");
  this.updateSegmentItem(this.segmentCurrent, nextSegment, "next");
  addClass(this.segmentNext, "hidden");
}
// CASE 2: Last segment (no next) - Previous at TOP, Current at BOTTOM
else if (!hasNext && hasPrevious) {
  this.updateSegmentItem(this.segmentPrevious, prevSegment, "previous");
  this.updateSegmentItem(this.segmentNext, currentSegment, "current");
  addClass(this.segmentCurrent, "hidden");
}
// CASE 3: Middle segment - Previous at TOP, Current in MIDDLE, Next at BOTTOM
else {
  this.updateSegmentItem(this.segmentPrevious, prevSegment, "previous");
  this.updateSegmentItem(this.segmentCurrent, currentSegment, "current");
  this.updateSegmentItem(this.segmentNext, nextSegment, "next");
}
```

**Visual Layout**:

```
First Segment (no previous):
┌═════════════════════════════════┐
│ [🔥] Warm Up        2:00        │ ← Current at TOP (active styling)
├─────────────────────────────────┤
│ [💪] Work Interval  0:30        │ ← Next in MIDDLE
└─────────────────────────────────┘
                                   ← Bottom hidden

Middle Segment:
┌─────────────────────────────────┐
│ [✓] Warm Up         2:00        │ ← Previous at TOP
├═════════════════════════════════┤
│ [💪] Work Interval  0:30        │ ← Current in MIDDLE (active styling)
├─────────────────────────────────┤
│ [⏸] Rest            0:15        │ ← Next at BOTTOM
└─────────────────────────────────┘

Last Segment (no next):
┌─────────────────────────────────┐
│ [✓] Work Interval   0:30        │ ← Previous at TOP
├─────────────────────────────────┤
│ [🎯] Cool Down      2:00        │ ← Current at BOTTOM (active styling)
└─────────────────────────────────┘
                                   ← Middle hidden
```

**Benefits of Rolodex Pattern**:
- **Natural progression**: Active segment rotates TOP → MIDDLE → BOTTOM like flipping through a rolodex
- **Space efficiency**: No empty slots when current segment is visible
- **Visual hierarchy**:
  - Start: Current at top (beginning position)
  - Middle: Current centered (balanced context)
  - End: Current at bottom (completion position)
- **Intuitive UX**: Position indicates progress through workout
- **Clear focus**: Only one segment can have active styling at any time

---

## Bug 2: Settings Not Updating (CRITICAL)

### Problem

After completing a workout, when user changed settings (duration, repetitions, rest time) and started the timer again, it used the **OLD settings** instead of the new values.

**User Experience**:
1. Complete a workout with duration=30s, reps=3
2. Change duration to 45s, reps to 5
3. Click START
4. Timer still runs with 30s duration and 3 reps ❌

### Root Cause

Quick Start plan segments are generated once and cached. When settings change:

1. **Settings saved to localStorage** ✅
2. **New values read from inputs** ✅ (line 271-274 in start())
3. **But timer.planSegments still has OLD segment durations** ❌
4. **Timer uses segment durations, not input values** ❌

**The Flow**:

```
App Init → loadActivePlan() → createQuickStartPlan(oldSettings)
       → loadPlanSegments(segments with OLD durations)

User changes duration input → saveSettings(newValues) ✅
       → planSegments STILL HAS OLD DURATIONS ❌

User clicks START → reads inputs (newDuration=45) ✅
       → but uses firstSegment.duration (oldDuration=30) ❌
```

**Why This Happens**:

The timer has two parallel systems:
- **Simple mode**: Uses `this.duration`, `this.repetitions`, etc.
- **Segment mode**: Uses `this.planSegments[x].duration`

Quick Start uses segment mode, so the input values are read but never used. The timer always uses segment durations.

### Solution

Implemented **dual-layer protection** to ensure Quick Start regenerates when settings change:

#### Layer 1: Regenerate on Settings Change

**File**: `src/js/ui/event-handlers.js` - `setupSettingsAutoSave()` (lines 347-376)

When user changes any setting input, check if Quick Start is active and regenerate:

```javascript
input.addEventListener("change", () => {
  const newSettings = {
    duration: parseInt($("#duration").value),
    alertTime: parseInt($("#alertTime").value),
    repetitions: parseInt($("#repetitions").value),
    restTime: parseInt($("#restTime").value)
  };

  // Save settings to localStorage
  saveSettings(newSettings);

  // If Quick Start is the active plan, regenerate its segments
  const activePlanId = loadActivePlan();
  if (activePlanId === "quick-start") {
    const quickStart = createQuickStartPlan(newSettings);
    const timer = getTimer();
    if (timer && quickStart.segments) {
      timer.loadPlanSegments(quickStart.segments);
      console.log("[Settings] Regenerated Quick Start plan with new settings");
    }
  }
});
```

#### Layer 2: Validate on Timer Start

**File**: `src/js/modules/timer.js` - `start()` method (lines 283-300)

Before starting timer, check if Quick Start segments match current settings:

```javascript
// If Quick Start is active, validate that segments match current settings
const activePlanId = loadActivePlan();
if (activePlanId === "quick-start" && this.isSegmentMode && this.planSegments) {
  // Check if first segment duration matches current duration setting
  const firstSegment = this.planSegments[0];
  if (firstSegment && firstSegment.duration !== this.duration) {
    // Settings have changed, regenerate Quick Start plan
    const quickStart = createQuickStartPlan({
      duration: this.duration,
      alertTime: this.alertTime,
      repetitions: this.repetitions,
      restTime: this.restTime
    });
    this.loadPlanSegments(quickStart.segments);
    console.log("[Timer] Regenerated Quick Start plan - settings changed");
  }
}
```

**Why Both Layers?**

1. **Layer 1 (Settings Change)**: Immediate feedback, plan updates as soon as user changes settings
2. **Layer 2 (Start Validation)**: Safety net in case settings changed through other means (URL params, localStorage edit, etc.)

This ensures Quick Start always uses current settings, regardless of how they changed.

---

## Changes Made

### Files Modified

1. **`src/js/modules/timer.js`**
   - Lines 5-10: Added imports for `loadActivePlan`, `createQuickStartPlan`
   - Lines 283-300: Added Quick Start validation before timer start
   - Lines 976-1057: Enhanced segment timeline with rolodex pattern slot assignment
   - Lines 1071-1092: Added `clearSegmentSlot()` helper to properly hide/clear unused slots

2. **`src/js/ui/event-handlers.js`**
   - Lines 6-9: Added imports for `loadActivePlan`, `createQuickStartPlan`
   - Lines 347-376: Enhanced `setupSettingsAutoSave()` to regenerate Quick Start on change

3. **`src/css/components/timer.css`**
   - Lines 169-203: Unified `.segment-previous` and `.segment-next` styles (both faded/inactive)
   - Lines 205-257: `.segment-current` remains distinct with animations and vibrant styling
   - Removed duplicate `.segment-next` styles (line 259)

---

## Impact

### Before Fixes

**Bug 1 (Timeline)**:
- Multiple segments could appear active simultaneously
- Previous/next segments had different colors (cyan vs purple)
- Previous segments had strikethrough text decoration
- Visual confusion during workouts
- Inconsistent inactive segment appearance

**Bug 2 (Settings)**:
- Settings changes ignored by timer
- User changes duration from 30s → 45s
- Timer still runs with 30s (old value)
- Extremely confusing UX

### After Fixes

**Bug 1 (Timeline)**:
- Only one segment has active styling at any time
- Previous and next segments now look identical (unified neutral gray)
- No strikethrough on previous segments
- Clear visual hierarchy: faded inactive vs glowing active
- Clean, predictable visual state
- Proper segment transitions with rolodex pattern

**Bug 2 (Settings)**:
- Settings instantly update Quick Start plan
- Timer always uses current input values
- User changes duration from 30s → 45s
- Timer correctly runs with 45s
- Smooth, expected UX

---

## Testing Scenarios

### Test Bug 1 Fix (Segment Timeline)

✅ **Scenario 1**: First segment (no previous)
- Start any plan with 3+ segments
- Verify current segment appears at TOP with active styling
- Next segment appears in MIDDLE with preview styling
- Bottom slot is hidden

✅ **Scenario 2**: Middle segment
- Advance to segment 2 or 3
- Verify current segment appears in MIDDLE with active styling
- Previous segment at TOP with completed styling
- Next segment at BOTTOM with preview styling
- All 3 slots visible

✅ **Scenario 3**: Last segment (no next)
- Advance to final segment
- Verify current segment appears at BOTTOM with active styling
- Previous segment at TOP with completed styling
- Middle slot is hidden

✅ **Scenario 4**: Segment transitions
- Watch transitions from first → middle → last
- Verify active segment moves: TOP → MIDDLE → BOTTOM
- Verify only one segment has active styling at any time
- No overlap or double-highlighting
- Natural flow as workout progresses

### Test Bug 2 Fix (Settings Update)

✅ **Scenario 1**: Change duration
1. Open app (Quick Start selected)
2. Duration input shows 30s
3. Change to 45s (blur input or press enter)
4. Console shows: "[Settings] Regenerated Quick Start plan with new settings"
5. Click START
6. Timer shows 45s, not 30s

✅ **Scenario 2**: Change repetitions
1. Repetitions input shows 3
2. Change to 5
3. Click START
4. Verify timer shows "Work - Round 1 (1/5)"
5. Complete workout
6. Verify all 5 rounds execute (9 total segments)

✅ **Scenario 3**: Change multiple settings
1. Change duration: 30s → 20s
2. Change reps: 3 → 8
3. Change rest: 10s → 15s
4. Click START
5. Verify first segment: 20s work
6. Verify second segment: 15s rest
7. Verify total rounds: 8 (shown as "1/8", "2/8", etc.)

✅ **Scenario 4**: Complete workout, then change settings
1. Complete a workout (all segments)
2. Change duration: 30s → 45s
3. Click START again
4. Console shows: "[Timer] Regenerated Quick Start plan - settings changed"
5. Timer starts with 45s duration

✅ **Scenario 5**: Change settings mid-pause
1. Start timer, pause it
2. Change settings while paused
3. Resume timer
4. Verify it uses OLD settings (current workout continues)
5. Stop/complete timer
6. Start fresh workout
7. Verify it uses NEW settings

---

## Related Code

### Segment Timeline (Rolodex Pattern)
- `src/js/modules/timer.js:976-1049` - `updateSegmentTimeline()` with rolodex logic
- `src/js/modules/timer.js:1051-1082` - `updateSegmentItem()` applies position-based styling
- DOM elements: `#segmentPrevious` (top), `#segmentCurrent` (middle), `#segmentNext` (bottom)
- CSS classes: `.segment-previous`, `.segment-current`, `.segment-next` (applied dynamically)
- **Design pattern**: Active segment rotates through positions like a rolodex card system

### Settings Synchronization
- `src/js/ui/event-handlers.js:347-376` - Settings change handler
- `src/js/modules/timer.js:283-300` - Start validation
- `src/js/modules/plans/storage.js:484-532` - Quick Start creation
- `src/js/modules/storage.js` - Settings persistence

### Plan Management
- `src/js/modules/plans/storage.js:279-291` - `loadActivePlan()`
- `src/js/modules/timer.js:95-112` - `loadPlanSegments()`

---

## Notes

### Why Settings Validation Needed

Quick Start is unique because:
1. It's generated dynamically from settings
2. Unlike preset plans, its segments should always match current inputs
3. Settings can change outside the settings panel (URL params, localStorage edits)
4. Need to ensure synchronization between settings UI and plan segments

### Design Decision: Dual-Layer Protection

We could have chosen only one approach:
- **Only Layer 1**: Regenerate on change
  - Pro: Immediate
  - Con: Misses edge cases (direct localStorage edits, URL params)

- **Only Layer 2**: Validate on start
  - Pro: Catches all cases
  - Con: No immediate feedback when changing settings

**Chosen: Both layers** for maximum reliability and best UX.

### Future Considerations

If more dynamic plans are added (similar to Quick Start), consider:
1. Creating a `isDynamicPlan()` helper
2. Generalizing the regeneration logic
3. Adding a `needsRegeneration()` method to plan objects
