# Screen Wake Lock Implementation

**Date:** 2025-10-18
**Status:** ✅ Implemented

## Overview

Implemented the Screen Wake Lock API to prevent the device screen from automatically locking during active workout timer sessions. This is essential for workout apps where users need continuous visibility of the timer without manual interaction.

## Problem Statement

Users performing workouts with the timer running would experience:
- Screen auto-lock after device timeout period
- Interruption of workout flow
- Need to manually unlock device to check timer
- Poor user experience on mobile devices

## Solution

Implemented a wake lock management system using the Web Screen Wake Lock API:

### 1. Wake Lock Utility Module (`src/js/utils/wake-lock.js`)

Created a singleton `WakeLockManager` class that:
- Detects browser support for Wake Lock API
- Requests screen wake lock to prevent sleep
- Releases wake lock when not needed
- Automatically re-acquires lock when page regains visibility
- Provides graceful fallback for unsupported browsers

**Key Features:**
```javascript
class WakeLockManager {
  request()  // Acquire wake lock
  release()  // Release wake lock
  supported  // Check browser support
  isActive   // Check if currently locked
}
```

### 2. Timer Integration

Integrated wake lock into the timer lifecycle:

**When Timer Starts:**
- Requests wake lock to keep screen on
- Location: `timer.js:84`

**When Timer Pauses:**
- Releases wake lock to allow normal screen sleep
- Location: `timer.js:126`

**When Timer Stops/Resets:**
- Ensures wake lock is released
- Locations: `timer.js:161`, `timer.js:190`, `timer.js:226`

## Technical Details

### Browser Support
- Chrome/Edge 84+
- Safari 16.4+
- Firefox (behind flag, coming soon)

### Automatic Re-acquisition
The wake lock automatically re-acquires when:
- User switches back to the app tab
- Page becomes visible after being hidden
- Device wakes from sleep with timer still running

### Error Handling
- Graceful degradation for unsupported browsers
- Console warnings for debugging
- Continues timer operation even if wake lock fails

## Code Changes

### New Files
- `src/js/utils/wake-lock.js` - Wake lock management utility

### Modified Files
- `src/js/modules/timer.js` - Integrated wake lock requests/releases

## User Benefits

1. **Uninterrupted Workouts** - Screen stays on during timer
2. **Better Mobile Experience** - No need to touch screen to keep it awake
3. **Battery Conscious** - Only prevents sleep during active timer
4. **Automatic Cleanup** - Releases lock when timer paused/stopped

## Testing Recommendations

Users can test by:
1. Start a timer on mobile device
2. Wait for device's auto-lock timeout (usually 30s-2min)
3. Screen should stay on while timer is running
4. Pause timer - screen should lock normally after timeout
5. Resume timer - wake lock re-activates

## Browser Compatibility Note

For browsers without wake lock support, the app will continue to function normally but screen may auto-lock. Users can:
- Manually disable auto-lock in device settings
- Periodically tap screen to keep it awake
- Use supported browsers (Chrome/Safari recommended)

## Future Enhancements

Potential improvements:
- Settings toggle to enable/disable wake lock
- Visual indicator when wake lock is active
- Battery impact monitoring
- User notification for unsupported browsers
