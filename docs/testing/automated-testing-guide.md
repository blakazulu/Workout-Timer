# Automated Testing Guide for CYCLE Workout Timer

## Overview

This document provides a complete guide to the automated testing infrastructure for the CYCLE Workout Timer app.

**Date**: 2025-10-20
**Testing Framework**: Playwright
**Coverage**: E2E Tests + Unit Tests
**CI/CD**: GitHub Actions

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Test Coverage](#test-coverage)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

First, install Playwright and its dependencies:

```bash
npm install
npx playwright install
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Run specific browser:
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

Run mobile tests:
```bash
npm run test:mobile
```

Debug tests:
```bash
npm run test:debug
```

---

## Test Structure

```
tests/
├── e2e/                      # End-to-end tests
│   ├── timer.spec.js         # Timer functionality
│   ├── favorites.spec.js     # Favorites system
│   ├── music.spec.js         # Music/audio playback
│   ├── ui-interactions.spec.js  # UI components
│   └── pwa.spec.js           # PWA features
├── unit/                     # Unit tests
│   ├── favorites.test.js     # Favorites module logic
│   ├── timer.test.js         # Timer calculations
│   ├── storage.test.js       # localStorage operations
│   └── audio.test.js         # Audio module
└── helpers/                  # Test utilities
    ├── test-helpers.js       # Common functions
    └── fixtures.js           # Mock data
```

---

## Running Tests

### Local Development

**Run all tests:**
```bash
npm test
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/timer.spec.js
```

**Run specific test:**
```bash
npx playwright test -g "should start timer"
```

**Run with headed browser (see the browser):**
```bash
npm run test:headed
```

**Run with UI mode (interactive debugging):**
```bash
npm run test:ui
```

**Run and debug:**
```bash
npm run test:debug
```

### Browser-Specific Tests

Run tests on specific browsers:

```bash
npm run test:chrome    # Chromium
npm run test:firefox   # Firefox
npm run test:webkit    # Safari (WebKit)
```

### Mobile Testing

Test responsive behavior on mobile viewports:

```bash
npm run test:mobile
```

---

## Test Coverage

### E2E Tests (End-to-End)

#### Timer Tests (`timer.spec.js`)
- ✅ Display default timer values
- ✅ Start/pause/stop timer
- ✅ Timer countdown accuracy
- ✅ Phase transitions (work → rest)
- ✅ Set counter increments
- ✅ Session completion
- ✅ Background timer accuracy
- ✅ State persistence

#### Favorites Tests (`favorites.spec.js`)
- ✅ Add song to favorites
- ✅ Remove song from favorites
- ✅ Display favorites list
- ✅ Shuffle favorites
- ✅ Persistence across reloads
- ✅ Empty state handling
- ✅ Favorites count badge
- ✅ Rapid toggle handling

#### Music Tests (`music.spec.js`)
- ✅ YouTube player loading
- ✅ Play/pause controls
- ✅ Volume control
- ✅ Next track functionality
- ✅ Start sound effect
- ✅ Countdown sound effect
- ✅ Rest phase sound
- ✅ Completion sound
- ✅ Sound enable/disable
- ✅ Volume persistence

#### UI Interaction Tests (`ui-interactions.spec.js`)
- ✅ Settings panel open/close
- ✅ Library panel navigation
- ✅ Genre selector popup
- ✅ Mood selector popup
- ✅ Search functionality
- ✅ Toggle switches
- ✅ Timer duration settings
- ✅ Tab navigation
- ✅ Tooltips on hover
- ✅ Keyboard navigation
- ✅ Responsive layouts
- ✅ Rapid click handling

#### PWA Tests (`pwa.spec.js`)
- ✅ Service worker registration
- ✅ Web app manifest validity
- ✅ Offline functionality
- ✅ Install prompt
- ✅ localStorage persistence
- ✅ Service worker updates
- ✅ Cache management
- ✅ Icon sizes
- ✅ Wake lock implementation
- ✅ State restoration
- ✅ Theme color
- ✅ Network resilience

### Unit Tests

#### Favorites Module (`favorites.test.js`)
- ✅ Initialize empty list
- ✅ Add favorite
- ✅ Remove favorite
- ✅ Check if favorited
- ✅ Prevent duplicates
- ✅ Multiple favorites
- ✅ localStorage persistence
- ✅ Restore from storage
- ✅ Clear all favorites
- ✅ Invalid ID handling
- ✅ Order maintenance

#### Timer Module (`timer.test.js`)
- ✅ Total duration calculation
- ✅ Time formatting (MM:SS)
- ✅ Phase determination
- ✅ Progress percentage
- ✅ Countdown logic
- ✅ Phase transitions
- ✅ Set increments
- ✅ Completion detection
- ✅ Remaining time calculation
- ✅ Configuration validation
- ✅ Pause/resume state

#### Storage Module (`storage.test.js`)
- ✅ Save data
- ✅ Retrieve data
- ✅ Remove data
- ✅ Clear all data
- ✅ JSON serialization
- ✅ Quota handling
- ✅ Data versioning
- ✅ Missing keys handling
- ✅ Persistence across reloads
- ✅ Invalid JSON handling
- ✅ Key updates
- ✅ Special characters
- ✅ Storage usage calculation

#### Audio Module (`audio.test.js`)
- ✅ Create audio instance
- ✅ Play audio
- ✅ Pause audio
- ✅ Volume control
- ✅ Volume range validation
- ✅ Multiple instances
- ✅ Playback promises
- ✅ Audio preloading
- ✅ Source changes
- ✅ Different sound effects
- ✅ Stop all audio
- ✅ Mute state
- ✅ Sound timing
- ✅ Enable/disable setting
- ✅ Resource cleanup

---

## Writing Tests

### Test Helpers

Common helper functions are available in `tests/helpers/test-helpers.js`:

```javascript
import {
  waitForAppReady,
  clearStorage,
  setLocalStorage,
  getLocalStorage,
  mockYouTubeAPI,
  mockAudioAPI,
  disablePostHog,
  wait
} from '../helpers/test-helpers.js';
```

### Example E2E Test

```javascript
import { test, expect } from '@playwright/test';
import { waitForAppReady, clearStorage } from '../helpers/test-helpers.js';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await waitForAppReady(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('[data-testid="my-button"]');

    // Act
    await button.click();

    // Assert
    await expect(button).toHaveClass('active');
  });
});
```

### Example Unit Test

```javascript
import { test, expect } from '@playwright/test';

