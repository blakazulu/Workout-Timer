# Workout Plan System - Test Suite Documentation

## Overview

Comprehensive test suite for the Workout Plan System (Phase 3 & 4), covering all data layer operations, UI components, and timer integration. This document provides guidance on running, understanding, and maintaining these tests.

## Test Files Created

### Unit Tests

1. **`tests/unit/plan-storage.test.js`** (340+ lines)
   - Tests plan CRUD operations
   - Validates storage persistence
   - Tests active plan management
   - Validates plan data structure
   - Tests usage tracking

2. **`tests/unit/plan-presets.test.js`** (380+ lines)
   - Tests all 12 built-in presets
   - Validates preset structure
   - Tests preset duplication
   - Validates preset characteristics (warmup, cooldown, intensity, etc.)

3. **`tests/unit/segment-types.test.js`** (420+ lines)
   - Tests all segment type definitions
   - Validates categories (preparation, work, rest, rounds, training-specific, completion)
   - Tests intensity levels and sound cues
   - Tests utility functions (getSegmentType, isValidSegmentType)

4. **`tests/unit/timer.test.js`** (updated, +285 lines)
   - Added new test group: "Timer Module - Segment Mode"
   - Tests segment duration calculation
   - Tests segment progression logic
   - Tests display formatting for segments
   - Tests segment mode detection

### E2E Tests

1. **`tests/e2e/plan-selector.spec.js`** (500+ lines)
   - Tests plan selector modal opening/closing
   - Tests mode tab switching (Simple, Built-in Plans, My Plans)
   - Tests plan selection and activation
   - Tests active plan display updates
   - Tests keyboard accessibility

2. **`tests/e2e/plan-builder.spec.js`** (600+ lines)
   - Tests plan builder modal functionality
   - Tests form fields and validation
   - Tests segment management (add, remove, edit, reorder)
   - Tests plan saving and updating
   - Tests duplicate from preset feature
   - Tests edit mode

3. **`tests/e2e/segment-timer.spec.js`** (450+ lines)
   - Tests segment-based timer execution
   - Tests display updates during segment progression
   - Tests pause/resume in segment mode
   - Tests reset functionality
   - Tests simple mode compatibility
   - Tests edge cases (single segment, many segments, short durations)

## Running the Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Files

```bash
# Unit tests
npm test tests/unit/plan-storage.test.js
npm test tests/unit/plan-presets.test.js
npm test tests/unit/segment-types.test.js
npm test tests/unit/timer.test.js

# E2E tests
npm test tests/e2e/plan-selector.spec.js
npm test tests/e2e/plan-builder.spec.js
npm test tests/e2e/segment-timer.spec.js
```

### Run Tests by Category

```bash
# All unit tests
npm test tests/unit/

# All E2E tests
npm test tests/e2e/

# All plan-related tests
npm test tests/unit/plan-*.test.js tests/e2e/plan-*.spec.js tests/e2e/segment-timer.spec.js
```

### Run in Debug Mode

```bash
npm test -- --debug
```

### Run in Headed Mode (See Browser)

```bash
npm test -- --headed
```

## Test Coverage

### Plan Storage Module (`/src/js/modules/plans/storage.js`)

**Tests Created: 75+**

Coverage Areas:
- Basic CRUD operations (create, read, update, delete)
- Active plan management (set, load, clear)
- Validation (name, mode, segments, structure)
- Usage tracking (increment usage, update timestamps)
- Simple mode compatibility (createQuickStartPlan)
- LocalStorage persistence

Key Test Groups:
- "Plan Storage Module - Basic CRUD Operations" (14 tests)
- "Plan Storage Module - Active Plan Management" (5 tests)
- "Plan Storage Module - Validation" (8 tests)
- "Plan Storage Module - Usage Tracking" (2 tests)
- "Plan Storage Module - Simple Mode Compatibility" (2 tests)

### Plan Presets Module (`/src/js/modules/plans/presets.js`)

**Tests Created: 65+**

Coverage Areas:
- All 12 built-in presets validation
- Preset structure (required fields, segments, metadata)
- Get preset by ID
- Duplicate preset functionality
- Preset characteristics (warmup, cooldown, intensity variation)
- Specific preset validation (Tabata 20:10 timing, etc.)

Key Test Groups:
- "Plan Presets Module - Built-in Plans" (6 tests)
- "Plan Presets Module - Specific Presets" (6 tests)
- "Plan Presets Module - Get Preset by ID" (3 tests)
- "Plan Presets Module - Duplicate Preset" (7 tests)
- "Plan Presets Module - Preset Characteristics" (5 tests)

### Segment Types Module (`/src/js/modules/plans/segment-types.js`)

