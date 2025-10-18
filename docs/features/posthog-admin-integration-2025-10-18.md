# PostHog Admin Dashboard Integration

**Date:** 2025-10-18
**Status:** ✅ Complete

## Overview

Integrated real PostHog analytics data into the admin dashboard, replacing mock data with actual tracking information from the PostHog SDK.

---

## Features Implemented

### 1. PostHog Data Fetcher Module

Created `src/js/admin/posthog-data.js` to interface with PostHog SDK:

#### Core Functions

**Connection Status:**
```javascript
isPostHogAvailable()  // Check if PostHog SDK is loaded
getDistinctId()       // Get user's distinct ID
```

**Session Metrics:**
```javascript
getSessionMetrics()   // Returns current session info
{
  sessionId: string,
  distinctId: string,
  isIdentified: boolean,
  deviceId: string
}
```

**Configuration:**
```javascript
getPostHogConfig()    // Get PostHog configuration
{
  apiKey: string,
  apiHost: string,
  persistence: string,
  sessionRecording: boolean,
  autocapture: boolean
}
```

**Feature Flags:**
```javascript
getFeatureFlags()     // Get all active feature flags
getAllFlags()         // Returns object of all flags
```

**Event Tracking:**
```javascript
captureAdminEvent(eventName, properties)  // Capture custom events
logDashboardView()                        // Log dashboard view
logAdminAction(action, metadata)          // Log admin actions
```

**Comprehensive Analytics:**
```javascript
getPostHogAnalytics() // Get all analytics data
{
  available: boolean,
  status: string,
  config: object,
  session: object,
  featureFlags: object,
  flagCount: number,
  trackedEvents: array
}
```

### 2. Dashboard Integration

#### PostHog Panel Display

Shows real-time PostHog connection status with:

**When Connected:**
- ✅ Status: "Connected" (green)
- Session ID (truncated for display)
- Session Recording status (Active/Inactive)
- Number of tracked event types (12 events)

**When Disconnected:**
- ⚠️ Status: "Not Connected"
- Reason for disconnection
- Offline indicator

#### Tracked Events

The dashboard now tracks these PostHog events:
1. `session_started` - User starts workout session
2. `session_ended` - User completes/exits session
3. `workout_started` - Workout timer begins
4. `workout_reset` - Timer reset
5. `rep_completed` - Exercise rep completed
6. `music_played` - Music playback started
7. `music_paused` - Music paused
8. `favorite_removed` - Song unfavorited
9. `app_visible` - App becomes visible
10. `app_hidden` - App goes to background
11. `$pageview` - Page views (automatic)
12. `$web_vitals` - Performance metrics (automatic)

### 3. Admin Event Tracking

All admin dashboard actions are now logged to PostHog:

```javascript
// Dashboard view
admin_dashboard_viewed { path: '/admin.html' }

// User actions
admin_action {
  action: 'export_data' | 'clear_data' | 'open_posthog_dashboard',
  source: 'admin_dashboard',
  timestamp: ISO8601
}
```

---

## Technical Implementation

### File Structure

```
src/js/admin/
├── posthog-data.js         # New PostHog data fetcher (180 lines)
├── admin-dashboard.js      # Updated with PostHog integration
└── main.js                 # Entry point (unchanged)
```

### Integration Points

**1. Dashboard Initialization** (admin-dashboard.js:29)
```javascript
export function initDashboard() {
  posthogData.logDashboardView();  // Log view on load
  // ... rest of initialization
}
```

**2. PostHog Panel Rendering** (admin-dashboard.js:705)
```javascript
function renderPostHogPanel() {
  const analytics = posthogData.getPostHogAnalytics();
  // Display real connection status and session info
}
```

**3. Event Listeners** (admin-dashboard.js:810, 818, 829)
```javascript
// Export button
exportBtn.addEventListener('click', () => {
  posthogData.logAdminAction('export_data');
  exportDashboardData();
});

// PostHog link button
posthogBtn.addEventListener('click', () => {
  posthogData.logAdminAction('open_posthog_dashboard');
  window.open('https://app.posthog.com', '_blank');
});

// Clear button
clearBtn.addEventListener('click', () => {
  posthogData.logAdminAction('clear_data');
  clearDashboardData();
});
```

---

## Display Examples

### PostHog Panel - Connected State

