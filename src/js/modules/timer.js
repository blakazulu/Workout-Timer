/**
 * Timer Module - Core workout timer logic
 */

import { $, addClass, removeClass } from '../utils/dom.js'
import { formatTime } from '../utils/time.js'
import { getAudio } from './audio.js'

export class Timer {
  constructor(options = {}) {
    this.duration = options.duration || 30
    this.alertTime = options.alertTime || 5
    this.repetitions = options.repetitions || 3
    this.currentTime = 0
    this.currentRep = 1
    this.isRunning = false
    this.interval = null

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
   * Start or resume the timer
   */
  start() {
    if (!this.isRunning) {
      // Read settings from input fields
      this.duration = parseInt($('#duration').value)
      this.alertTime = parseInt($('#alertTime').value)
      this.repetitions = parseInt($('#repetitions').value)

      // Initialize timer if starting fresh
      if (!this.currentTime) {
        this.currentTime = this.duration
        this.currentRep = 1
      }

      this.isRunning = true
      this.interval = setInterval(() => this.tick(), 1000)
      this.startBtn.textContent = 'PAUSE'
      addClass(this.settings, 'hidden')
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
  }

  /**
   * Stop the timer completely
   */
  stop() {
    clearInterval(this.interval)
    this.isRunning = false
    this.startBtn.textContent = 'START'
    removeClass(this.settings, 'hidden')
  }

  /**
   * Reset the timer to initial state
   */
  reset() {
    this.stop()
    this.currentTime = 0
    this.currentRep = 1
    this.updateDisplay()
  }

  /**
   * Timer tick - called every second
   */
  tick() {
    if (this.currentTime > 0) {
      this.currentTime--

      // Play alert beep during countdown
      if (this.currentTime <= this.alertTime && this.currentTime > 0) {
        this.audio.playAlert()
      }

      this.updateDisplay()
    } else {
      // Timer reached zero
      if (this.currentRep < this.repetitions) {
        // More reps to go
        this.audio.playComplete()
        this.currentRep++
        this.currentTime = this.duration
        this.updateDisplay()
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

    // Update rep counter
    this.repCounter.textContent = this.isRunning
      ? `Rep ${this.currentRep} / ${this.repetitions}`
      : 'Ready'

    // Update alert state
    if (this.currentTime <= this.alertTime && this.currentTime > 0 && this.isRunning) {
      addClass(this.timerDisplay, 'alert')
      addClass(this.timerValue, 'warning')
    } else {
      removeClass(this.timerDisplay, 'alert')
      removeClass(this.timerValue, 'warning')
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
