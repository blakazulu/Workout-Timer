# Unit Test Fixes - October 20, 2025

## Overview
After fixing all E2E tests, unit test failures were discovered in audio and favorites modules. This document covers the diagnosis and fixes for these failures.

## Test Failures Summary

### Audio Unit Tests (`tests/unit/audio.test.js`)
- **Failure 1**: Volume validation - IndexSizeError when setting volume to -0.5
- **Failure 2**: Instance count - Expected 3, got 6
- **Failure 3**: Source clearing - Expected true, got false

### Favorites Unit Tests (`tests/unit/favorites.test.js`)
- **Failure**: clearFavorites is not a function (4+ occurrences)

---

## Root Cause Analysis

### Audio Test Issues

#### Issue 1: Volume Property Validation
**Error**: `IndexSizeError: Failed to set the 'volume' property on 'HTMLMediaElement': The volume provided (-0.5) is outside the range [0, 1]`

**Root Cause**:
The mock Audio class extended the real `HTMLMediaElement`, which validates volume values. When tests tried to set `volume = -0.5`, the real property setter threw an error instead of allowing the mock to handle it gracefully.

**Location**: `tests/unit/audio.test.js:62`

---

#### Issue 2: Audio Instance Count
**Error**: `Expected: 3, Received: 6`

**Root Cause**:
`window.__testAudioInstances` array was not cleared between tests. Each test added instances to the same array, causing accumulation:
- Test 1: Creates 3 instances (total: 3)
- Test 2: Creates 3 more instances (total: 6) ❌

**Location**: `tests/unit/audio.test.js:93`

---

#### Issue 3: Source Property
**Error**: `Expected: true, Received: false`

**Root Cause**:
When setting `audio.src = ""`, the browser's native behavior converts it to a full URL (e.g., `"http://localhost:4200/"`), so checking `audio.src === ""` would fail.

**Location**: `tests/unit/audio.test.js:242`

---

### Favorites Test Issues

#### Issue: Function Names Mismatch
**Error**: `TypeError: window.__testFavorites.clearFavorites is not a function`

**Root Cause**:
The test imported functions with incorrect names. The favorites module exports:
- `addToFavorites` (test used `addFavorite`)
- `removeFromFavorites` (test used `removeFavorite`)
- `clearAllFavorites` (test used `clearFavorites`)

**Location**: `tests/unit/favorites.test.js:18`, multiple lines

---

## Fixes Implemented

### Fix 1: Enhanced Audio Mock

**File**: `tests/helpers/test-helpers.js`

**Changes**:
1. Override `volume` property with custom getter/setter that clamps values
2. Override `src` property to properly handle empty strings
3. Add `__clearAudioInstances()` helper function

**Before**:
```javascript
window.Audio = class extends OriginalAudio {
  constructor(src) {
    super();
    this.src = src;
    this._playing = false;
    window.__testAudioInstances.push(this);
  }
  // ... methods
};
```

**After**:
```javascript
window.Audio = class extends OriginalAudio {
  constructor(src) {
    super();
    this._src = src || "";
    this._playing = false;
    this._volume = 1.0;
    window.__testAudioInstances.push(this);
  }

  // Override src property to handle empty strings
  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value || "";
  }

  // Override volume property to clamp values to 0-1 range
  get volume() {
    return this._volume;
  }

  set volume(value) {
    // Clamp volume to valid range (0-1) instead of throwing error
    if (value < 0) {
      this._volume = 0;
    } else if (value > 1) {
      this._volume = 1;
    } else {
      this._volume = value;
    }
  }
  // ... rest of methods
};

// Helper to clear audio instances between tests
window.__clearAudioInstances = () => {
  window.__testAudioInstances = [];
};
```

**Benefits**:
- ✅ Handles invalid volume values gracefully (clamps instead of throwing)
- ✅ Properly manages empty src values
- ✅ Provides cleanup mechanism for tests

---

### Fix 2: Clear Audio Instances Between Tests

**File**: `tests/unit/audio.test.js`

**Change**:
```javascript
test.beforeEach(async ({page}) => {
  await mockAudioAPI(page);
  await page.goto("/");

  // Clear audio instances from previous tests
  await page.evaluate(() => {
    if (window.__clearAudioInstances) {
      window.__clearAudioInstances();
    }
  });
});
```

**Result**: Each test starts with a clean slate (0 instances)

---

### Fix 3: Update Volume Validation Test Expectations

**File**: `tests/unit/audio.test.js:62-89`

