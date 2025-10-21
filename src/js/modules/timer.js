/**
 * Timer Module - Core workout timer logic
 */

import {$, addClass, removeClass} from "../utils/dom.js";
import {formatTime} from "../utils/time.js";
import {getAudio} from "./audio.js";
import {eventBus} from "../core/event-bus.js";
import {getWakeLock} from "../utils/wake-lock.js";

export class Timer {
  constructor(options = {}) {
    this.duration = options.duration || 30;
    this.alertTime = options.alertTime || 3;
    this.repetitions = options.repetitions || 3;
    this.restTime = options.restTime || 10;
    this.currentTime = 0;
    this.currentRep = 1;
    this.isRunning = false;
    this.isResting = false;
    this.interval = null;
    this.youtube = null;
    this.isAlertActive = false;
    this.normalVolume = 100;
    this.transitionInProgress = false; // Prevent duplicate transition calls

    // Timestamp-based tracking for accurate timing even when screen is locked
    this.startTimestamp = null;
    this.targetEndTime = null;
    this.lastAlertSecond = null; // Track which second we last played alert for

    // iOS-specific optimizations
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.backgroundStartTime = null; // Track when page went to background
    this.missedAlerts = []; // Track alerts that happened during background

    // Debug mode
    this.debugMode = localStorage.getItem("timer_debug") === "true";

    if (this.debugMode && this.isIOS) {
      console.log('[Timer] iOS detected - using enhanced background handling');
    }

    // DOM elements
    this.timerDisplay = $("#timerDisplay");
    this.timerValue = $("#timerValue");
    this.repCounter = $("#repCounter");
    this.startBtn = $("#startBtn");
    this.resetBtn = $("#resetBtn");
    this.clearAllBtn = $("#clearAllBtn");
    this.settings = $("#settings");
    this.youtubeSection = $(".youtube-section");

    // Audio manager
    this.audio = getAudio();

    // Wake lock manager to prevent screen from sleeping
    this.wakeLock = getWakeLock();

    // Bind visibility change handler to sync timer when page becomes visible
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Cleanup wake lock on page unload
    window.addEventListener("beforeunload", () => {
      if (this.wakeLock) {
        this.wakeLock.release();
      }
    });
  }

  /**
   * Set YouTube player instance
   * @param {Object} youtubePlayer - YouTube player instance
   */
  setYouTubePlayer(youtubePlayer) {
    this.youtube = youtubePlayer;
  }

  /**
   * Handle visibility change - sync timer when page becomes visible
   * This ensures timer stays accurate even when screen is locked
   */
  handleVisibilityChange() {
    if (document.visibilityState === "visible" && this.isRunning) {
      if (this.debugMode) {
        const backgroundDuration = this.backgroundStartTime
          ? (Date.now() - this.backgroundStartTime) / 1000
          : 0;
        console.log(`[Timer] Page visible - was in background for ${backgroundDuration.toFixed(1)}s`);
      }

      // Recalculate current time based on actual elapsed time
      this.syncTimeFromTimestamp();

      // iOS: Play any missed alerts/sounds that occurred during background
      if (this.isIOS && this.missedAlerts.length > 0) {
        if (this.debugMode) {
          console.log(`[Timer] iOS: Playing ${this.missedAlerts.length} missed alerts`);
        }

        // Play missed sounds (limited to most recent to avoid spam)
        const recentMissed = this.missedAlerts.slice(-3); // Last 3 only
        recentMissed.forEach(alert => {
          if (alert.type === 'alert') {
            this.audio.playAlert();
          } else if (alert.type === 'complete') {
            this.audio.playComplete();
          }
        });

        this.missedAlerts = [];
      }

      // iOS: Re-acquire wake lock if needed (iOS may have released it)
      if (this.isIOS && this.wakeLock) {
        this.wakeLock.request();
      }

      this.backgroundStartTime = null;
    } else if (document.visibilityState === "hidden" && this.isRunning) {
      // Track when page went to background
      this.backgroundStartTime = Date.now();

      if (this.debugMode) {
        console.log('[Timer] Page hidden - tracking background time');
      }
    }
  }

