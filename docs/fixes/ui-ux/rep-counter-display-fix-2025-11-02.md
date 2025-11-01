# RepCounter Display Fix for Plans with Repetitions

**Date:** 2025-11-02
**Status:** ✅ Completed
**Priority:** High
**Type:** Bug Fix / UX Enhancement

---

## Problem

When using custom or preset plans with repetitions > 1, the repCounter display showed confusing and incorrect information:

### Issues:

1. **Duplicate Round Information**: Segment names had "(Round X)" appended, then progress counter also showed round info
2. **Wrong Segment Count**: Counter showed work segments only (e.g., 4/6) instead of total segments (e.g., 7/15)
3. **Confusing UX**: Users see 15 segments in the timeline but counter shows "out of 6"

### Example of Bug:

**Custom plan with 5 segments × 3 repetitions = 15 total segments**

On segment 7 (Work Interval, Round 2), repCounter showed:
```
❌ "Work Interval (Round 1) (4/6)"
```

Problems:
- "(Round 1)" was wrong (should be Round 2)
- Duplicate round display
- "(4/6)" only counted work segments, not total segments

---

## Solution

Fixed repCounter to show clear, accurate information:

1. **Store round information separately** - Don't append to segment name
2. **Show actual segment progress** - Display total segment count, not just work segments
3. **Clear round indicator** - Show "Round X/Y" when repetitions > 1

---

## Technical Changes

### 1. Updated `loadPlanSegments()` - Store Round Info Separately

**File:** `src/js/modules/timer.js` (lines 111-123)

**Before:**
```javascript
// Add round number to segment name if repetitions > 1
if (repetitions > 1) {
  segmentCopy.name = `${seg.name} (Round ${rep + 1})`;
}
```

**After:**
```javascript
// Store round information separately (not in name)
if (repetitions > 1) {
  segmentCopy.roundNumber = rep + 1;
  segmentCopy.totalRounds = repetitions;
}
```

**Result:**
- Segment names stay clean: "Work Interval" (not "Work Interval (Round 1)")
- Round information stored in `roundNumber` and `totalRounds` properties
- Can be displayed flexibly in UI

---

### 2. Updated `updateDisplay()` - Show Correct Segment Count

**File:** `src/js/modules/timer.js` (lines 936-952)

**Before:**
```javascript
const { currentRound, totalRounds } = this.getSegmentRoundInfo();
const progress = `${currentRound}/${totalRounds}`;
this.repCounter.textContent = `${currentSegment.name} (${progress})`;
```

**After:**
```javascript
// Show actual segment index out of total segments
const currentIndex = this.currentSegmentIndex + 1;
const totalSegments = this.planSegments.length;

// Add round info if repetitions > 1
const roundInfo = currentSegment.roundNumber && currentSegment.totalRounds > 1
  ? ` - Round ${currentSegment.roundNumber}/${currentSegment.totalRounds}`
  : '';

this.repCounter.textContent = `${currentSegment.name}${roundInfo} (${currentIndex}/${totalSegments})`;
```

**Result:**
- Shows actual segment index: "7/15" (segment 7 of 15 total)
- Adds round info only when needed: "Round 2/3"
- Clean, clear format

---

## Display Format Examples

### Repetitions = 1 (No round info needed)

```
"Warm Up (1/5)"
"Work Interval (2/5)"
"Rest (3/5)"
"Work Interval (4/5)"
"Cool Down (5/5)"
```

Simple and clean - just segment name and progress.

---

### Repetitions = 3 (Shows round info)

**Round 1:**
```
"Warm Up - Round 1/3 (1/15)"
"Work Interval - Round 1/3 (2/15)"
"Rest - Round 1/3 (3/15)"
"Work Interval - Round 1/3 (4/15)"
"Cool Down - Round 1/3 (5/15)"
```

**Round 2:**
```
"Warm Up - Round 2/3 (6/15)"
"Work Interval - Round 2/3 (7/15)"      ← Clear: Segment 7, Round 2
"Rest - Round 2/3 (8/15)"
"Work Interval - Round 2/3 (9/15)"
"Cool Down - Round 2/3 (10/15)"
```

**Round 3:**
```
"Warm Up - Round 3/3 (11/15)"
"Work Interval - Round 3/3 (12/15)"
"Rest - Round 3/3 (13/15)"
"Work Interval - Round 3/3 (14/15)"
"Cool Down - Round 3/3 (15/15)"
```

---

## Before vs After Comparison

### Before Fix (Buggy):