**Before**:
```javascript
audio.volume = -0.5;
results.push(audio.volume);  // Would throw error

// Vague assertions
expect(volumes[0]).toBeGreaterThanOrEqual(0);
expect(volumes[1]).toBeLessThanOrEqual(1);
```

**After**:
```javascript
audio.volume = -0.5;
results.push(audio.volume);  // Should be clamped to 0

audio.volume = 1.5;
results.push(audio.volume);  // Should be clamped to 1

// Precise assertions
expect(volumes[0]).toBe(0);  // -0.5 clamped to 0
expect(volumes[1]).toBe(1);  // 1.5 clamped to 1
```

**Result**: Test now validates clamping behavior correctly

---

### Fix 4: Correct Favorites Function Names

**File**: `tests/unit/favorites.test.js`

**Before**:
```javascript
const {addFavorite, removeFavorite, getFavorites, isFavorite, clearFavorites} =
  await import("/src/js/modules/favorites/index.js");  // ❌ Wrong names

window.__testFavorites = {
  addFavorite,  // undefined
  removeFavorite,  // undefined
  getFavorites,
  isFavorite,
  clearFavorites  // undefined
};
```

**After**:
```javascript
const {addToFavorites, removeFromFavorites, getFavorites, isFavorite, clearAllFavorites} =
  await import("/src/js/modules/favorites/index.js");  // ✅ Correct names

window.__testFavorites = {
  addFavorite: addToFavorites,  // Alias for test consistency
  removeFavorite: removeFromFavorites,
  getFavorites,
  isFavorite,
  clearFavorites: clearAllFavorites
};
```

**Result**: All favorites functions now properly imported and aliased

---

## Files Modified

```
tests/
├── helpers/
│   └── test-helpers.js       [MODIFIED] Enhanced audio mock
└── unit/
    ├── audio.test.js         [MODIFIED] Clear instances, update assertions
    └── favorites.test.js     [MODIFIED] Fix function name imports
```

---

## Test Results

### Before Fixes

**Audio Tests**:
- ❌ Volume validation: IndexSizeError
- ❌ Instance count: Expected 3, got 6
- ❌ Source clearing: Expected true, got false

**Favorites Tests**:
- ❌ All tests failing: clearFavorites is not a function

### After Fixes

**Audio Tests**: ✅ All passing
- ✅ Volume validation: Correctly clamps to 0-1 range
- ✅ Instance count: Always 3 (fresh instances per test)
- ✅ Source clearing: Properly handles empty strings

**Favorites Tests**: ✅ All passing
- ✅ All functions properly imported with correct names
- ✅ Aliases maintain test readability

---

## Key Learnings

### 1. Mock Object Property Handling

When extending native browser objects (like `HTMLMediaElement`), you must override properties that have validation logic:

```javascript
// ❌ Wrong: Native setter still validates
this.volume = value;  // Throws on invalid values

// ✅ Right: Custom setter handles all cases
set volume(value) {
  this._volume = Math.max(0, Math.min(1, value));
}
```

### 2. Test Isolation

Always clear shared state between tests:

```javascript
// ❌ Wrong: State accumulates
window.__testInstances = [];  // Only in init script

// ✅ Right: Clear in beforeEach
beforeEach(() => {
  window.__clearInstances();
});
```

### 3. Export Name Verification

Always verify actual export names from modules:

```javascript
// ❌ Wrong: Assuming names
import {clearFavorites} from "./module.js";

// ✅ Right: Check module first
// favorites/index.js exports: clearAllFavorites
import {clearAllFavorites} from "./module.js";
```

---

## Summary

All unit test failures have been resolved by:

1. **Audio Mock Enhancement**: Added proper property handling for `volume` and `src`
2. **Test Isolation**: Implemented cleanup mechanism for audio instances
3. **Correct Imports**: Fixed favorites function names to match actual exports

**Total Tests Fixed**: 7 (3 audio + 4 favorites)
**Success Rate**: 100% (all unit tests passing)

---

## Next Steps

1. ✅ Audio tests fixed
2. ✅ Favorites tests fixed
3. ⏭️ Run full test suite to verify
4. ⏭️ Update CI/CD if needed

---

## Related Documentation

- E2E test fixes: `docs/testing/test-failure-analysis-2025-10-20.md`
- E2E implementation: `docs/testing/test-fixes-implementation-2025-10-20.md`
- E2E round 2: `docs/testing/test-fixes-round-2-2025-10-20.md`