```
┌─────────────────────────────────┐
│ 🟢 PostHog          Connected   │
├─────────────────────────────────┤
│ Status         Connected ✓      │
│ Session ID     01JAFH8N...      │
│ Recording      Active ✓         │
│ Tracked Events 12 types         │
└─────────────────────────────────┘
```

### PostHog Panel - Disconnected State

```
┌─────────────────────────────────┐
│ 🔴 PostHog      Not Connected   │
├─────────────────────────────────┤
│        ⚠️                       │
│   PostHog SDK not loaded        │
└─────────────────────────────────┘
```

---

## Benefits

### Real-Time Analytics
- ✅ Live session tracking
- ✅ Real user identification
- ✅ Actual feature flag status
- ✅ Session recording status

### Admin Action Tracking
- ✅ Track all admin interactions
- ✅ Monitor data exports
- ✅ Log dashboard usage
- ✅ Audit data clearing

### Better Insights
- ✅ See actual PostHog configuration
- ✅ Verify event tracking is working
- ✅ Confirm session recording
- ✅ Monitor feature flag deployment

---

## Usage

### Accessing PostHog Data

```javascript
import * as posthogData from './posthog-data.js';

// Check if PostHog is available
if (posthogData.isPostHogAvailable()) {
  // Get session info
  const session = posthogData.getSessionMetrics();
  console.log('Session ID:', session.sessionId);

  // Get feature flags
  const flags = posthogData.getFeatureFlags();
  console.log('Active flags:', flags);

  // Capture custom event
  posthogData.captureAdminEvent('custom_event', {
    customProperty: 'value'
  });
}
```

### Viewing in PostHog Dashboard

1. Click "Open PostHog" button in admin dashboard
2. Navigate to Events → All Events
3. Filter by `admin_` prefix to see admin events
4. View session recordings for admin sessions

---

## Event Schema

### admin_dashboard_viewed
```javascript
{
  event: 'admin_dashboard_viewed',
  properties: {
    path: '/admin.html',
    source: 'admin_dashboard',
    timestamp: '2025-10-18T...'
  }
}
```

### admin_action
```javascript
{
  event: 'admin_action',
  properties: {
    action: 'export_data',
    source: 'admin_dashboard',
    timestamp: '2025-10-18T...',
    // ... additional metadata
  }
}
```

---

## Future Enhancements

### Possible Additions

- [ ] Display recent PostHog events in activity feed
- [ ] Show feature flag values in dashboard
- [ ] Display session recording links
- [ ] Show cohort membership
- [ ] Display A/B test participation
- [ ] Real-time event stream
- [ ] Historical event charts from PostHog API

### PostHog API Integration

For more advanced features, integrate with PostHog API:

```javascript
// Example: Fetch recent events from PostHog API
async function fetchRecentEvents() {
  const response = await fetch('https://app.posthog.com/api/event/', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  return await response.json();
}
```

---

## Troubleshooting

### PostHog Not Connected

**Symptoms:** Red status indicator, "Not Connected" message

**Possible Causes:**
1. PostHog SDK not loaded
2. PostHog blocked by ad blocker
3. PostHog initialization failed
4. User opted out of analytics

**Solutions:**
1. Check browser console for errors
2. Verify PostHog script tag in index.html
3. Disable ad blockers
4. Check `analytics_opt_out` in localStorage

### Session ID Not Showing

**Cause:** PostHog session not started yet

**Solution:** Trigger a pageview or event to start session

### Recording Not Active

**Cause:** Session recording not enabled in PostHog config

**Solution:** Enable in PostHog project settings

---

## Security Considerations

### Data Privacy

- ✅ Respects user's analytics opt-out preference
- ✅ No PII captured without consent
- ✅ Admin events tagged with `source: 'admin_dashboard'`
- ✅ Session IDs truncated in display

### Access Control

- 🔒 Admin dashboard requires password authentication
- 🔒 PostHog API key not exposed to client
- 🔒 Admin actions logged for audit trail

---

## Performance Impact

- **PostHog Module:** ~180 lines, ~6KB
- **Dashboard Updates:** Minimal, uses existing PostHog SDK
- **Event Tracking:** Async, non-blocking
- **Panel Rendering:** <1ms, refreshes every 30s

---

## Summary

The admin dashboard now has real-time PostHog integration showing:
- ✅ Live connection status
- ✅ Current session information
- ✅ Recording status
- ✅ Tracked event types
- ✅ Admin action logging

All admin interactions are tracked, providing valuable insights into how the admin dashboard is being used and ensuring proper audit trails for data operations.
