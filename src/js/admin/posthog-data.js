/**
 * PostHog Data Fetcher Module
 * Fetches real analytics data from PostHog API
 */

/**
 * Check if PostHog is available and initialized
 */
export function isPostHogAvailable() {
  return typeof window.posthog !== 'undefined' && window.posthog !== null;
}

/**
 * Get PostHog distinct ID
 */
export function getDistinctId() {
  if (!isPostHogAvailable()) return null;
  return window.posthog.get_distinct_id();
}

/**
 * Fetch recent events from PostHog
 * Note: This requires PostHog backend integration or using the PostHog API directly
 * For now, we'll use PostHog's session replay and event capture
 */
export async function getRecentPostHogEvents(limit = 50) {
  if (!isPostHogAvailable()) {
    console.warn('[PostHog] PostHog not available');
    return [];
  }

  // In a real implementation, you would call the PostHog API
  // For now, we'll return mock structure that matches what PostHog tracks
  const events = [];

  // Get events from localStorage that PostHog has captured
  // Note: PostHog stores events in its own queue before sending
  try {
    const posthogQueue = localStorage.getItem('posthog_queue');
    if (posthogQueue) {
      const queueData = JSON.parse(posthogQueue);
      // PostHog queue format varies, this is illustrative
      console.log('[PostHog] Queue data available:', queueData);
    }
  } catch (error) {
    console.error('[PostHog] Error reading queue:', error);
  }

  return events;
}

/**
 * Get PostHog session metrics
 */
export function getSessionMetrics() {
  if (!isPostHogAvailable()) {
    return {
      sessionId: null,
      sessionStartTime: null,
      pageviewCount: 0,
      eventCount: 0
    };
  }

  return {
    sessionId: window.posthog.get_session_id?.() || null,
    distinctId: getDistinctId(),
    isIdentified: window.posthog.get_property?.('$is_identified') || false,
    deviceId: window.posthog.get_property?.('$device_id') || null
  };
}

/**
 * Get feature flags status
 */
export function getFeatureFlags() {
  if (!isPostHogAvailable()) return {};

  try {
    return window.posthog.getAllFlags?.() || {};
  } catch (error) {
    console.error('[PostHog] Error getting feature flags:', error);
    return {};
  }
}

/**
 * Get PostHog configuration
 */
export function getPostHogConfig() {
  if (!isPostHogAvailable()) return null;

  return {
    apiKey: window.posthog.config?.api_key || null,
    apiHost: window.posthog.config?.api_host || null,
    persistence: window.posthog.config?.persistence || 'localStorage',
    sessionRecording: window.posthog.sessionRecordingStarted?.() || false,
    autocapture: window.posthog.config?.autocapture !== false
  };
}

/**
 * Capture custom admin event
 */
export function captureAdminEvent(eventName, properties = {}) {
  if (!isPostHogAvailable()) return;

  window.posthog.capture(eventName, {
    ...properties,
    source: 'admin_dashboard',
    timestamp: new Date().toISOString()
  });
}

/**
 * Get comprehensive PostHog analytics data
 */
export function getPostHogAnalytics() {
  if (!isPostHogAvailable()) {
    return {
      available: false,
      status: 'Not Connected',
      reason: 'PostHog SDK not loaded'
    };
  }

  const config = getPostHogConfig();
  const session = getSessionMetrics();
  const flags = getFeatureFlags();

  return {
    available: true,
    status: 'Connected',
    config,
    session,
    featureFlags: flags,
    flagCount: Object.keys(flags).length,

    // Track what events we're capturing
    trackedEvents: [
      'session_started',
      'session_ended',
      'workout_started',
      'workout_reset',
      'rep_completed',
      'music_played',
      'music_paused',
      'favorite_removed',
      'app_visible',
      'app_hidden',
      '$pageview',
      '$web_vitals'
    ]
  };
}

/**
 * Export comprehensive analytics data
 */
export async function exportPostHogData() {
  const analytics = getPostHogAnalytics();

  return {
    exportDate: new Date().toISOString(),
    posthog: analytics,
    notes: 'For full event history, use PostHog dashboard'
  };
}

/**
 * Log admin dashboard view
 */
export function logDashboardView() {
  captureAdminEvent('admin_dashboard_viewed', {
    path: '/admin.html'
  });
}

/**
 * Log admin action
 */
export function logAdminAction(action, metadata = {}) {
  captureAdminEvent('admin_action', {
    action,
    ...metadata
  });
}