  /**
   * Sync currentTime based on timestamp (handles background/locked screen)
   */
  syncTimeFromTimestamp() {
    if (!this.targetEndTime) return;

    const now = Date.now();
    const remainingMs = this.targetEndTime - now;
    const newCurrentTime = Math.max(0, Math.ceil(remainingMs / 1000));

    this.currentTime = newCurrentTime;
    this.updateDisplay();

    // If time expired while screen was locked, handle transitions
    if (this.currentTime === 0) {
      this.handleTimerComplete();
    }
  }

  /**
   * Start or resume the timer
   */
  start() {
    if (!this.isRunning) {
      // Read settings from input fields
      this.duration = parseInt($("#duration").value);
      this.alertTime = parseInt($("#alertTime").value);
      this.repetitions = parseInt($("#repetitions").value);
      this.restTime = parseInt($("#restTime").value);

      // Validate alert time doesn't exceed duration
      if (this.alertTime > this.duration) {
        this.alertTime = this.duration;
        $("#alertTime").value = this.alertTime;
      }

      // Track if this is a fresh start or resume
      const isFreshStart = !this.currentTime;

      // Initialize timer if starting fresh
      if (isFreshStart) {
        this.currentTime = this.duration;
        this.currentRep = 1;
        this.isResting = false;
      }

      // Set timestamp for accurate timing
      const now = Date.now();
      this.startTimestamp = now;
      this.targetEndTime = now + (this.currentTime * 1000);
      this.lastAlertSecond = null;

      this.isRunning = true;
      this.updateDisplay(); // Update display immediately to show full duration
      this.interval = setInterval(() => this.tick(), 1000);
      this.startBtn.textContent = "PAUSE";
      addClass(this.settings, "hidden");
      addClass(this.youtubeSection, "hidden");
      removeClass(this.timerDisplay, "hidden");

      // Prevent body scrolling on mobile when timer is active
      document.body.classList.add("timer-active");

      // Prevent screen from locking during workout
      this.wakeLock.request();

      // Show NEW TIMER and CLEAR ALL buttons when timer is active
      if (this.resetBtn) removeClass(this.resetBtn, "hidden");
      if (this.clearAllBtn) removeClass(this.clearAllBtn, "hidden");

      // Play YouTube video if loaded
      if (this.youtube) {
        this.youtube.play();
      }

      // Emit analytics event
      if (isFreshStart) {
        eventBus.emit("timer:started", {
          duration: this.duration,
          repetitions: this.repetitions,
          restTime: this.restTime,
          hasMusic: !!this.youtube,
        });
      } else {
        eventBus.emit("timer:resumed", {
          currentRep: this.currentRep,
          timeRemaining: this.currentTime,
        });
      }
    } else {
      this.pause();
    }
  }

