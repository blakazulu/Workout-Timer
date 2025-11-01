# Custom Plans Sound Cues Fix

**Date:** 2025-11-02
**Status:** ✅ Completed
**Priority:** Medium
**Type:** Enhancement / Bug Fix

---

## Problem

Custom workout plans created via the plan builder were missing the `soundCue` property that preset plans have. This caused all custom plan segments to use the default "boxing bell" sound instead of contextually appropriate sounds like:
- **Alert beep** for work segments
- **Whistle** for rest segments
- **Silent** for warmup/cooldown/recovery segments
- **Three bells** for the final segment

### Before Fix

```javascript
// Custom plans only had:
{
  type: "work",
  duration: 30,
  name: "Work"
  // ❌ No soundCue property!
}

// Result: All segments defaulted to boxing bell sound
```

### Expected Behavior (Preset Plans)

```javascript
// Preset plans include:
{
  type: "HIIT_WORK",
  duration: 30,
  name: "HIIT Interval 1",
  soundCue: "alert"  // ✅ Appropriate sound
}
```

---

## Solution

Added intelligent sound cue defaults based on segment type with three-layer approach:

### 1. **Default Sound Cues in Plan Builder** (`src/js/ui/plan-builder.js`)

Updated `SEGMENT_TYPE_DEFAULTS` to include appropriate soundCue for each segment type:

```javascript
const SEGMENT_TYPE_DEFAULTS = {
  prepare: {duration: 120, name: "Prepare", soundCue: "none"},
  warmup: {duration: 300, name: "Warm-up", soundCue: "none"},
  work: {duration: 30, name: "Work", soundCue: "alert"},
  rest: {duration: 15, name: "Rest", soundCue: "rest-end"},
  cooldown: {duration: 300, name: "Cool-down", soundCue: "none"}
};
```

### 2. **Segment Creation with Sound Cues**

Modified `confirmSegment()` function to include soundCue when creating segments:

```javascript
const segment = {
  type,
  duration,
  name: typeDefaults?.name || type,
  soundCue: typeDefaults?.soundCue || "alert" // ✅ Now includes soundCue
};
```

### 3. **Backward Compatibility in Timer** (`src/js/modules/timer.js`)

Added intelligent fallback logic for existing custom plans without soundCue:

```javascript
// Backward compatibility: Infer soundCue from segment type if missing
if (!soundCue && currentSegment) {
  const segmentType = currentSegment.type?.toLowerCase() || "";
  if (segmentType.includes("warm") || segmentType.includes("prepare") ||
      segmentType.includes("cool") || segmentType.includes("recovery") ||
      segmentType.includes("transition")) {
    soundCue = "none";
  } else if (segmentType.includes("rest")) {
    soundCue = "rest-end";
  } else {
    soundCue = "alert"; // Default for work/exercise segments
  }
}
```

---

## Sound Mapping Reference

### Available Sound Cues (from `segment-types.js`):

| Sound Cue | Sound Type | File | When Used |
|-----------|------------|------|-----------|
| `"none"` | Silent | - | Warmup, Cooldown, Prepare, Recovery |
| `"alert"` | Beep (800Hz) | Web Audio | Work, Exercise, High-intensity |
| `"rest-end"` | Whistle | `/sounds/end_of_rest.mp3` | Rest periods ending |
| `"complete"` | Boxing Bell | `/sounds/end_of_round.mp3` | Round completion (fallback) |
| `"final-complete"` | Three Bells | `/sounds/workout_over.mp3` | Last segment (auto-detected) |

### Custom Plan Segment Type → Sound Mapping:

```
prepare  → Silent (none)
warmup   → Silent (none)
work     → Alert Beep (alert)
rest     → Whistle (rest-end)
cooldown → Silent (none) → Three Bells if last segment
```

---

## Changes Made

### Files Modified:

1. **`/src/js/ui/plan-builder.js`** (2 changes)
   - Line 13-19: Added `soundCue` to `SEGMENT_TYPE_DEFAULTS`
   - Line 419-426: Modified `confirmSegment()` to include `soundCue` in segment creation

2. **`/src/js/modules/timer.js`** (1 change)
   - Line 638-656: Added backward compatibility logic to infer `soundCue` from segment type

### Documentation Created:

3. **`/docs/fixes/plans/custom-plans-sound-cues-fix-2025-11-02.md`** (this file)

---

## Testing