**Tests Created: 70+**

Coverage Areas:
- All segment type definitions (warmup, work, rest, rounds, training, completion)
- Category assignments
- Intensity levels (light, moderate, hard, very-hard, max)
- Sound cues (none, alert, complete, rest-end, final-complete)
- Utility functions (getSegmentType, isValidSegmentType)
- Default values validation
- Integration scenarios

Key Test Groups:
- "Segment Types Module - Type Definitions" (7 tests)
- "Segment Types Module - Categories" (2 tests)
- "Segment Types Module - Intensity Levels" (2 tests)
- "Segment Types Module - Sound Cues" (2 tests)
- "Segment Types Module - Utility Functions" (5 tests)
- "Segment Types Module - Default Values" (6 tests)
- "Segment Types Module - Integration" (2 tests)

### Timer Module Segment Mode (`/src/js/modules/timer.js`)

**Tests Created: 10 additional**

Coverage Areas:
- Segment duration calculation
- Segment index tracking
- Segment progression logic
- Final segment detection
- Segment information retrieval
- Remaining time calculation
- Segment structure validation
- Display text formatting
- Mode detection (segment vs simple)
- Sound cue mapping

Key Test Group:
- "Timer Module - Segment Mode" (10 tests)

### Plan Selector UI (`/src/js/ui/plan-selector.js`)

**Tests Created: 80+**

Coverage Areas:
- Modal opening and closing
- Mode tab switching
- Simple mode display and selection
- Built-in plans mode display and selection
- My Plans mode (empty state, custom plans)
- Active plan display updates
- Plan persistence across reloads
- Keyboard accessibility
- Active badges and visual indicators

Key Test Groups:
- "Plan Selector - Opening and Closing" (3 tests)
- "Plan Selector - Mode Tabs" (6 tests)
- "Plan Selector - Simple Mode" (3 tests)
- "Plan Selector - Built-in Plans Mode" (8 tests)
- "Plan Selector - My Plans Mode" (7 tests)
- "Plan Selector - Active Plan Display" (3 tests)
- "Plan Selector - Accessibility" (5 tests)

### Plan Builder UI (`/src/js/ui/plan-builder.js`)

**Tests Created: 95+**

Coverage Areas:
- Modal opening and closing (create vs edit mode)
- Form fields (name, description, preset selector)
- Segment management (add, remove, edit)
- Segment editing (type, duration, intensity, name, sound cue)
- Segment reordering (move up/down buttons)
- Total duration calculation
- Duplicate from preset
- Validation (required fields, minimum segments)
- Save and update functionality
- Keyboard accessibility

Key Test Groups:
- "Plan Builder - Opening and Closing" (4 tests)
- "Plan Builder - Form Fields" (6 tests)
- "Plan Builder - Segment Management" (10 tests)
- "Plan Builder - Segment Editing" (7 tests)
- "Plan Builder - Segment Reordering" (4 tests)
- "Plan Builder - Duplicate from Preset" (3 tests)
- "Plan Builder - Validation and Saving" (7 tests)
- "Plan Builder - Edit Mode" (3 tests)
- "Plan Builder - Accessibility" (4 tests)

### Segment-Based Timer Execution

**Tests Created: 60+**

Coverage Areas:
- Basic segment execution flow
- Display updates (segment name, counter, time)
- Segment transitions
- Pause and resume in segment mode
- Reset functionality
- Simple mode compatibility
- Edge cases (single segment, many segments, short durations)

Key Test Groups:
- "Segment Timer - Basic Execution" (7 tests)
- "Segment Timer - Display Updates" (3 tests)
- "Segment Timer - Pause and Resume" (5 tests)
- "Segment Timer - Reset Functionality" (3 tests)
- "Segment Timer - Simple Mode Compatibility" (3 tests)
- "Segment Timer - Edge Cases" (3 tests)

## Total Test Count

- **Unit Tests**: ~210 tests
  - Plan Storage: 31 tests
  - Plan Presets: 27 tests
  - Segment Types: 26 tests
  - Timer (segment mode): 10 tests
  - Existing timer tests: ~11 tests

- **E2E Tests**: ~235 tests
  - Plan Selector: 35 tests
  - Plan Builder: 48 tests
  - Segment Timer: 24 tests
  - Existing E2E tests: ~128 tests

- **Grand Total**: ~445 tests (existing + new plan system tests)

## Test Patterns and Best Practices

### Unit Test Pattern

```javascript
test.describe("Module Name - Feature Group", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import module and expose for testing
    await page.evaluate(async () => {
      const module = await import("/src/js/modules/module-name.js");
      window.__testModule = module;
      localStorage.clear();
    });
  });

  test("should do something specific", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testModule.functionName();
    });

    expect(result).toBe(expectedValue);
  });
});
```