test.describe('Module Name - Unit Tests', () => {
  test('should perform calculation', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Test pure logic
      const add = (a, b) => a + b;
      return add(2, 3);
    });

    expect(result).toBe(5);
  });
});
```

### Mock Data

Use fixtures from `tests/helpers/fixtures.js`:

```javascript
import {
  MOCK_SONGS,
  MOCK_FAVORITES,
  MOCK_TIMER_CONFIG,
  SELECTORS
} from '../helpers/fixtures.js';
```

---

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Manual workflow dispatch

### Workflow Jobs

1. **test**: Run all tests on default browser (Chromium)
2. **test-browsers**: Run tests on Chrome, Firefox, and Safari in parallel
3. **test-mobile**: Run tests on mobile viewports

### Viewing Test Results

After tests run in CI:

1. Go to the "Actions" tab in GitHub
2. Click on the workflow run
3. View test results in the summary
4. Download artifacts:
   - `playwright-report` - HTML test report
   - `test-results` - Raw test results
   - `test-videos` - Video recordings (failures only)
   - `test-screenshots` - Screenshots (failures only)

### Preventing Broken Deployments

Tests must pass before merging PRs. Configure branch protection rules:

1. Go to Settings → Branches → Branch protection rules
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select "Playwright Tests" workflow

---

## Troubleshooting

### Tests Failing Locally

**Clear browser cache and storage:**
```bash
npx playwright test --clean
```

**Update Playwright:**
```bash
npm install @playwright/test@latest
npx playwright install
```

**Run with debug mode:**
```bash
npm run test:debug
```

### Slow Tests

**Run tests in parallel:**
```bash
npx playwright test --workers=4
```

**Run only affected tests:**
```bash
npx playwright test tests/e2e/timer.spec.js
```

### Flaky Tests

**Increase timeout:**
```javascript
test('my test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

**Add explicit waits:**
```javascript
await page.waitForSelector('.element', { state: 'visible' });
```

### CI Failures

**Check browser compatibility:**
- Ensure tests work on all browsers (Chrome, Firefox, Safari)
- Some features might not work in all browsers

**Check test artifacts:**
- Download screenshots and videos from failed runs
- Review the HTML report for detailed error messages

**Local CI simulation:**
```bash
# Set CI environment variable
CI=true npm test
```

---

## Best Practices

### 1. Use Data Attributes for Selectors

```html
<button data-testid="start-button">Start</button>
```

```javascript
const button = page.locator('[data-testid="start-button"]');
```

### 2. Wait for App to be Ready

Always wait for app initialization:

```javascript
await waitForAppReady(page);
```

### 3. Clean State Between Tests

```javascript
test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});
```

### 4. Mock External Dependencies

```javascript
await mockYouTubeAPI(page);
await mockAudioAPI(page);
await disablePostHog(page);
```

### 5. Use Descriptive Test Names

```javascript
test('should increment set counter after completing work and rest', async ({ page }) => {
  // ...
});
```

### 6. Test User Journeys, Not Implementation

Focus on what the user experiences, not internal implementation details.

### 7. Keep Tests Independent

Each test should be able to run in isolation without depending on other tests.

---

## Performance

### Test Execution Time

- **E2E Tests**: ~2-5 minutes (full suite)
- **Unit Tests**: ~30 seconds
- **CI Pipeline**: ~10-15 minutes (all browsers + mobile)

### Optimization Tips

1. **Run tests in parallel**: Use `--workers` flag
2. **Use test.skip**: Skip non-critical tests during development
3. **Focus on critical paths**: Prioritize important user flows
4. **Mock heavy operations**: Mock YouTube API, audio playback, etc.

---

## Maintenance

### When to Update Tests

- **Feature Changes**: Update tests when adding/modifying features
- **Bug Fixes**: Add regression tests for fixed bugs
- **Refactoring**: Update selectors if UI changes
- **Dependencies**: Update Playwright when new versions are released

### Test Health Monitoring

Monitor test health regularly:

1. **Pass Rate**: Should be >95%
2. **Flaky Tests**: Identify and fix flaky tests immediately
3. **Execution Time**: Keep tests fast (<5 minutes for full suite)
4. **Coverage**: Add tests for new features

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Testing Library Guide](https://testing-library.com/docs/guiding-principles)

---

## Support

For questions or issues:

1. Check this documentation
2. Review existing tests for examples
3. Check Playwright documentation
4. Open an issue on GitHub

---

## Summary

✅ **Automated testing is now set up!**

- Run `npm test` to verify everything works
- Tests run automatically on every push/PR
- Videos and screenshots captured on failures
- Comprehensive coverage of all features

**No more manual testing required!** 🎉
