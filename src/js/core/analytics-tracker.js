/**
 * Analytics Event Tracker
 *
 * Hooks into the event bus to automatically track user interactions
 * and app state changes for analytics purposes.
 *
 * @example
 * import { initAnalyticsTracking } from './core/analytics-tracker.js';
 *
 * // Initialize tracking after app loads
 * initAnalyticsTracking();
 */

import {eventBus} from "./event-bus.js";
import {analytics} from "./analytics.js";

/**
 * Event mapping configuration
 * Maps internal event bus events to analytics events with property transformations
 */
const EVENT_MAPPINGS = {
  // Timer events
  "timer:started": {
    analyticsEvent: "workout_started",
    getProperties: (data) => ({
      duration: data?.duration,
      repetitions: data?.repetitions,
      rest_time: data?.restTime,
      has_music: !!data?.hasMusic,
    }),
  },
  "timer:paused": {
    analyticsEvent: "workout_paused",
    getProperties: (data) => ({
      current_rep: data?.currentRep,
      time_remaining: data?.timeRemaining,
    }),
  },
  "timer:resumed": {
    analyticsEvent: "workout_resumed",
    getProperties: (data) => ({
      current_rep: data?.currentRep,
      time_remaining: data?.timeRemaining,
    }),
  },
  "timer:completed": {
    analyticsEvent: "workout_completed",
    getProperties: (data) => ({
      duration: data?.duration,
      repetitions: data?.repetitions,
      completion_time: data?.completionTime,
    }),
  },
  "timer:reset": {
    analyticsEvent: "workout_reset",
    getProperties: (data) => ({
      was_running: data?.wasRunning,
      current_rep: data?.currentRep,
    }),
  },
  "timer:rep_completed": {
    analyticsEvent: "rep_completed",
    getProperties: (data) => ({
      rep_number: data?.repNumber,
      total_reps: data?.totalReps,
    }),
  },

  // Sound events
  "sound:rest_end": {
    analyticsEvent: "sound_rest_end_played",
    getProperties: (data) => ({
      rep_number: data?.repNumber,
      total_reps: data?.totalReps,
    }),
  },
  "sound:round_end": {
    analyticsEvent: "sound_round_end_played",
    getProperties: (data) => ({
      rep_number: data?.repNumber,
      total_reps: data?.totalReps,
    }),
  },
  "sound:workout_over": {
    analyticsEvent: "sound_workout_over_played",
    getProperties: (data) => ({
      duration: data?.duration,
      repetitions: data?.repetitions,
    }),
  },

  // Music events
  "music:played": {
    analyticsEvent: "music_played",
    getProperties: (data) => ({
      mode: data?.mode, // 'mood' or 'genre'
      selection: data?.selection,
      video_id: data?.videoId,
    }),
  },
  "music:paused": {
    analyticsEvent: "music_paused",
    getProperties: (data) => ({
      video_id: data?.videoId,
    }),
  },
  "music:stopped": {
    analyticsEvent: "music_stopped",
    getProperties: (data) => ({
      video_id: data?.videoId,
    }),
  },
  "music:mode_changed": {
    analyticsEvent: "music_mode_changed",
    getProperties: (data) => ({
      from_mode: data?.fromMode,
      to_mode: data?.toMode,
    }),
  },
  "music:genre_selected": {
    analyticsEvent: "genre_selected",
    getProperties: (data) => ({
      genre: data?.genre,
    }),
  },
  "music:mood_selected": {
    analyticsEvent: "mood_selected",
    getProperties: (data) => ({
      mood: data?.mood,
    }),
  },

  // Favorites events
  "favorite:added": {
    analyticsEvent: "favorite_added",
    getProperties: (data) => ({
      video_id: data?.videoId,
      title: data?.title,
      total_favorites: data?.totalFavorites,
    }),
  },
  "favorite:removed": {
    analyticsEvent: "favorite_removed",
    getProperties: (data) => ({
      video_id: data?.videoId,
      total_favorites: data?.totalFavorites,
    }),
  },
  "favorite:shuffled": {
    analyticsEvent: "favorites_shuffled",
    getProperties: (data) => ({
      total_favorites: data?.totalFavorites,
    }),
  },
  "favorite:random_played": {
    analyticsEvent: "random_favorite_played",
    getProperties: (data) => ({
      video_id: data?.videoId,
    }),
  },

  // UI events
  "ui:library_opened": {
    analyticsEvent: "library_opened",
    getProperties: (data) => ({
      has_history: data?.hasHistory,
    }),
  },
  "ui:library_closed": {
    analyticsEvent: "library_closed",
  },
  "ui:search_opened": {
    analyticsEvent: "search_opened",
  },
  "ui:search_performed": {
    analyticsEvent: "search_performed",
    getProperties: (data) => ({
      query_length: data?.query?.length,
      results_count: data?.resultsCount,
    }),
  },
  "ui:settings_opened": {
    analyticsEvent: "settings_opened",
  },

  // Settings events
  "settings:changed": {
    analyticsEvent: "setting_changed",
    getProperties: (data) => ({
      setting_name: data?.settingName,
      new_value: data?.newValue,
    }),
  },
};