### E2E Test Pattern

```javascript
test.describe("Feature - Specific Behavior", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should interact with UI correctly", async ({page}) => {
    // Perform UI actions
    await page.locator("#elementId").click();
    await wait(300);

    // Assert expected outcome
    const text = await page.locator("#result").textContent();
    expect(text).toContain("Expected");
  });
});
```

### Common Test Helpers Used

From `tests/helpers/test-helpers.js`:
- `waitForAppReady(page)` - Wait for app initialization
- `clearStorage(page)` - Clear localStorage/sessionStorage
- `wait(ms)` - Async delay
- `disablePostHog(page)` - Disable analytics in tests
- `mockAudioAPI(page)` - Mock audio for tests
- `setLocalStorage(page, key, value)` - Set storage value
- `getLocalStorage(page, key)` - Get storage value

## Known Testing Limitations

1. **Audio Testing**: Audio playback is mocked. Real audio testing requires manual verification.

2. **Drag and Drop**: Segment reordering via drag-and-drop is tested via button clicks (move up/down) rather than actual drag events.

3. **Timing Tests**: Segment timer tests use wait() with fixed durations. Tests may be flaky if system is slow.

4. **Popover API**: Tests assume native Popover API support. Fallback behavior not extensively tested.

5. **PostHog Analytics**: Analytics events are disabled in tests. Event tracking should be verified manually.

## Debugging Failed Tests

### Common Issues

1. **Timing Issues**
   - Symptoms: Test passes sometimes, fails other times
   - Solution: Increase wait() durations, use waitForSelector() with longer timeouts

2. **Element Not Found**
   - Symptoms: "Element not found" errors
   - Solution: Verify selectors match actual HTML, check if element is in popover (not rendered until opened)

3. **Storage Persistence**
   - Symptoms: Data not persisting between tests
   - Solution: Ensure clearStorage() is called in beforeEach, check localStorage keys

4. **Module Import Failures**
   - Symptoms: "Cannot find module" errors
   - Solution: Verify import paths are correct, check that module is exported properly

### Debug Tools

```bash
# Run with browser visible
npm test -- --headed

# Run with debug mode
npm test -- --debug

# Run with trace (generates trace files)
npm test -- --trace on

# Run specific test only
npm test tests/unit/plan-storage.test.js -g "should save a new plan"
```

### Debug Output in Tests

```javascript
test("should debug something", async ({page}) => {
  // Log to console
  const value = await page.evaluate(() => {
    console.log("Debug value:", someValue);
    return someValue;
  });

  console.log("Test received:", value);

  // Take screenshot on failure
  if (!condition) {
    await page.screenshot({ path: 'debug-screenshot.png' });
  }
});
```

## Maintenance Guidelines

### Adding New Tests

1. Follow existing test structure and naming conventions
2. Use descriptive test names that explain what is being tested
3. Group related tests in test.describe() blocks
4. Always clean up state in beforeEach hooks
5. Test both success and failure cases
6. Test edge cases (empty, null, invalid input)

### Updating Tests After Code Changes

1. **Breaking Changes**: Update all affected tests
2. **New Features**: Add corresponding tests
3. **Bug Fixes**: Add regression tests
4. **Refactoring**: Tests should still pass (if behavior unchanged)

### Test Naming Conventions

- Unit tests: `module-name.test.js`
- E2E tests: `feature-name.spec.js`
- Test groups: Use descriptive names with module/feature prefix
- Individual tests: Start with "should" (e.g., "should save plan correctly")

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Performance Considerations

- **Unit tests** typically run in 10-20 seconds
- **E2E tests** typically run in 2-5 minutes
- **Full suite** takes approximately 5-7 minutes

To optimize test performance:
- Run unit tests frequently during development
- Run E2E tests before commits
- Run full suite in CI/CD

## Related Documentation

- `/docs/features/workout-plan-system-implementation.md` - Full implementation spec
- `/docs/features/workout-plan-system-phase-3-4-implementation-summary.md` - Implementation summary
- `/docs/features/workout-plan-system-quick-reference.md` - Developer quick reference
- `/tests/README.md` - General testing guide

## Future Test Enhancements

1. **Visual Regression Tests**: Screenshot comparison for UI components
2. **Performance Tests**: Measure render times, memory usage
3. **Accessibility Tests**: Automated a11y audits
4. **Load Tests**: Test with large numbers of custom plans
5. **Cross-Browser Tests**: Test on Safari, Firefox, Edge
6. **Mobile Tests**: Test on various mobile devices/viewports
