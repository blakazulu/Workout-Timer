/**
 * Analytics Module - PostHog Integration
 *
 * Privacy-focused analytics implementation that tracks user engagement
 * while respecting privacy. Anonymous by default, GDPR compliant.
 *
 * @example
 * import { analytics } from './core/analytics.js';
 *
 * // Track an event
 * analytics.track('workout_started', { duration: 30, reps: 3 });
 *
 * // Track page view
 * analytics.trackPageView();
 */

import posthog from 'posthog-js';

class Analytics {
  constructor() {
    this.initialized = false;
    this.enabled = true;
    this.debugMode = false;
  }

  /**
   * Initialize PostHog analytics
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - PostHog API key (starts with 'phc_')
   * @param {string} [config.apiHost] - PostHog API host (default: https://app.posthog.com)
   * @param {boolean} [config.debug] - Enable debug mode
   */
  init(config = {}) {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    // Allow user to opt-out via localStorage
    const hasOptedOut = localStorage.getItem('analytics_opt_out') === 'true';
    if (hasOptedOut) {
      console.log('[Analytics] User has opted out');
      this.enabled = false;
      return;
    }

    // PostHog API key from environment or config
    const apiKey = config.apiKey || import.meta.env.VITE_POSTHOG_KEY;

    if (!apiKey) {
      console.warn('[Analytics] No API key provided - analytics disabled');
      this.enabled = false;
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host: config.apiHost || 'https://app.posthog.com',

        // Privacy-focused settings
        persistence: 'localStorage', // Use localStorage instead of cookies
        autocapture: false, // Disable automatic event capture for more control
        capture_pageview: false, // Manual page view tracking
        disable_session_recording: true, // No session recordings by default

        // GDPR compliance
        opt_out_capturing_by_default: false,
        respect_dnt: true, // Respect Do Not Track browser setting

        // Performance
        loaded: (posthog) => {
          if (config.debug) {
            posthog.debug();
          }
        },
      });

      this.initialized = true;
      this.debugMode = config.debug || false;

      if (this.debugMode) {
        console.log('[Analytics] PostHog initialized successfully');
      }
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
      this.enabled = false;
    }
  }

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.enabled || !this.initialized) {
      if (this.debugMode) {
        console.log(`[Analytics] Track (disabled): ${eventName}`, properties);
      }
      return;
    }

    try {
      posthog.capture(eventName, properties);

      if (this.debugMode) {
        console.log(`[Analytics] Tracked: ${eventName}`, properties);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }

  /**
   * Track a page view
   * @param {string} [pageName] - Optional page name
   */
  trackPageView(pageName) {
    if (!this.enabled || !this.initialized) return;

    try {
      posthog.capture('$pageview', {
        page: pageName || window.location.pathname,
      });

      if (this.debugMode) {
        console.log(`[Analytics] Page view: ${pageName || 'current page'}`);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error);
    }
  }

  /**
   * Identify a user (anonymous by default)
   * @param {string} userId - User identifier
   * @param {Object} properties - User properties
   */
  identify(userId, properties = {}) {
    if (!this.enabled || !this.initialized) return;

    try {
      posthog.identify(userId, properties);

      if (this.debugMode) {
        console.log(`[Analytics] Identified user: ${userId}`, properties);
      }
    } catch (error) {
      console.error('[Analytics] Error identifying user:', error);
    }
  }

  /**
   * Set user properties
   * @param {Object} properties - Properties to set
   */
  setUserProperties(properties) {
    if (!this.enabled || !this.initialized) return;

    try {
      posthog.people.set(properties);

      if (this.debugMode) {
        console.log('[Analytics] Set user properties:', properties);
      }
    } catch (error) {
      console.error('[Analytics] Error setting user properties:', error);
    }
  }

  /**
   * Reset analytics (for logout scenarios)
   */
  reset() {
    if (!this.enabled || !this.initialized) return;

    try {
      posthog.reset();

      if (this.debugMode) {
        console.log('[Analytics] Reset');
      }
    } catch (error) {
      console.error('[Analytics] Error resetting:', error);
    }
  }

  /**
   * Allow user to opt out of analytics
   */
  optOut() {
    localStorage.setItem('analytics_opt_out', 'true');
    this.enabled = false;

    if (this.initialized) {
      posthog.opt_out_capturing();
    }

    console.log('[Analytics] User opted out');
  }

  /**
   * Allow user to opt in to analytics
   */
  optIn() {
    localStorage.removeItem('analytics_opt_out');
    this.enabled = true;

    if (this.initialized) {
      posthog.opt_in_capturing();
    }

    console.log('[Analytics] User opted in');
  }

  /**
   * Check if analytics is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled && this.initialized;
  }

  /**
   * Enable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`[Analytics] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Also export the class for testing purposes
export { Analytics };
