/**
 * Audio Module - Web Audio API for beep sounds and MP3 sound effects
 */

export class AudioManager {
  constructor() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.vibrationEnabled = "vibrate" in navigator;
      this.audioEnabled = true;

      // Resume audio context on first user interaction (required by some browsers)
      if (this.audioContext.state === "suspended") {
        document.addEventListener("click", () => this.resumeContext(), {once: true});
      }
    } catch (error) {
      console.error("AudioContext initialization failed:", error);
      this.audioEnabled = false;
      this.vibrationEnabled = "vibrate" in navigator;
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
      sound.preload = "auto";
    });

    // Track cloned audio elements for cleanup
    this.activeClones = [];
    this.debugMode = localStorage.getItem("audio_debug") === "true";
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

    // Only reset if sound has finished or hasn't started
    // This prevents audio glitches from interrupting playback
    if (sound.paused || sound.ended) {
      sound.currentTime = 0;

      if (this.debugMode) {
        console.log(`[Audio] Playing ${soundKey} (original)`);
      }

      // Add ended callback if provided
      if (onEnded) {
        const endHandler = () => {
          sound.removeEventListener("ended", endHandler);
          if (this.debugMode) {
            console.log(`[Audio] ${soundKey} finished playing`);
          }
          onEnded();
        };
        sound.addEventListener("ended", endHandler);
      }

      // Play the sound asynchronously without blocking
      sound.play().catch((error) => {
        console.warn(`[Audio] Failed to play sound ${soundKey}:`, error);
        if (onEnded) onEnded();
      });
    } else {
      // Sound is already playing, let it finish
      // Clone and play new instance for overlapping sounds
      const clone = sound.cloneNode();
      clone.volume = sound.volume;

      // Clean up clone after it finishes to prevent memory leak
      clone.addEventListener("ended", () => {
        const index = this.activeClones.indexOf(clone);
        if (index > -1) {
          this.activeClones.splice(index, 1);
        }
        clone.remove();

        if (this.debugMode) {
          console.log(`[Audio] Cleaned up clone for ${soundKey}. Active clones: ${this.activeClones.length}`);
        }

        // Call onEnded callback if provided
        if (onEnded) {
          if (this.debugMode) {
            console.log(`[Audio] ${soundKey} (clone) finished playing`);
          }
          onEnded();
        }
      });

      this.activeClones.push(clone);

      if (this.debugMode) {
        console.log(`[Audio] Playing ${soundKey} (clone #${this.activeClones.length})`);
      }

      clone.play().catch((error) => {
        console.warn(`[Audio] Failed to play sound clone ${soundKey}:`, error);
        if (onEnded) onEnded();
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
      activeClones: this.activeClones.length,
      audioEnabled: this.audioEnabled,
      vibrationEnabled: this.vibrationEnabled,
      sounds: Object.keys(this.sounds).map(key => ({
        key,
        paused: this.sounds[key].paused,
        ended: this.sounds[key].ended,
        currentTime: this.sounds[key].currentTime,
        duration: this.sounds[key].duration,
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
