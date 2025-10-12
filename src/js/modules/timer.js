/**
 * Timer Module - Core workout timer logic
 */

import { $, addClass, removeClass } from '../utils/dom.js'
import { formatTime } from '../utils/time.js'
import { getAudio } from './audio.js'

export class Timer {
  constructor(options = {}) {
    this.duration = options.duration || 30
    this.alertTime = options.alertTime || 3
    this.repetitions = options.repetitions || 3
    this.restTime = options.restTime || 10
    this.currentTime = 0
    this.currentRep = 1
    this.isRunning = false
    this.isResting = false
    this.interval = null
    this.youtube = null
    this.isAlertActive = false
    this.normalVolume = 100

    // DOM elements
    this.timerDisplay = $('#timerDisplay')
    this.timerValue = $('#timerValue')
    this.repCounter = $('#repCounter')
    this.startBtn = $('#startBtn')
    this.settings = $('#settings')

    // Audio manager
    this.audio = getAudio()
  }

  /**
   * Set YouTube player instance
   * @param {Object} youtubePlayer - YouTube player instance
   */
  setYouTubePlayer(youtubePlayer) {
    this.youtube = youtubePlayer
  }

  /**
   * Start or resume the timer
   */
  start() {
    if (!this.isRunning) {
      // Read settings from input fields
      this.duration = parseInt($('#duration').value)
      this.alertTime = parseInt($('#alertTime').value)
      this.repetitions = parseInt($('#repetitions').value)
      this.restTime = parseInt($('#restTime').value)

      // Initialize timer if starting fresh
      if (!this.currentTime) {
        this.currentTime = this.duration
        this.currentRep = 1
        this.isResting = false
      }

      this.isRunning = true
      this.interval = setInterval(() => this.tick(), 1000)
      this.startBtn.textContent = 'PAUSE'
      addClass(this.settings, 'hidden')

      // Play YouTube video if loaded
      if (this.youtube) {
        this.youtube.play()
      }
    } else {
      this.pause()
    }
  }

  /**
   * Pause the timer
   */
  pause() {
    clearInterval(this.interval)
    this.isRunning = false
    this.startBtn.textContent = 'RESUME'

    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume)
    }
    this.isAlertActive = false

    // Pause YouTube video if loaded
    if (this.youtube) {
      this.youtube.pause()
    }
  }

  /**
   * Stop the timer completely
   */
  stop() {
    clearInterval(this.interval)
    this.isRunning = false
    this.startBtn.textContent = 'START'
    removeClass(this.settings, 'hidden')
    
    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume)
    }
    this.isAlertActive = false
  }

  /**
   * Reset the timer to initial state
   */
  reset() {
    this.stop()
    this.currentTime = 0
    this.currentRep = 1
    this.isResting = false
    
    // Restore normal volume if we were in alert state
    if (this.isAlertActive && this.youtube) {
      this.youtube.setVolume(this.normalVolume)
    }
    this.isAlertActive = false
    
    this.updateDisplay()

    // Stop YouTube video if loaded
    if (this.youtube) {
      this.youtube.stop()
    }
  }

  /**
   * Timer tick - called every second
   */
  tick() {
    if (this.currentTime > 0) {
      this.currentTime--

      // Play alert beep during countdown (both work and rest)
      if (this.currentTime <= this.alertTime && this.currentTime > 0) {
        this.audio.playAlert()
      }

      this.updateDisplay()
    } else {
      // Timer reached zero
      if (this.isResting) {
        // Rest period ended, start next rep
        this.isResting = false
        this.currentRep++
        this.currentTime = this.duration
        this.updateDisplay()
      } else if (this.currentRep < this.repetitions) {
        // Work period ended, more reps to go - start rest
        this.audio.playComplete()
        
        if (this.restTime > 0) {
          this.isResting = true
          this.currentTime = this.restTime
          this.updateDisplay()
          // Music continues playing during rest
        } else {
          // No rest time, go directly to next rep
          this.currentRep++
          this.currentTime = this.duration
          this.updateDisplay()
        }
      } else {
        // All reps completed
        this.stop()
        this.audio.playFinalComplete()
        this.repCounter.textContent = '✓ Complete!'
      }
    }
  }

  /**
   * Update the display
   */
  updateDisplay() {
    // Update timer value
    this.timerValue.textContent = formatTime(this.currentTime)

    // Update rep counter with rest indicator
    if (this.isRunning) {
      if (this.isResting) {
        this.repCounter.textContent = `REST - Next: Rep ${this.currentRep} / ${this.repetitions}`
      } else {
        this.repCounter.textContent = `Rep ${this.currentRep} / ${this.repetitions}`
      }
    } else {
      this.repCounter.textContent = 'Ready'
    }

    // Check if we're in alert state (final seconds)
    const shouldAlert = this.currentTime <= this.alertTime && this.currentTime > 0 && this.isRunning

    // Handle YouTube volume ducking
    if (shouldAlert && !this.isAlertActive) {
      // Entering alert state - duck the music volume
      if (this.youtube) {
        this.normalVolume = this.youtube.getVolume()
        this.youtube.setVolume(25) // Reduce to 25%
      }
      this.isAlertActive = true
    } else if (!shouldAlert && this.isAlertActive) {
      // Leaving alert state - restore normal volume
      if (this.youtube) {
        this.youtube.setVolume(this.normalVolume)
      }
      this.isAlertActive = false
    }

    // Update alert state (during both work and rest in final seconds)
    if (shouldAlert) {
      addClass(this.timerDisplay, 'alert')
      addClass(this.timerValue, 'warning')
      // Alert overrides rest mode visual
      removeClass(this.timerDisplay, 'resting')
      removeClass(this.timerValue, 'rest-mode')
    } else {
      removeClass(this.timerDisplay, 'alert')
      removeClass(this.timerValue, 'warning')
      
      // Add rest visual indicator (only when not in alert state)
      if (this.isResting && this.isRunning) {
        addClass(this.timerDisplay, 'resting')
        addClass(this.timerValue, 'rest-mode')
      } else {
        removeClass(this.timerDisplay, 'resting')
        removeClass(this.timerValue, 'rest-mode')
      }
    }
  }
}

// Singleton instance
let timer = null

/**
 * Initialize timer
 * @param {Object} settings - Initial settings
 * @returns {Timer}
 */
export function initTimer(settings = {}) {
  if (!timer) {
    timer = new Timer(settings)
    timer.updateDisplay()
  }
  return timer
}

/**
 * Get timer instance
 * @returns {Timer}
 */
export function getTimer() {
  return timer
}