  /**
   * Pause the timer
   */
  pause() {
    clearInterval(this.interval);
    this.isRunning = false;
    this.startBtn.textContent = "RESUME";

    // Clear timestamps
    this.startTimestamp = null;
    this.targetEndTime = null;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Release wake lock when paused
    this.wakeLock.release();

    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume);
    }
    this.isAlertActive = false;

    // Pause YouTube video if loaded
    if (this.youtube) {
      this.youtube.pause();
    }

    // Emit analytics event
    eventBus.emit("timer:paused", {
      currentRep: this.currentRep,
      timeRemaining: this.currentTime,
    });
  }

  /**
   * Stop the timer completely
   */
  stop() {
    clearInterval(this.interval);
    this.isRunning = false;
    this.startBtn.textContent = "START";
    removeClass(this.settings, "hidden");
    removeClass(this.youtubeSection, "hidden");
    addClass(this.timerDisplay, "hidden");

    // Clear timestamps
    this.startTimestamp = null;
    this.targetEndTime = null;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Release wake lock when stopped
    this.wakeLock.release();

    // Hide NEW TIMER and CLEAR ALL buttons when returning to home
    if (this.resetBtn) addClass(this.resetBtn, "hidden");
    if (this.clearAllBtn) addClass(this.clearAllBtn, "hidden");

    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume);
    }
    this.isAlertActive = false;
  }

  /**
   * Reset the timer to initial state
   */
  reset() {
    const wasRunning = this.isRunning;
    const currentRep = this.currentRep;

    this.stop();
    this.currentTime = 0;
    this.currentRep = 1;
    this.isResting = false;

    // Clear timestamps
    this.startTimestamp = null;
    this.targetEndTime = null;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Ensure wake lock is released
    this.wakeLock.release();

    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume);
    }
    this.isAlertActive = false;

    this.updateDisplay();
    addClass(this.timerDisplay, "hidden");

    // Stop YouTube video if loaded
    if (this.youtube) {
      this.youtube.stop();
    }

    // Emit analytics event
    eventBus.emit("timer:reset", {
      wasRunning,
      currentRep,
    });
  }

  /**
   * Start a new timer session while keeping music playing
   */
  newTimer() {
    this.stop();
    this.currentTime = 0;
    this.currentRep = 1;
    this.isResting = false;

    // Clear timestamps
    this.startTimestamp = null;
    this.targetEndTime = null;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Ensure wake lock is released
    this.wakeLock.release();

    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume);
    }
    this.isAlertActive = false;

    this.updateDisplay();
    addClass(this.timerDisplay, "hidden");

    // Keep YouTube music playing (don't stop it)
  }

  /**
   * Clear everything including music
   */
  clearAll() {
    // Reset timer state and stop music
    this.reset();

    // Clear YouTube player completely
    if (this.youtube) {
      this.youtube.clear();
    }

    // Clear YouTube URL input field
    const youtubeUrl = $("#youtubeUrl");
    if (youtubeUrl) {
      youtubeUrl.value = "";
    }
  }

  /**
   * Timer tick - called every second
   * Uses timestamp-based calculation for accuracy even when screen is locked
   */
  tick() {
    const tickStart = performance.now();

    // Sync current time from timestamp for accuracy
    this.syncTimeFromTimestamp();

    // Play alert beep during countdown (both work and rest)
    // Play on 3, 2, 1 - then transition sound plays at 0
    // Only play once per second to avoid duplicates
    if (this.currentTime <= this.alertTime && this.currentTime > 0) {
      if (this.lastAlertSecond !== this.currentTime) {
        // iOS: Track missed alerts when in background
        const isInBackground = document.visibilityState === 'hidden';
        if (this.isIOS && isInBackground) {
          this.missedAlerts.push({
            type: 'alert',
            time: this.currentTime,
            timestamp: Date.now()
          });
          if (this.debugMode) {
            console.log(`[Timer] iOS: Alert at ${this.currentTime}s while in background (queued)`);
          }
        } else {
          this.audio.playAlert();
          if (this.debugMode) {
            console.log(`[Timer] Alert beep at ${this.currentTime}s`);
          }
        }

        this.lastAlertSecond = this.currentTime;
      }
    }

    if (this.debugMode) {
      const tickDuration = performance.now() - tickStart;
      console.log(`[Timer] Tick completed in ${tickDuration.toFixed(2)}ms. Time: ${this.currentTime}s, Rep: ${this.currentRep}/${this.repetitions}, Resting: ${this.isResting}`);
    }
  }

  /**
   * Handle timer completion - called when currentTime reaches 0
   */
  handleTimerComplete() {
    // Prevent duplicate calls (e.g., from visibility change during transition)
    if (this.transitionInProgress) {
      if (this.debugMode) {
        console.log("[Timer] Transition already in progress, ignoring duplicate call");
      }
      return;
    }

    this.transitionInProgress = true;
    const completeStart = performance.now();

    // Pause the interval while sound plays
    clearInterval(this.interval);

    if (this.isResting) {
      // Rest period ended, start next rep
      if (this.debugMode) {
        console.log(`[Timer] Rest complete, playing whistle...`);
      }

      // Play whistle, then start next rep when it finishes
      this.audio.playRestEnd(() => {
        // Check if timer was paused/stopped during sound playback
        if (!this.isRunning) {
          if (this.debugMode) {
            console.log("[Timer] Skipping restart - timer was paused/stopped during transition");
          }
          this.transitionInProgress = false;
          return;
        }

        this.isResting = false;
        this.currentRep++;
        this.currentTime = this.duration;

        // Update timestamp for next rep
        const now = Date.now();
        this.startTimestamp = now;
        this.targetEndTime = now + (this.currentTime * 1000);
        this.lastAlertSecond = null;

        this.updateDisplay();

        if (this.debugMode) {
          console.log(`[Timer] Starting rep ${this.currentRep}`);
        }

        // Emit events (non-blocking)
        setTimeout(() => {
          eventBus.emit("sound:rest_end", {
            repNumber: this.currentRep,
            totalReps: this.repetitions,
          });
        }, 0);

        // Restart interval
        this.interval = setInterval(() => this.tick(), 1000);
        this.transitionInProgress = false;
      });
    } else if (this.currentRep < this.repetitions) {
      // Work period ended, more reps to go - start rest

      if (this.debugMode) {
        console.log(`[Timer] Round ${this.currentRep} complete, playing bell...`);
      }

      const currentRep = this.currentRep;
      const totalReps = this.repetitions;

      // Play bell, then start rest when it finishes
      this.audio.playComplete(() => {
        // Check if timer was paused/stopped during sound playback
        if (!this.isRunning) {
          if (this.debugMode) {
            console.log("[Timer] Skipping restart - timer was paused/stopped during transition");
          }
          this.transitionInProgress = false;
          return;
        }

        // Emit events (non-blocking)
        setTimeout(() => {
          eventBus.emit("timer:rep_completed", {
            repNumber: currentRep,
            totalReps: totalReps,
          });
          eventBus.emit("sound:round_end", {
            repNumber: currentRep,
            totalReps: totalReps,
          });
        }, 0);

        if (this.restTime > 0) {
          this.isResting = true;
          this.currentTime = this.restTime;

          // Update timestamp for rest period
          const now = Date.now();
          this.startTimestamp = now;
          this.targetEndTime = now + (this.currentTime * 1000);
          this.lastAlertSecond = null;

          this.updateDisplay();

          if (this.debugMode) {
            console.log(`[Timer] Starting rest period (${this.restTime}s)`);
          }

          // Restart interval
          this.interval = setInterval(() => this.tick(), 1000);
          this.transitionInProgress = false;
          // Music continues playing during rest
        } else {
          // No rest time, go directly to next rep
          this.currentRep++;
          this.currentTime = this.duration;

          // Update timestamp for next rep
          const now = Date.now();
          this.startTimestamp = now;
          this.targetEndTime = now + (this.currentTime * 1000);
          this.lastAlertSecond = null;

          this.updateDisplay();

          if (this.debugMode) {
            console.log(`[Timer] No rest, starting rep ${this.currentRep}`);
          }

          // Restart interval
          this.interval = setInterval(() => this.tick(), 1000);
          this.transitionInProgress = false;
        }
      });
    } else {
      // All reps completed
      const completionTime = Date.now();

      if (this.debugMode) {
        console.log(`[Timer] Workout complete! Playing three bells...`);
      }

      this.repCounter.textContent = "✓ Complete!";

      // Play three bells, then stop when finished
      const duration = this.duration;
      const repetitions = this.repetitions;

      this.audio.playFinalComplete(() => {
        // Always stop timer after final sound, regardless of pause state
        // (User might have paused, but workout is complete)
        this.stop();
        this.transitionInProgress = false;

        if (this.debugMode) {
          console.log(`[Timer] Workout sound finished, timer stopped`);
        }

        // Emit events (non-blocking)
        setTimeout(() => {
          eventBus.emit("timer:completed", {
            duration,
            repetitions,
            completionTime,
          });
          eventBus.emit("sound:workout_over", {
            duration,
            repetitions,
          });
        }, 0);
      });
    }

    if (this.debugMode) {
      const completeDuration = performance.now() - completeStart;
      console.log(`[Timer] handleTimerComplete took ${completeDuration.toFixed(2)}ms`);
    }
  }

  /**
   * Update the display
   */
  updateDisplay() {
    // Update timer value
    this.timerValue.textContent = formatTime(this.currentTime);

    // Update rep counter with rest indicator
    if (this.isRunning) {
      if (this.isResting) {
        this.repCounter.textContent = `REST - Next: Rep ${this.currentRep + 1} / ${this.repetitions}`;
      } else {
        this.repCounter.textContent = `Rep ${this.currentRep} / ${this.repetitions}`;
      }
    } else {
      this.repCounter.textContent = "Ready";
    }

    // Check if we're in alert state (final seconds)
    const shouldAlert = this.currentTime <= this.alertTime && this.currentTime > 0 && this.isRunning;

    // Handle YouTube volume ducking
    if (shouldAlert && !this.isAlertActive) {
      // Entering alert state - duck the music volume
      // Only save normalVolume when entering alert state (not when leaving)
      if (this.youtube) {
        this.normalVolume = this.youtube.getVolume();
        this.youtube.setVolume(25); // Reduce to 25%
      }
      this.isAlertActive = true;
    } else if (!shouldAlert && this.isAlertActive) {
      // Leaving alert state - restore normal volume
      if (this.youtube) {
        this.youtube.setVolume(this.normalVolume);
      }
      this.isAlertActive = false;
    }

    // Update alert state (during both work and rest in final seconds)
    if (shouldAlert) {
      addClass(this.timerDisplay, "alert");
      addClass(this.timerValue, "warning");
      // Alert overrides rest mode visual
      removeClass(this.timerDisplay, "resting");
      removeClass(this.timerValue, "rest-mode");
    } else {
      removeClass(this.timerDisplay, "alert");
      removeClass(this.timerValue, "warning");

      // Add rest visual indicator (only when not in alert state)
      if (this.isResting && this.isRunning) {
        addClass(this.timerDisplay, "resting");
        addClass(this.timerValue, "rest-mode");
      } else {
        removeClass(this.timerDisplay, "resting");
        removeClass(this.timerValue, "rest-mode");
      }
    }
  }
}

