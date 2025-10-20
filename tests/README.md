# CYCLE Workout Timer - Test Suite

Automated tests using Playwright for E2E and unit testing.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Debug tests
npm run test:debug
```

## Test Structure

```
tests/
├── e2e/           E2E tests for user workflows
├── unit/          Unit tests for modules/logic
└── helpers/       Test utilities and mock data
```

## Running Tests

| Command                | Description               |
|------------------------|---------------------------|
| `npm test`             | Run all tests             |
| `npm run test:ui`      | Interactive test UI       |
| `npm run test:debug`   | Debug mode                |
| `npm run test:headed`  | See browser during tests  |
| `npm run test:chrome`  | Run on Chrome only        |
| `npm run test:firefox` | Run on Firefox only       |
| `npm run test:webkit`  | Run on Safari only        |
| `npm run test:mobile`  | Run mobile viewport tests |

## Test Files

### E2E Tests

- `timer.spec.js` - Timer start/stop/pause/countdown
- `favorites.spec.js` - Add/remove/shuffle favorites
- `music.spec.js` - YouTube player & sound effects
- `ui-interactions.spec.js` - Buttons, modals, navigation
- `pwa.spec.js` - Service worker, offline, install

### Unit Tests

- `favorites.test.js` - Favorites module logic
- `timer.test.js` - Timer calculations
- `storage.test.js` - localStorage operations
- `audio.test.js` - Audio playback logic

## CI/CD

Tests run automatically on:

- Every push to `main`
- Every pull request
- Manual workflow dispatch

View results: GitHub Actions → Playwright Tests

## Documentation

See `docs/testing/automated-testing-guide.md` for complete documentation.

## Help

- [Playwright Docs](https://playwright.dev)
- [Testing Guide](../docs/testing/automated-testing-guide.md)
