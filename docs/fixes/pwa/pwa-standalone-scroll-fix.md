# PWA Standalone Mode Scroll Fix

## Issue

When the app is installed as a PWA (Progressive Web App) on mobile devices, unwanted scrolling occurs in the button
area. This issue does NOT appear when viewing the app in a regular browser tab - only in standalone PWA mode.

## Date

2025-10-13

## Root Causes

1. PWA standalone mode handles viewport differently than browser tabs
2. Missing viewport constraints for scaling
3. Body overflow not properly constrained in standalone mode
4. Container height calculation exceeding viewport in PWA mode

## Solution Implemented

### 1. Enhanced Viewport Meta Tag

Updated in `index.html`:

- Added `maximum-scale=1.0` to prevent zoom
- Added `user-scalable=no` to disable pinch-zoom
- Keeps `viewport-fit=cover` for safe area handling

### 2. PWA-Specific CSS Rules

Added to `src/css/global.css`:

- `@media (display-mode: standalone)` queries for PWA detection
- Fixed positioning for body and container in standalone mode
- Overflow hidden with `!important` flags for PWA mode
- Proper height constraints using both vh and dvh units

### 3. JavaScript PWA Detection

Added to `src/js/app.js`:

- Detects standalone mode on initialization
- Adds `pwa-standalone` class to body
- Enables targeted CSS rules for installed apps

### 4. Mobile PWA-Specific Layout

- Body: Fixed position with overflow hidden
- Container: Fixed height at 100% viewport
- App-content: Scrollable with webkit-overflow-scrolling
- Footer: Flex-shrink to prevent expansion

## Files Modified

- `/index.html` - Enhanced viewport meta tag
- `/src/css/global.css` - Added PWA-specific styles and media queries
- `/src/js/app.js` - Added PWA detection on init

## Key CSS Classes Added

- `.pwa-standalone` - Applied when app runs in standalone mode
- `@media (display-mode: standalone)` - CSS-only PWA detection
- Combined mobile + standalone media queries for specific fixes

## Testing Notes

- Test on actual installed PWA (not just browser)
- Install app via "Add to Home Screen" on mobile
- Verify no scrolling in button area
- Check that content area still scrolls if needed
- Test on both iOS and Android PWAs

## Platform Differences

- **iOS Safari PWA**: Uses `window.navigator.standalone`
- **Android Chrome PWA**: Uses `display-mode: standalone` media query
- Both are detected and handled

## Result

The installed PWA now properly constrains the viewport, preventing any unwanted scrolling in the button container area.
The fix specifically targets standalone mode without affecting the regular browser experience.