// Singleton instance
let timer = null;

/**
 * Initialize timer
 * @param {Object} settings - Initial settings
 * @returns {Timer}
 */
export function initTimer(settings = {}) {
  if (!timer) {
    timer = new Timer(settings);
    timer.updateDisplay();
  }
  return timer;
}

/**
 * Get timer instance
 * @returns {Timer}
 */
export function getTimer() {
  return timer;
}

/**
 * Enable debug mode for timer and audio
 * Usage in browser console: window.enableTimerDebug()
 */
export function enableTimerDebug() {
  if (timer) {
    timer.debugMode = true;
    localStorage.setItem("timer_debug", "true");
  }
  if (timer?.audio) {
    timer.audio.setDebugMode(true);
  }
  console.log("✅ Timer debug mode enabled. Reload page to apply.");
  console.log("To disable: window.disableTimerDebug()");
}

/**
 * Disable debug mode
 */
export function disableTimerDebug() {
  if (timer) {
    timer.debugMode = false;
    localStorage.setItem("timer_debug", "false");
  }
  if (timer?.audio) {
    timer.audio.setDebugMode(false);
  }
  console.log("✅ Timer debug mode disabled. Reload page to apply.");
}

/**
 * Get debug stats
 */
export function getTimerStats() {
  if (!timer) {
    console.log("Timer not initialized");
    return;
  }

  const stats = {
    timer: {
      currentTime: timer.currentTime,
      currentRep: timer.currentRep,
      isRunning: timer.isRunning,
      isResting: timer.isResting,
      duration: timer.duration,
      repetitions: timer.repetitions,
      restTime: timer.restTime,
      alertTime: timer.alertTime,
      debugMode: timer.debugMode,
    },
    audio: timer.audio?.getStats(),
  };

  console.table(stats.timer);
  console.log("Audio Stats:", stats.audio);
  return stats;
}

// Expose to window for easy debugging
if (typeof window !== "undefined") {
  window.enableTimerDebug = enableTimerDebug;
  window.disableTimerDebug = disableTimerDebug;
  window.getTimerStats = getTimerStats;
}
