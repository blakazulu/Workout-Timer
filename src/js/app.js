/**
 * Main Application - Entry point
 */

import { $ } from './utils/dom.js'
import { initTimer, getTimer } from './modules/timer.js'
import { initAudio } from './modules/audio.js'
import { loadSettings, saveSettings, getSongHistory, getMostPlayedSongs } from './modules/storage.js'
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

  // Apply settings to input fields
  $('#duration').value = settings.duration
  $('#alertTime').value = settings.alertTime
  $('#repetitions').value = settings.repetitions
  $('#restTime').value = settings.restTime

  // Initialize core modules (YouTube is lazy loaded)
  initAudio()
  initTimer(settings)

  // Set up event listeners
  setupEventListeners()
  handleInstallClick()
  setupGestures()
  setupHistory()

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
        repetitions: parseInt($('#repetitions').value),
        restTime: parseInt($('#restTime').value)
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
        await youtube.loadVideo(url)
        // Connect YouTube player to timer
        timer.setYouTubePlayer(youtube)
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
          await youtube.loadVideo(url)
          // Connect YouTube player to timer
          timer.setYouTubePlayer(youtube)
        }
      }
    })
  }

  // Music play/pause button
  const musicPlayPauseBtn = $('#musicPlayPauseBtn')
  if (musicPlayPauseBtn) {
    musicPlayPauseBtn.addEventListener('click', async () => {
      if (youtubeModule) {
        if (youtubeModule.isPlaying()) {
          youtubeModule.pause()
        } else {
          youtubeModule.play()
        }
      }
    })
  }

  // Progress bar seeking
  const progressBarContainer = $('#progressBarContainer')
  if (progressBarContainer) {
    progressBarContainer.addEventListener('click', async (e) => {
      if (youtubeModule) {
        const rect = progressBarContainer.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = (x / rect.width) * 100
        const duration = youtubeModule.getDuration()
        const seekTime = (percentage / 100) * duration
        youtubeModule.seekTo(seekTime)
      }
    })
  }

  // Music info tooltip - using Popover API with positioning fallback
  setupMusicTooltipPositioning()

  // Auto-save settings on change
  const settingsInputs = ['#duration', '#alertTime', '#repetitions', '#restTime']
  settingsInputs.forEach(selector => {
    const input = $(selector)
    if (input) {
      input.addEventListener('change', () => {
        saveSettings({
          duration: parseInt($('#duration').value),
          alertTime: parseInt($('#alertTime').value),
          repetitions: parseInt($('#repetitions').value),
          restTime: parseInt($('#restTime').value)
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
 * Setup music tooltip positioning (fallback for browsers without anchor positioning)
 */
function setupMusicTooltipPositioning() {
  const musicInfoBtn = $('#musicInfoBtn')
  const musicTooltip = $('#musicTooltip')
  
  if (!musicInfoBtn || !musicTooltip) return
  
  // Check if anchor positioning is supported
  const supportsAnchorPositioning = CSS.supports('position-anchor', '--test')
  
  if (!supportsAnchorPositioning) {
    console.log('Using JavaScript fallback for tooltip positioning')
    
    const positionTooltip = () => {
      const rect = musicInfoBtn.getBoundingClientRect()
      const tooltipRect = musicTooltip.getBoundingClientRect()
      
      // Position below the button, centered
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
      let top = rect.bottom + 8
      
      // Keep within viewport bounds
      const margin = 10
      if (left < margin) left = margin
      if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin
      }
      
      if (top + tooltipRect.height > window.innerHeight - margin) {
        // Position above button if not enough space below
        top = rect.top - tooltipRect.height - 8
      }
      
      musicTooltip.style.left = `${left}px`
      musicTooltip.style.top = `${top}px`
    }
    
    // Position on toggle
    musicTooltip.addEventListener('toggle', (e) => {
      if (e.newState === 'open') {
        requestAnimationFrame(() => positionTooltip())
      }
    })
    
    // Reposition on scroll/resize
    window.addEventListener('scroll', () => {
      if (musicTooltip.matches(':popover-open')) {
        positionTooltip()
      }
    })
    
    window.addEventListener('resize', () => {
      if (musicTooltip.matches(':popover-open')) {
        positionTooltip()
      }
    })
  }
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

/**
 * Set up song history popover
 */
function setupHistory() {
  const historyPopover = $('#historyPopover')
  const historyContent = $('#historyContent')
  const historyTabs = document.querySelectorAll('.history-tab')

  if (!historyPopover || !historyContent) return

  let currentTab = 'recent'

  // Render history when popover opens
  historyPopover.addEventListener('toggle', (e) => {
    if (e.newState === 'open') {
      renderHistory(currentTab)
    }
  })

  // Tab switching
  historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      historyTabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      // Switch content
      currentTab = tab.dataset.tab
      renderHistory(currentTab)
    })
  })

  /**
   * Render history items
   * @param {string} tab - 'recent' or 'top'
   */
  function renderHistory(tab) {
    const songs = tab === 'recent' ? getSongHistory() : getMostPlayedSongs(20)

    if (songs.length === 0) {
      historyContent.innerHTML = '<div class="history-empty">No songs played yet</div>'
      return
    }

    historyContent.innerHTML = songs.map(song => {
      const duration = formatDuration(song.duration)
      const thumbnail = song.thumbnail
        ? `<img src="${song.thumbnail}" alt="${escapeHtml(song.title)}" class="history-item-thumbnail" loading="lazy">`
        : `<div class="history-item-no-thumbnail">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <polygon points="5 3 19 12 5 21 5 3"></polygon>
             </svg>
           </div>`

      return `
        <div class="history-item" data-url="${escapeHtml(song.url)}">
          ${thumbnail}
          <div class="history-item-info">
            <div class="history-item-title">${escapeHtml(song.title)}</div>
            <div class="history-item-author">${escapeHtml(song.author)}</div>
            <div class="history-item-meta">
              <div class="history-item-plays">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                ${song.playCount}
              </div>
              <span>•</span>
              <span>${duration}</span>
            </div>
          </div>
        </div>
      `
    }).join('')

    // Add click handlers to history items
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', async () => {
        const url = item.dataset.url

        // Close popover
        historyPopover.hidePopover()

        // Load video
        const youtubeUrl = $('#youtubeUrl')
        if (youtubeUrl) {
          youtubeUrl.value = url
        }

        const youtube = await loadYouTubeModule()
        await youtube.loadVideo(url)

        // Connect YouTube player to timer
        const timer = getTimer()
        timer.setYouTubePlayer(youtube)
      })
    })
  }

  /**
   * Format duration in seconds to MM:SS or HH:MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

export { init }
