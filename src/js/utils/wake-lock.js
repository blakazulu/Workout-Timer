/**
 * Wake Lock Utility - Prevents screen from locking during timer
 * Uses the Screen Wake Lock API to keep the screen active during workouts
 */

class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;

    // Re-acquire wake lock when page becomes visible again
    if (this.isSupported) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.wakeLock !== null) {
          this.request();
        }
      });
    }
  }

  /**
   * Check if Wake Lock API is supported
   * @returns {boolean}
   */
  get supported() {
    return this.isSupported;
  }

  /**
   * Request a wake lock to prevent screen from sleeping
   * @returns {Promise<boolean>} - True if wake lock was acquired
   */
  async request() {
    if (!this.isSupported) {
      console.warn('Wake Lock API is not supported in this browser');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');

      // Wake lock was released (e.g., due to tab switching)
      this.wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
      });

      console.log('Wake lock acquired - screen will stay on');
      return true;
    } catch (err) {
      // Wake lock request failed - usually because of browser permissions
      console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
      return false;
    }
  }

  /**
   * Release the wake lock to allow screen to sleep normally
   * @returns {Promise<void>}
   */
  async release() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake lock released - screen can sleep normally');
      } catch (err) {
        console.error(`Failed to release wake lock: ${err.name}, ${err.message}`);
      }
    }
  }

  /**
   * Check if wake lock is currently active
   * @returns {boolean}
   */
  get isActive() {
    return this.wakeLock !== null;
  }
}

// Singleton instance
let wakeLockManager = null;

/**
 * Get wake lock manager instance
 * @returns {WakeLockManager}
 */
export function getWakeLock() {
  if (!wakeLockManager) {
    wakeLockManager = new WakeLockManager();
  }
  return wakeLockManager;
}