### Test Cases:

#### ✅ Test 1: New Custom Plan with Work/Rest
```
Create plan:
- Warmup (5min)
- Work (30s)
- Rest (15s) × 3 rounds
- Cooldown (5min)

Expected sounds:
- Warmup → Silent
- Work → BEEP
- Rest → WHISTLE 🎵
- Work → BEEP
- Rest → WHISTLE 🎵
- Work → BEEP
- Rest → WHISTLE 🎵
- Cooldown → THREE BELLS 🔔🔔🔔 (last segment)
```

#### ✅ Test 2: Existing Custom Plan (Backward Compatibility)
```
Load old custom plan without soundCue:
{
  type: "work",
  duration: 30,
  name: "Work"
  // No soundCue
}

Expected: Timer infers soundCue="alert" from type="work"
Result: BEEP plays correctly ✓
```

#### ✅ Test 3: Mixed Segment Types
```
Create plan:
- Prepare (2min) → Silent
- Work (40s) → BEEP
- Rest (20s) → WHISTLE
- Cooldown (3min) → THREE BELLS (last)
```

---

## Behavior Changes

### Before Fix:
- ❌ All custom plan segments played boxing bell
- ❌ No contextual audio feedback
- ❌ Inconsistent with preset plans

### After Fix:
- ✅ Work segments play alert beep
- ✅ Rest segments play whistle
- ✅ Warmup/cooldown segments silent
- ✅ Last segment always plays three bells (celebration)
- ✅ Consistent with preset plans
- ✅ Existing plans continue to work (backward compatible)

---

## Example: Custom HIIT Plan Sound Flow

**User creates:** 5min warmup → 30s work → 15s rest (×8 rounds) → 3min cooldown

**Sound sequence:**
```
Warmup (5min) → Silent
↓
Work 1 (30s) → BEEP
Rest 1 (15s) → WHISTLE 🎵
Work 2 (30s) → BEEP
Rest 2 (15s) → WHISTLE 🎵
Work 3 (30s) → BEEP
Rest 3 (15s) → WHISTLE 🎵
Work 4 (30s) → BEEP
Rest 4 (15s) → WHISTLE 🎵
Work 5 (30s) → BEEP
Rest 5 (15s) → WHISTLE 🎵
Work 6 (30s) → BEEP
Rest 6 (15s) → WHISTLE 🎵
Work 7 (30s) → BEEP
Rest 7 (15s) → WHISTLE 🎵
Work 8 (30s) → BEEP
Rest 8 (15s) → WHISTLE 🎵
↓
Cooldown (3min) → THREE BELLS 🔔🔔🔔
```

---

## Impact

### User Experience:
- ✅ Custom plans now have the same professional sound cues as preset plans
- ✅ Intuitive audio feedback guides users through workouts
- ✅ Clear distinction between work (beep) and rest (whistle) phases
- ✅ Celebration sound at workout completion

### Code Quality:
- ✅ Maintains backward compatibility with existing plans
- ✅ Intelligent fallback logic prevents errors
- ✅ Consistent sound behavior across all plan types
- ✅ No breaking changes to existing functionality

### Analytics:
- No changes needed - sound analytics already tracked via existing events

---

## Future Enhancements

Potential improvements for future iterations:

1. **UI Sound Selection**
   - Add dropdown in plan builder to let users choose soundCue per segment
   - Preview sounds when building plans

2. **Custom Sound Uploads**
   - Allow users to upload their own workout sounds
   - Create sound library with multiple options

3. **Sound Volume Control**
   - Per-sound volume settings
   - Fade in/out for transitions

---

## Related Files

- `/src/js/ui/plan-builder.js` - Plan builder UI and segment creation
- `/src/js/modules/timer.js` - Timer logic and sound playback
- `/src/js/modules/audio.js` - Audio manager (sound files and playback)
- `/src/js/modules/plans/segment-types.js` - Sound cue constants
- `/public/sounds/` - Sound files (end_of_rest.mp3, end_of_round.mp3, workout_over.mp3)

---

## Summary

✅ **Fixed:** Custom plans now automatically assign appropriate sound cues based on segment type
✅ **Backward Compatible:** Existing plans without soundCue work correctly via inference
✅ **Consistent:** Custom plans match preset plan sound behavior
✅ **User Friendly:** Intuitive audio feedback enhances workout experience

**Status:** Ready for production ✓
