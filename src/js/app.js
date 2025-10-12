/**
 * Main Application - Entry point
 */

import { $ } from './utils/dom.js'
import { initTimer, getTimer } from './modules/timer.js'
import { initAudio } from './modules/audio.js'
import { loadSettings, saveSettings } from './modules/storage.js'
import { createGestureHandler } from './utils/gestures.js'

// Lazy loaded modules
let youtubeModule = null

// Import PWA service worker registration
import { registerSW } from 'virtual:pwa-register'

// Register service worker with update notifications
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available! Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    // Optional: Show a subtle notification to user
  }
})

/**
 * Lazy load YouTube module
 * @returns {Promise<Object>}
 */
async function loadYouTubeModule() {
  if (!youtubeModule) {
    console.log('Lazy loading YouTube module...')
    const module = await import('./modules/youtube.js')
    youtubeModule = module.initYouTube('#youtube-player')
  }
  return youtubeModule
}

/**
 * Initialize the application
 */
function init() {
  // Load saved settings
  const settings = loadSettings()

  // Initialize core modules (YouTube is lazy loaded)
  initAudio()
  initTimer(settings)

  // Set up event listeners
  setupEventListeners()
  handleInstallClick()
  setupGestures()

  console.log('Workout Timer Pro initialized')
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  const timer = getTimer()

  // Start/Pause button
  const startBtn = $('#startBtn')
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      timer.start()
      // Save settings when starting
      saveSettings({
        duration: parseInt($('#duration').value),
        alertTime: parseInt($('#alertTime').value),
        repetitions: parseInt($('#repetitions').value)
      })
    })
  }

  // Reset button
  const resetBtn = $('#resetBtn')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      timer.reset()
    })
  }

  // YouTube load button - lazy load module on first interaction
  const loadYoutubeBtn = $('#loadYoutubeBtn')
  if (loadYoutubeBtn) {
    loadYoutubeBtn.addEventListener('click', async () => {
      const url = $('#youtubeUrl').value
      if (url) {
        const youtube = await loadYouTubeModule()
        youtube.loadVideo(url)
      }
    })
  }

  // YouTube input - lazy load module and load on Enter key
  const youtubeUrl = $('#youtubeUrl')
  if (youtubeUrl) {
    youtubeUrl.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const url = $('#youtubeUrl').value
        if (url) {
          const youtube = await loadYouTubeModule()
          youtube.loadVideo(url)
        }
      }
    })
  }

  // Auto-save settings on change
  const settingsInputs = ['#duration', '#alertTime', '#repetitions']
  settingsInputs.forEach(selector => {
    const input = $(selector)
    if (input) {
      input.addEventListener('change', () => {
        saveSettings({
          duration: parseInt($('#duration').value),
          alertTime: parseInt($('#alertTime').value),
          repetitions: parseInt($('#repetitions').value)
        })
      })
    }
  })

  // Prevent form submission if inputs are in a form
  document.addEventListener('submit', (e) => {
    e.preventDefault()
  })

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Space bar to start/pause
    if (e.code === 'Space' && !e.target.matches('input')) {
      e.preventDefault()
      timer.start()
    }
    // R key to reset
    if (e.code === 'KeyR' && !e.target.matches('input')) {
      e.preventDefault()
      timer.reset()
    }
  })
}

/**
 * Handle PWA install prompt
 */
let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e

  // Show install button
  const installBtn = $('#installBtn')
  if (installBtn) {
    installBtn.style.display = 'flex'
  }
  console.log('PWA install prompt available')
})

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully')
  deferredPrompt = null

  // Hide install button
  const installBtn = $('#installBtn')
  if (installBtn) {
    installBtn.style.display = 'none'
  }
})

/**
 * Set up touch gesture handlers for mobile UX
 */
function setupGestures() {
  const timer = getTimer()
  const timerDisplay = $('#timerDisplay')

  if (!timerDisplay) return

  const gestures = createGestureHandler(timerDisplay)

  // Double tap to start/pause
  gestures.on('doubleTap', () => {
    timer.start()
  })

  // Swipe down to reset
  gestures.on('swipeDown', () => {
    if (confirm('Reset timer?')) {
      timer.reset()
    }
  })
}

/**
 * Handle install button click
 */
function handleInstallClick() {
  const installBtn = $('#installBtn')
  if (!installBtn) return

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice
    console.log(`Install prompt outcome: ${outcome}`)

    // Clear the deferred prompt
    deferredPrompt = null
    installBtn.style.display = 'none'
  })
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

export { init }