| Segment | Display | Issues |
|---------|---------|--------|
| 1 (R1) | `Warm Up (Round 1) (1/4)` | Wrong count (1/4 instead of 1/15) |
| 2 (R1) | `Work Interval (Round 1) (2/4)` | Wrong count |
| 7 (R2) | `Work Interval (Round 1) (4/4)` | Wrong round!, wrong count |
| 15 (R3) | `Cool Down (Round 3) (4/4)` | Wrong count (should be 15/15) |

**Problems:**
- ❌ Round number often incorrect
- ❌ Duplicate round display
- ❌ Counter shows work segments only (out of 4) not total (out of 15)

---

### After Fix (Correct):

| Segment | Display | Benefits |
|---------|---------|----------|
| 1 (R1) | `Warm Up - Round 1/3 (1/15)` | Clear round, accurate count |
| 2 (R1) | `Work Interval - Round 1/3 (2/15)` | Accurate |
| 7 (R2) | `Work Interval - Round 2/3 (7/15)` | Correct round, correct count |
| 15 (R3) | `Cool Down - Round 3/3 (15/15)` | Shows completion clearly |

**Benefits:**
- ✅ Accurate segment count (7 of 15 total)
- ✅ Correct round number (Round 2 of 3)
- ✅ No duplicate information
- ✅ Clear, easy to understand

---

## User Experience Impact

### Before (Confusing):
```
User sees: 15 segments in timeline
RepCounter shows: "(4/6)"
User thinks: "Wait, why is it 4 of 6? I have 15 segments!"
```

### After (Clear):
```
User sees: 15 segments in timeline
RepCounter shows: "(7/15)"
User thinks: "Perfect! Segment 7 of 15, Round 2 of 3"
```

---

## Edge Cases Handled

### 1. Repetitions = 1
```
No round info displayed (not needed)
"Work Interval (2/5)"
```

### 2. Quick Start Mode
```
Unaffected - still shows "Rep 2 / 3"
```

### 3. Simple Mode
```
Unaffected - still shows "Rep 2 / 3"
or "REST - Next: Rep 3 / 3"
```

### 4. Preset Plans
```
Same fix applies - shows correct counts
"HIIT Interval 1 - Round 2/3 (8/39)"
```

---

## Testing Checklist

- [x] Custom plan with reps=1: Shows segment count only (no round)
- [x] Custom plan with reps=3: Shows round and correct count
- [x] Preset plan with reps=2: Shows round and correct count
- [x] Quick Start: Unaffected, still works correctly
- [x] Simple mode: Unaffected, still works correctly
- [x] Segment 1: Shows "1/15"
- [x] Segment 7 (Round 2): Shows "Round 2/3 (7/15)"
- [x] Last segment: Shows "15/15"

---

## Files Modified

1. **`src/js/modules/timer.js`** (2 changes)
   - Lines 115-119: Store round info separately (`roundNumber`, `totalRounds`)
   - Lines 940-949: Display actual segment count with optional round info

2. **`docs/fixes/ui-ux/rep-counter-display-fix-2025-11-02.md`** (this file)

---

## Performance Impact

✅ **None** - Minimal changes, no performance impact:
- Added 2 properties per segment (when reps > 1)
- Simple string concatenation in display update
- No additional loops or calculations

---

## Backward Compatibility

✅ **Fully compatible:**
- Quick Start mode unchanged
- Simple mode unchanged
- Preset plans without repetitions unchanged
- Only affects display when repetitions > 1

---

## Related Fixes

- **Plan Repetitions Implementation** (2025-11-02): Made repetitions work for all plan types
- **Custom Plans Sound Cues** (2025-11-02): Added sound cues to custom plans

This fix completes the repetitions feature by making the UI display accurate information.

---

## Code Review Notes

### Alternative Considered: Keep getSegmentRoundInfo()

The existing `getSegmentRoundInfo()` method (lines 159-190) counts work segments only:
```javascript
const workSegments = this.planSegments.filter(seg =>
  seg.type === 'hiit-work' || seg.type === 'cardio-moderate' || seg.type === 'strength-training'
);
```

**Decision:** Use actual segment index instead
- More accurate (all segments, not just work)
- Simpler logic
- Clearer for users

The `getSegmentRoundInfo()` method is still available but no longer used in repCounter display. Could be removed or repurposed in future.

---

## Summary

✅ **Fixed:** RepCounter now shows accurate segment counts and round information
✅ **Clearer UX:** Users can see exactly where they are in the workout
✅ **No Duplicates:** Round information displayed once, in consistent format
✅ **Accurate Counts:** Shows actual segment index (7/15) not work-only count (4/6)

**Format:** `"Segment Name - Round 2/3 (7/15)"`
- Segment Name: Clean, no appended round
- Round Info: Only when reps > 1
- Progress: Actual segment index of total segments

**Status:** Ready for production ✓
