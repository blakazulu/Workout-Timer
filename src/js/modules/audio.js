/**
 * Audio Module - Web Audio API for beep sounds
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
   * Play alert beep (countdown warning)
   */
  playAlert() {
    this.beep(800, 0.1);
    this.vibrate(50); // Short vibration for alert
  }

  /**
   * Play completion beep (between reps)
   */
  playComplete() {
    this.beep(523, 0.1);
    setTimeout(() => this.beep(659, 0.1), 100);
    this.vibrate([100, 50, 100]); // Double vibration pattern
  }

  /**
   * Play final completion beep (all reps done)
   */
  playFinalComplete() {
    this.beep(523, 0.1);
    setTimeout(() => this.beep(659, 0.1), 100);
    setTimeout(() => this.beep(784, 0.2), 200);
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
