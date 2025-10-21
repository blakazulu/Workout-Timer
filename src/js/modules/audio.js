/**
 * Audio Module - Web Audio API for beep sounds and MP3 sound effects
 */

export class AudioManager {
  constructor() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.vibrationEnabled = "vibrate" in navigator;
      this.audioEnabled = true;

      // Detect iOS for platform-specific optimizations
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      // Resume audio context on first user interaction (required by some browsers)
      // Support multiple interaction types for better mobile compatibility
      if (this.audioContext.state === "suspended") {
        const resumeEvents = ["click", "touchstart", "keydown"];
        const resumeHandler = () => {
          this.resumeContext();
          // Remove all listeners after first interaction
          resumeEvents.forEach(event => {
            document.removeEventListener(event, resumeHandler);
          });
        };

        resumeEvents.forEach(event => {
          document.addEventListener(event, resumeHandler, {once: true});
        });
      }
    } catch (error) {
      console.error("AudioContext initialization failed:", error);
      this.audioEnabled = false;
      this.vibrationEnabled = "vibrate" in navigator;
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Preload sound effects for instant playback
    this.sounds = {
      restEnd: new Audio("/sounds/end_of_rest.mp3"),
      roundEnd: new Audio("/sounds/end_of_round.mp3"),
      workoutOver: new Audio("/sounds/workout_over.mp3"),
    };

    // Set volume for sound effects (0-1 range)
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.8;
      // iOS ignores preload="auto" to save bandwidth, so only set it for non-iOS
      if (!this.isIOS) {
        sound.preload = "auto";
      } else {
        sound.preload = "metadata";  // iOS: Load metadata only
      }
    });

    // Track cloned audio elements for cleanup
    this.activeClones = [];
    // iOS: Reduce max clones due to stricter audio limits
    this.maxClones = this.isIOS ? 3 : 10;
    this.debugMode = localStorage.getItem("audio_debug") === "true";

    // iOS: Use audio queue for sequential playback instead of concurrent clones
    this.audioQueue = [];
    this.isPlayingQueued = false;

    // Periodic cleanup of stale clones (every 10 seconds)
    setInterval(() => this.cleanupStaleClones(), 10000);

    if (this.debugMode && this.isIOS) {
      console.log('[Audio] iOS detected - using sequential audio playback mode');
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.log("AudioContext resumed");
      } catch (error) {
        console.error("Failed to resume AudioContext:", error);
      }
    }
  }

  /**
   * Cleanup stale audio clones to prevent memory leaks
   */
  cleanupStaleClones() {
    const beforeCount = this.activeClones.length;

    this.activeClones = this.activeClones.filter(clone => {
      // Remove if ended or paused (stale)
      if (clone.ended || clone.paused) {
        try {
          clone.remove();
        } catch (error) {
          // Clone might already be removed
        }
        return false;
      }
      return true;
    });

    const cleaned = beforeCount - this.activeClones.length;
    if (this.debugMode && cleaned > 0) {
      console.log(`[Audio] Cleanup: Removed ${cleaned} stale clones, ${this.activeClones.length} still active`);
    }
  }

  /**
   * Process audio queue for iOS sequential playback
   * iOS has strict limits on concurrent audio playback
   */
  async processAudioQueue() {
    if (this.isPlayingQueued || this.audioQueue.length === 0) {
      return;
    }

    this.isPlayingQueued = true;

    while (this.audioQueue.length > 0) {
      const { soundKey, onEnded } = this.audioQueue.shift();

      await new Promise((resolve) => {
        this.playSound(soundKey, () => {
          if (onEnded) onEnded();
          resolve();
        });
      });
    }

    this.isPlayingQueued = false;
  }

  /**
   * Vibrate the device if supported
   * @param {number|number[]} pattern - Vibration pattern in milliseconds
   */
  vibrate(pattern) {
    if (this.vibrationEnabled) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Vibration failed:", error);
      }
    }
  }

  /**
   * Generate a beep sound
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {number} volume - Volume (0-1), default 0.6
   */
  beep(frequency, duration, volume = 0.6) {
    if (!this.audioEnabled || !this.audioContext) {
      console.warn("Audio is not enabled");
      return;
    }

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("Beep sound failed:", error);
    }
  }

  /**
   * Play a sound effect with error handling (non-blocking)
   * @param {string} soundKey - Key of the sound to play
   * @param {Function} onEnded - Optional callback when sound finishes
   */
  playSound(soundKey, onEnded = null) {
    const startTime = performance.now();

    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`[Audio] Sound ${soundKey} not found`);
      if (onEnded) onEnded();
      return;
    }

    // iOS: Use sequential playback queue instead of concurrent clones
    if (this.isIOS && (!sound.paused && !sound.ended)) {
      if (this.debugMode) {
        console.log(`[Audio] iOS: Queueing ${soundKey} for sequential playback`);
      }
      this.audioQueue.push({ soundKey, onEnded });
      this.processAudioQueue();
      return;
    }

    // Protection against double callback execution
    let callbackFired = false;
    let timeoutId = null;

    const safeCallback = () => {
      if (callbackFired) return;
      callbackFired = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (onEnded) onEnded();
    };

    // Only reset if sound has finished or hasn't started
    // This prevents audio glitches from interrupting playback
    if (sound.paused || sound.ended) {
      sound.currentTime = 0;

      if (this.debugMode) {
        console.log(`[Audio] Playing ${soundKey} (original)${this.isIOS ? ' [iOS]' : ''}`);
      }

      // Add ended callback if provided
      if (onEnded) {
        const endHandler = () => {
          sound.removeEventListener("ended", endHandler);
          if (this.debugMode) {
            console.log(`[Audio] ${soundKey} finished playing`);
          }
          safeCallback();
        };
        sound.addEventListener("ended", endHandler);

        // Timeout fallback (sound duration + buffer)
        // Longest sound is workoutOver (~2s), use 5s to be safe
        timeoutId = setTimeout(() => {
          if (this.debugMode) {
            console.warn(`[Audio] ${soundKey} timeout - forcing callback`);
          }
          safeCallback();
        }, 5000);
      }

      // iOS: Load the sound first before playing (since preload is disabled)
      const playPromise = this.isIOS
        ? sound.load().then(() => sound.play()).catch(() => sound.play())
        : sound.play();

      // Play the sound asynchronously without blocking
      playPromise.catch((error) => {
        console.warn(`[Audio] Failed to play sound ${soundKey}:`, error);
        safeCallback();
      });
    } else {
      // Sound is already playing, let it finish
      // Clone and play new instance for overlapping sounds (non-iOS only)

      // Enforce max clone limit
      if (this.activeClones.length >= this.maxClones) {
        console.warn(`[Audio] Max clones (${this.maxClones}) reached, skipping ${soundKey}`);
        if (onEnded) setTimeout(onEnded, 0);
        return;
      }

      const clone = sound.cloneNode();
      clone.volume = sound.volume;

      // Clean up clone after it finishes to prevent memory leak
      clone.addEventListener("ended", () => {
        const index = this.activeClones.indexOf(clone);
        if (index > -1) {
          this.activeClones.splice(index, 1);
        }
        try {
          clone.remove();
        } catch (error) {
          // Clone might already be removed
        }

        if (this.debugMode) {
          console.log(`[Audio] Cleaned up clone for ${soundKey}. Active clones: ${this.activeClones.length}`);
        }

        // Call onEnded callback if provided
        if (this.debugMode && onEnded) {
          console.log(`[Audio] ${soundKey} (clone) finished playing`);
        }
        safeCallback();
      });

      this.activeClones.push(clone);

      if (this.debugMode) {
        console.log(`[Audio] Playing ${soundKey} (clone #${this.activeClones.length})`);
      }

      // Timeout fallback for clones too
      if (onEnded) {
        timeoutId = setTimeout(() => {
          if (this.debugMode) {
            console.warn(`[Audio] ${soundKey} clone timeout - forcing callback`);
          }
          safeCallback();
        }, 5000);
      }

      clone.play().catch((error) => {
        console.warn(`[Audio] Failed to play sound clone ${soundKey}:`, error);
        safeCallback();
      });
    }

    if (this.debugMode) {
      const duration = performance.now() - startTime;
      console.log(`[Audio] playSound(${soundKey}) took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Play alert beep (countdown warning)
   */
  playAlert() {
    if (this.debugMode) {
      console.log(`[Audio] Playing alert beep`);
    }
    this.beep(800, 0.1);
    this.vibrate(50); // Short vibration for alert
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    localStorage.setItem("audio_debug", enabled.toString());
    console.log(`[Audio] Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get current audio stats for debugging
   */
  getStats() {
    return {
      platform: this.isIOS ? 'iOS' : 'other',
      activeClones: this.activeClones.length,
      maxClones: this.maxClones,
      audioEnabled: this.audioEnabled,
      vibrationEnabled: this.vibrationEnabled,
      audioQueueLength: this.audioQueue.length,
      isPlayingQueued: this.isPlayingQueued,
      audioContextState: this.audioContext?.state || 'unavailable',
      sounds: Object.keys(this.sounds).map(key => ({
        key,
        paused: this.sounds[key].paused,
        ended: this.sounds[key].ended,
        currentTime: this.sounds[key].currentTime,
        duration: this.sounds[key].duration,
        preload: this.sounds[key].preload,
      })),
    };
  }

  /**
   * Play rest end sound (whistle after rest period)
   * @param {Function} onEnded - Optional callback when sound finishes
   */
  playRestEnd(onEnded) {
    this.playSound("restEnd", onEnded);
    this.vibrate([100, 50, 100]); // Double vibration pattern
  }

  /**
   * Play completion sound (boxing bell after each round)
   * @param {Function} onEnded - Optional callback when sound finishes
   */
  playComplete(onEnded) {
    this.playSound("roundEnd", onEnded);
    this.vibrate([100, 50, 100]); // Double vibration pattern
  }

  /**
   * Play final completion sound (three bells when workout is over)
   * @param {Function} onEnded - Optional callback when sound finishes
   */
  playFinalComplete(onEnded) {
    this.playSound("workoutOver", onEnded);
    this.vibrate([100, 50, 100, 50, 200]); // Triple vibration pattern
  }
}

// Singleton instance
let audioManager = null;

/**
 * Initialize audio manager
 * @returns {AudioManager}
 */
export function initAudio() {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}

/**
 * Get audio manager instance
 * @returns {AudioManager}
 */
export function getAudio() {
  if (!audioManager) {
    audioManager = initAudio();
  }
  return audioManager;
}