/**
 * Track app state changes
 */
function trackStateChanges() {
  // Listen to all state changes
  eventBus.on("state:changed", ({path, value, oldValue}) => {
    // Track important state changes
    if (path === "music.mode") {
      analytics.track("music_mode_changed", {
        from_mode: oldValue,
        to_mode: value,
      });
    }

    if (path === "settings.soundEnabled") {
      analytics.track("setting_changed", {
        setting_name: "sound_enabled",
        new_value: value,
      });
    }

    if (path === "settings.autoplay") {
      analytics.track("setting_changed", {
        setting_name: "autoplay",
        new_value: value,
      });
    }
  });
}

/**
 * Track session metrics
 */
function trackSessionMetrics() {
  // Track session start
  analytics.track("session_started", {
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  });

  // Track session duration on page unload
  let sessionStartTime = Date.now();

  window.addEventListener("beforeunload", () => {
    const sessionDuration = Date.now() - sessionStartTime;

    analytics.track("session_ended", {
      duration_ms: sessionDuration,
      duration_minutes: Math.round(sessionDuration / 1000 / 60),
    });
  });

  // Track visibility changes (user switching tabs)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      analytics.track("app_hidden");
    } else {
      analytics.track("app_visible");
    }
  });
}

/**
 * Track PWA installation
 */
function trackPWAInstallation() {
  // Track PWA install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    analytics.track("pwa_install_prompt_shown");
  });

  // Track successful PWA installation
  window.addEventListener("appinstalled", () => {
    analytics.track("pwa_installed", {
      timestamp: Date.now(),
    });
  });

  // Check if app is running in standalone mode (already installed)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    analytics.track("pwa_launched", {
      is_standalone: true,
    });
  }
}

/**
 * Initialize analytics tracking
 * Sets up event listeners and begins tracking user interactions
 */
export function initAnalyticsTracking() {
  if (!analytics.isEnabled()) {
    console.log("[Analytics Tracker] Analytics disabled, skipping tracking setup");
    return;
  }

  // Set up event bus listeners
  Object.entries(EVENT_MAPPINGS).forEach(([eventName, config]) => {
    eventBus.on(eventName, (data) => {
      const properties = config.getProperties ? config.getProperties(data) : {};

      analytics.track(config.analyticsEvent, properties);
    });
  });

  // Track state changes
  trackStateChanges();

  // Track session metrics
  trackSessionMetrics();

  // Track PWA installation
  trackPWAInstallation();

  // Track initial page view
  analytics.trackPageView("app_home");

  console.log("[Analytics Tracker] Tracking initialized");
}

/**
 * Helper function to manually track an event
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export function trackEvent(eventName, properties = {}) {
  analytics.track(eventName, properties);
}

/**
 * Helper function to track feature usage
 * @param {string} featureName - Name of the feature
 * @param {Object} metadata - Additional metadata
 */
export function trackFeatureUsage(featureName, metadata = {}) {
  analytics.track("feature_used", {
    feature_name: featureName,
    ...metadata,
  });
}
