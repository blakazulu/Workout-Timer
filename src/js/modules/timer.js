/**
 * Timer Module - Core workout timer logic
 */

import {$, addClass, removeClass} from "../utils/dom.js";
import {formatTime} from "../utils/time.js";
import {getAudio} from "./audio.js";
import {eventBus} from "../core/event-bus.js";
import {getWakeLock} from "../utils/wake-lock.js";
import {loadActivePlan, createQuickStartPlan, getPlanById} from "./plans/storage.js";

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

    // Segment-based plan support (Phase 3-4)
    this.planSegments = null; // Array of plan segments
    this.currentSegmentIndex = 0; // Current segment being executed
    this.isSegmentMode = false; // Whether using segment-based plan

    // iOS-specific optimizations
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.backgroundStartTime = null; // Track when page went to background
    this.missedAlerts = []; // Track alerts that happened during background

    // Debug mode
    this.debugMode = localStorage.getItem("timer_debug") === "true";

    if (this.debugMode && this.isIOS) {
      console.log("[Timer] iOS detected - using enhanced background handling");
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

    // Segment timeline elements
    this.segmentTimeline = $("#segmentTimeline");
    this.segmentPrevious = $("#segmentPrevious");
    this.segmentCurrent = $("#segmentCurrent");
    this.segmentNext = $("#segmentNext");

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
   * Load plan segments for segment-based execution
   * @param {Array} segments - Array of segment objects from workout plan
   * @param {number} repetitions - Number of times to repeat the plan (default: 1)
   */
  loadPlanSegments(segments, repetitions = 1) {
    if (!Array.isArray(segments) || segments.length === 0) {
      console.warn("[Timer] Invalid segments, disabling segment mode");
      this.planSegments = null;
      this.isSegmentMode = false;
      return;
    }

    // Validate repetitions (min: 1, max: 99)
    repetitions = Math.max(1, Math.min(99, parseInt(repetitions) || 1));

    // Multiply segments by repetitions
    const expandedSegments = [];

    for (let rep = 0; rep < repetitions; rep++) {
      segments.forEach((seg, index) => {
        const segmentCopy = {...seg};

        // Store round information separately (not in name)
        if (repetitions > 1) {
          segmentCopy.roundNumber = rep + 1;
          segmentCopy.totalRounds = repetitions;
        }

        expandedSegments.push(segmentCopy);
      });
    }

    this.planSegments = expandedSegments;
    this.currentSegmentIndex = 0;
    this.isSegmentMode = true;

    console.log(`[Timer] Loaded ${segments.length} segments × ${repetitions} repetition(s) = ${expandedSegments.length} total segments`);

    if (this.debugMode) {
      console.log("[Timer] Plan segments:", this.planSegments);
    }
  }

  /**
   * Clear plan segments and return to simple mode
   */
  clearPlanSegments() {
    this.planSegments = null;
    this.currentSegmentIndex = 0;
    this.isSegmentMode = false;
    console.log("[Timer] Cleared plan segments, returning to simple mode");
  }

  /**
   * Get current segment being executed
   * @returns {Object|null} Current segment or null if not in segment mode
   */
  getCurrentSegment() {
    if (!this.isSegmentMode || !this.planSegments) return null;
    if (this.currentSegmentIndex < 0 || this.currentSegmentIndex >= this.planSegments.length) return null;
    return this.planSegments[this.currentSegmentIndex];
  }

  /**
   * Get round/set information for current segment
   * @returns {Object} Object with currentRound, totalRounds, currentSet
   */
  getSegmentRoundInfo() {
    if (!this.isSegmentMode || !this.planSegments) {
      return { currentRound: 1, totalRounds: 1, currentSet: 1 };
    }

    // Count work segments to determine total rounds
    const workSegments = this.planSegments.filter(seg =>
      seg.type === 'hiit-work' || seg.type === 'cardio-moderate' || seg.type === 'strength-training'
    );
    const totalRounds = workSegments.length;

    // Count how many work segments we've passed (including current if it's a work segment)
    let currentRound = 0;
    for (let i = 0; i <= this.currentSegmentIndex && i < this.planSegments.length; i++) {
      const seg = this.planSegments[i];
      if (seg.type === 'hiit-work' || seg.type === 'cardio-moderate' || seg.type === 'strength-training') {
        currentRound++;
      }
    }

    // If current segment is rest, we're still "in" the previous round
    const currentSegment = this.getCurrentSegment();
    const currentSet = currentSegment && (currentSegment.type === 'complete-rest' || currentSegment.type === 'active-recovery')
      ? currentRound
      : currentRound;

    return {
      currentRound: Math.max(1, currentRound),
      totalRounds: Math.max(1, totalRounds),
      currentSet: Math.max(1, currentSet)
    };
  }

  /**
   * Advance to next segment
   * @returns {boolean} True if advanced, false if no more segments
   */
  advanceToNextSegment() {
    if (!this.isSegmentMode || !this.planSegments) return false;

    this.currentSegmentIndex++;

    if (this.currentSegmentIndex >= this.planSegments.length) {
      // All segments complete
      return false;
    }

    const nextSegment = this.getCurrentSegment();
    if (nextSegment) {
      this.currentTime = nextSegment.duration;
      console.log(`[Timer] Advanced to segment ${this.currentSegmentIndex + 1}/${this.planSegments.length}: ${nextSegment.name}`);
      return true;
    }

    return false;
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
          if (alert.type === "alert") {
            this.audio.playAlert();
          } else if (alert.type === "complete") {
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
        console.log("[Timer] Page hidden - tracking background time");
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
      // For repetitions, read from the appropriate input based on active plan mode
      const activePlanId = loadActivePlan();
      const activePlan = getPlanById(activePlanId);

      this.duration = parseInt($("#duration").value);
      this.alertTime = parseInt($("#alertTime").value);
      this.restTime = parseInt($("#restTime").value);

      // Read repetitions from appropriate input based on plan mode
      if (activePlan?.mode === "preset") {
        this.repetitions = parseInt($("#repetitionsPreset")?.value || 3);
      } else if (activePlan?.mode === "custom") {
        this.repetitions = parseInt($("#repetitionsCustom")?.value || 3);
      } else {
        // Simple/Quick Start mode
        this.repetitions = parseInt($("#repetitions").value);
      }

      // Validate alert time doesn't exceed duration
      if (this.alertTime > this.duration) {
        this.alertTime = this.duration;
        $("#alertTime").value = this.alertTime;
      }

      // Handle plan regeneration when settings change
      if (this.isSegmentMode && this.planSegments && activePlan) {
        if (activePlanId === "quick-start") {
          // Quick Start: Check if duration OR repetitions changed
          const firstSegment = this.planSegments[0];
          // Calculate expected segment count for Quick Start
          const expectedSegments = this.restTime > 0 ? this.repetitions * 2 - 1 : this.repetitions;
          const durationChanged = firstSegment && firstSegment.duration !== this.duration;
          const repetitionsChanged = this.planSegments.length !== expectedSegments;

          if (durationChanged || repetitionsChanged) {
            // Settings have changed, regenerate Quick Start plan
            const quickStart = createQuickStartPlan({
              duration: this.duration,
              alertTime: this.alertTime,
              repetitions: this.repetitions,
              restTime: this.restTime
            });
            this.loadPlanSegments(quickStart.segments);
            console.log("[Timer] Regenerated Quick Start plan - settings changed");
          }
        } else if (activePlan.mode === "preset" || activePlan.mode === "custom") {
          // Preset/Custom: Check if repetitions changed (compare total segments)
          const expectedSegments = activePlan.segments.length * this.repetitions;
          if (this.planSegments.length !== expectedSegments) {
            // Repetitions changed, reload segments with new repetitions
            this.loadPlanSegments(activePlan.segments, this.repetitions);
            console.log(`[Timer] Reloaded ${activePlan.mode} plan with ${this.repetitions} repetitions`);
          }
        }
      }

      // Track if this is a fresh start or resume
      // Fresh start if currentTime is 0 OR if we're at the end of segments
      const isAtEnd = this.isSegmentMode && this.currentSegmentIndex >= this.planSegments?.length;
      const isFreshStart = !this.currentTime || isAtEnd;

      // Initialize timer if starting fresh
      if (isFreshStart) {
        // Clear all CSS state classes from previous run
        removeClass(this.timerDisplay, "alert");
        removeClass(this.timerDisplay, "resting");
        removeClass(this.timerValue, "warning");
        removeClass(this.timerValue, "rest-mode");

        // Reset transition flag
        this.transitionInProgress = false;

        // Check if using segment-based plan
        if (this.isSegmentMode && this.planSegments && this.planSegments.length > 0) {
          // Start from first segment
          this.currentSegmentIndex = 0;
          const firstSegment = this.getCurrentSegment();
          if (firstSegment) {
            this.currentTime = firstSegment.duration;
            console.log(`[Timer] Starting segment mode: ${firstSegment.name} (${firstSegment.duration}s)`);
          } else {
            // Fallback to simple mode
            this.currentTime = this.duration;
          }
        } else {
          // Simple mode
          this.currentTime = this.duration;
        }

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
    this.lastAlertSecond = null;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Release wake lock when stopped
    this.wakeLock.release();

    // Clear all CSS state classes
    removeClass(this.timerDisplay, "alert");
    removeClass(this.timerDisplay, "resting");
    removeClass(this.timerValue, "warning");
    removeClass(this.timerValue, "rest-mode");

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
    this.lastAlertSecond = null;

    // Reset segment state
    this.currentSegmentIndex = 0;
    this.transitionInProgress = false;

    // Re-enable body scrolling on mobile
    document.body.classList.remove("timer-active");

    // Ensure wake lock is released
    this.wakeLock.release();

    // Clear all CSS state classes
    removeClass(this.timerDisplay, "alert");
    removeClass(this.timerDisplay, "resting");
    removeClass(this.timerValue, "warning");
    removeClass(this.timerValue, "rest-mode");

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
        const isInBackground = document.visibilityState === "hidden";
        if (this.isIOS && isInBackground) {
          this.missedAlerts.push({
            type: "alert",
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

    // SEGMENT MODE: Handle segment-based execution
    if (this.isSegmentMode && this.planSegments) {
      const currentSegment = this.getCurrentSegment();
      const hasNextSegment = this.currentSegmentIndex < this.planSegments.length - 1;

      if (hasNextSegment) {
        // Advance to next segment
        if (this.debugMode) {
          console.log(`[Timer] Segment ${currentSegment?.name} complete, advancing...`);
        }

        // Determine sound cue with backward compatibility and last-segment detection
        let soundCue = currentSegment?.soundCue;

        // Backward compatibility: Infer soundCue from segment type if missing
        if (!soundCue && currentSegment) {
          const segmentType = currentSegment.type?.toLowerCase() || "";
          if (segmentType.includes("warm") || segmentType.includes("prepare") ||
              segmentType.includes("cool") || segmentType.includes("recovery") ||
              segmentType.includes("transition")) {
            soundCue = "none";
          } else if (segmentType.includes("rest")) {
            soundCue = "rest-end";
          } else {
            soundCue = "alert"; // Default for work/exercise segments
          }
        }

        // Fallback to "complete" if still no soundCue
        soundCue = soundCue || "complete";

        // Play appropriate sound based on current segment's soundCue
        this.playSegmentSound(soundCue, () => {
          if (!this.isRunning) {
            this.transitionInProgress = false;
            return;
          }

          // Advance to next segment
          const advanced = this.advanceToNextSegment();
          if (advanced) {
            // Update timestamp for next segment
            const now = Date.now();
            this.startTimestamp = now;
            this.targetEndTime = now + (this.currentTime * 1000);
            this.lastAlertSecond = null;

            this.updateDisplay();

            // Emit segment started event
            const nextSegment = this.getCurrentSegment();
            if (nextSegment) {
              eventBus.emit("segment:started", {
                segmentType: nextSegment.type,
                segmentName: nextSegment.name,
                duration: nextSegment.duration,
                index: this.currentSegmentIndex
              });
            }

            // Restart interval
            this.interval = setInterval(() => this.tick(), 1000);
            this.transitionInProgress = false;
          }
        });
        return;
      } else {
        // All segments complete - workout finished
        if (this.debugMode) {
          console.log("[Timer] All plan segments complete, playing final sound...");
        }

        this.repCounter.textContent = "✓ Complete!";

        this.audio.playFinalComplete(() => {
          this.stop();
          this.transitionInProgress = false;

          eventBus.emit("timer:completed", {
            mode: "segment",
            totalSegments: this.planSegments.length
          });
        });
        return;
      }
    }

    // SIMPLE MODE: Original behavior for backward compatibility
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

    // Update rep counter with rest indicator or segment info
    if (this.isRunning) {
      // Segment mode: show current segment name and progress
      if (this.isSegmentMode && this.planSegments) {
        const currentSegment = this.getCurrentSegment();
        if (currentSegment) {
          // Show actual segment index out of total segments
          const currentIndex = this.currentSegmentIndex + 1;
          const totalSegments = this.planSegments.length;

          // Add round info if repetitions > 1
          const roundInfo = currentSegment.roundNumber && currentSegment.totalRounds > 1
            ? ` - Round ${currentSegment.roundNumber}/${currentSegment.totalRounds}`
            : '';

          this.repCounter.textContent = `${currentSegment.name}${roundInfo} (${currentIndex}/${totalSegments})`;
        } else {
          this.repCounter.textContent = `Rep ${this.currentRep} / ${this.repetitions}`;
        }

        // Update segment timeline (3-segment view)
        this.updateSegmentTimeline();
      } else {
        // Simple mode: show rep counter
        if (this.isResting) {
          this.repCounter.textContent = `REST - Next: Rep ${this.currentRep + 1} / ${this.repetitions}`;
        } else {
          this.repCounter.textContent = `Rep ${this.currentRep} / ${this.repetitions}`;
        }
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

  /**
   * Play segment sound based on sound cue type
   * @param {string} soundCue - Sound cue type (none, alert, complete, rest-end, final-complete)
   * @param {Function} callback - Callback to execute after sound plays
   */
  playSegmentSound(soundCue, callback) {
    switch (soundCue) {
      case "alert":
        this.audio.playAlert();
        // Alert is short, callback immediately
        if (callback) setTimeout(callback, 150);
        break;

      case "complete":
        this.audio.playComplete(callback);
        break;

      case "rest-end":
        this.audio.playRestEnd(callback);
        break;

      case "final-complete":
        this.audio.playFinalComplete(callback);
        break;

      case "none":
      default:
        // No sound, immediate callback
        if (callback) setTimeout(callback, 50);
        break;
    }
  }

  /**
   * Update segment timeline display - Always shows 3 segments
   * Dynamic positioning:
   * - First segment: Active in TOP slot (no previous)
   * - Middle segments: Active in MIDDLE slot (has prev + next)
   * - Last segment: Active in BOTTOM slot (no next)
   */
  updateSegmentTimeline() {
    if (!this.isSegmentMode || !this.planSegments || !this.segmentTimeline) {
      // Hide timeline in simple mode
      if (this.segmentTimeline) {
        addClass(this.segmentTimeline, "hidden");
      }
      return;
    }

    // Show timeline in segment mode
    removeClass(this.segmentTimeline, "hidden");

    const prevIndex = this.currentSegmentIndex - 1;
    const currentIndex = this.currentSegmentIndex;
    const nextIndex = this.currentSegmentIndex + 1;

    const hasPrevious = prevIndex >= 0;
    const hasNext = nextIndex < this.planSegments.length;
    const currentSegment = this.planSegments[currentIndex];

    // Safety check
    if (!currentSegment) {
      console.error("[Timer] Current segment not found at index", currentIndex);
      return;
    }

    // CASE 1: First segment - Active in TOP slot
    if (!hasPrevious) {
      // TOP SLOT - Current segment (ACTIVE)
      this.updateSegmentItem(this.segmentPrevious, currentSegment, true);
      removeClass(this.segmentPrevious, "hidden");

      // MIDDLE SLOT - Next segment (if exists)
      if (hasNext) {
        const nextSegment = this.planSegments[nextIndex];
        this.updateSegmentItem(this.segmentCurrent, nextSegment, false);
        removeClass(this.segmentCurrent, "hidden");

        // BOTTOM SLOT - Next+1 segment (if exists)
        if (nextIndex + 1 < this.planSegments.length) {
          const nextNext = this.planSegments[nextIndex + 1];
          this.updateSegmentItem(this.segmentNext, nextNext, false);
          removeClass(this.segmentNext, "hidden");
        } else {
          // Show "Complete" placeholder
          this.updateSegmentItem(this.segmentNext, {
            name: "Complete",
            duration: 0,
            type: "cooldown"
          }, false);
          removeClass(this.segmentNext, "hidden");
        }
      } else {
        // Only one segment in entire plan
        addClass(this.segmentCurrent, "hidden");
        addClass(this.segmentNext, "hidden");
      }
    }
    // CASE 2: Last segment - Active in BOTTOM slot
    else if (!hasNext) {
      // TOP SLOT - Previous-1 segment (if exists)
      if (prevIndex - 1 >= 0) {
        const prevPrev = this.planSegments[prevIndex - 1];
        this.updateSegmentItem(this.segmentPrevious, prevPrev, false);
        removeClass(this.segmentPrevious, "hidden");
      } else {
        // Show "Start" placeholder
        this.updateSegmentItem(this.segmentPrevious, {
          name: "Start",
          duration: 0,
          type: "prepare"
        }, false);
        removeClass(this.segmentPrevious, "hidden");
      }

      // MIDDLE SLOT - Previous segment
      const prevSegment = this.planSegments[prevIndex];
      this.updateSegmentItem(this.segmentCurrent, prevSegment, false);
      removeClass(this.segmentCurrent, "hidden");

      // BOTTOM SLOT - Current segment (ACTIVE)
      this.updateSegmentItem(this.segmentNext, currentSegment, true);
      removeClass(this.segmentNext, "hidden");
    }
    // CASE 3: Middle segment - Active in MIDDLE slot
    else {
      // TOP SLOT - Previous segment
      const prevSegment = this.planSegments[prevIndex];
      this.updateSegmentItem(this.segmentPrevious, prevSegment, false);
      removeClass(this.segmentPrevious, "hidden");

      // MIDDLE SLOT - Current segment (ACTIVE)
      this.updateSegmentItem(this.segmentCurrent, currentSegment, true);
      removeClass(this.segmentCurrent, "hidden");

      // BOTTOM SLOT - Next segment
      const nextSegment = this.planSegments[nextIndex];
      this.updateSegmentItem(this.segmentNext, nextSegment, false);
      removeClass(this.segmentNext, "hidden");
    }
  }

  /**
   * Clear and hide a segment slot
   * @param {HTMLElement} element - Segment element to clear
   */
  clearSegmentSlot(element) {
    if (!element) return;

    // Remove all position classes
    removeClass(element, "segment-previous");
    removeClass(element, "segment-current");
    removeClass(element, "segment-next");

    // Hide the element
    addClass(element, "hidden");

    // Clear content to prevent visual artifacts
    const segmentName = element.querySelector(".segment-name");
    const segmentDuration = element.querySelector(".segment-duration");

    if (segmentName) segmentName.textContent = "";
    if (segmentDuration) segmentDuration.textContent = "";
  }

  /**
   * Update individual segment item in timeline
   * @param {HTMLElement} element - Segment element
   * @param {Object} segment - Segment data
   * @param {boolean} isActive - Whether this is the currently active segment
   */
  updateSegmentItem(element, segment, isActive) {
    if (!element || !segment) return;

    // Simple approach: only add .active class to the current segment
    // All segments have same base styling, only active gets special treatment
    if (isActive) {
      addClass(element, "active");
    } else {
      removeClass(element, "active");
    }

    const segmentName = element.querySelector(".segment-name");
    const segmentDuration = element.querySelector(".segment-duration");
    const segmentIcon = element.querySelector(".segment-icon .svg-icon");

    if (segmentName) {
      segmentName.textContent = segment.name || "Unnamed Segment";
    }

    if (segmentDuration) {
      segmentDuration.textContent = formatTime(segment.duration);
    }

    // Update icon for all segments (not just active)
    if (segmentIcon && segment.type) {
      const iconPath = this.getSegmentIcon(segment.type);
      if (iconPath) {
        segmentIcon.src = iconPath;
      }
    }
  }

  /**
   * Get icon path for segment type
   * @param {string} segmentType - Segment type
   * @returns {string} Icon path
   */
  getSegmentIcon(segmentType) {
    const iconMap = {
      "warmup": "/svg-icons/energy/fire.svg",
      "cooldown": "/svg-icons/energy/energy.svg",
      "hiit-work": "/svg-icons/gym-and-fitness/dumbbell-01.svg",
      "complete-rest": "/svg-icons/media/pause.svg",
      "active-rest": "/svg-icons/media/pause.svg",
      "prepare": "/svg-icons/alert-notification/alert-01.svg",
      "cardio": "/svg-icons/game-and-sports/dart.svg",
      "strength": "/svg-icons/gym-and-fitness/dumbbell-01.svg",
      "flexibility": "/svg-icons/gym-and-fitness/wellness.svg"
    };

    return iconMap[segmentType] || "/svg-icons/energy/fire.svg";
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
