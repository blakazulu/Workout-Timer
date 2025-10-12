/**
 * YouTube Module - YouTube IFrame Player API integration
 * Provides fullscreen background video with playback control
 */

import { $ } from '../utils/dom.js'
import { saveSongToHistory } from './storage.js'

export class YouTubePlayer {
  constructor(containerId) {
    this.containerId = containerId
    this.container = $(containerId)
    this.player = null
    this.currentVideoId = null
    this.isReady = false
    this.apiLoaded = false
    this.loadingOverlay = $('#loadingOverlay')
    this.progressInterval = null
    this.videoTitle = ''
    this.videoAuthor = ''
    this.videoId = ''
    this.originalUrl = '' // Store original URL for history

    // Load YouTube IFrame API
    this.loadAPI()
  }

  /**
   * Load YouTube IFrame Player API
   */
  loadAPI() {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      this.apiLoaded = true
      return
    }

    // Load the API script
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // API ready callback
    window.onYouTubeIframeAPIReady = () => {
      this.apiLoaded = true
      console.log('YouTube IFrame API loaded')
    }
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null
   */
  extractVideoId(url) {
    if (!url) return null

    let videoId = ''

    // Handle youtube.com/watch?v= format
    if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    }
    // Handle youtu.be/ format
    else if (url.includes('youtu.be/')) {
      videoId = url.split('/').pop()?.split('?')[0]
    }

    return videoId || null
  }

  /**
   * Wait for API to load
   * @returns {Promise}
   */
  waitForAPI() {
    return new Promise((resolve) => {
      if (this.apiLoaded && window.YT) {
        resolve()
        return
      }

      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          this.apiLoaded = true
          clearInterval(checkAPI)
          resolve()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkAPI)
        resolve()
      }, 10000)
    })
  }

  /**
   * Load a YouTube video
   * @param {string} url - YouTube URL
   * @returns {Promise<boolean>} Success status
   */
  async loadVideo(url) {
    const videoId = this.extractVideoId(url)

    if (!videoId || !this.container) {
      this.showError('Invalid YouTube URL. Please use a valid youtube.com or youtu.be link.')
      return false
    }

    this.showLoading()

    try {
      // Wait for API to load
      await this.waitForAPI()

      if (!window.YT || !window.YT.Player) {
        this.showError('YouTube API failed to load. Check your connection.')
        return false
      }

      this.currentVideoId = videoId
      this.originalUrl = url // Store original URL for history

      // Destroy existing player
      if (this.player) {
        this.player.destroy()
      }

      // Clear container and prepare for player
      this.container.innerHTML = '<div id="youtube-player-iframe"></div>'

      // Create new player
      this.player = new window.YT.Player('youtube-player-iframe', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          loop: 1,
          playlist: videoId
        },
        events: {
          onReady: (event) => this.onPlayerReady(event),
          onStateChange: (event) => this.onPlayerStateChange(event),
          onError: (event) => this.onPlayerError(event)
        }
      })

      return true
    } catch (error) {
      this.showError('Failed to load YouTube video. Check your connection.')
      console.error('YouTube load error:', error)
      return false
    }
  }

  /**
   * Player ready callback
   */
  onPlayerReady(event) {
    this.isReady = true
    console.log('YouTube player ready')

    // Hide loading overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden')
    }

    // Get video data
    try {
      const videoData = this.player.getVideoData()
      this.videoTitle = videoData.title || 'YouTube Music'
      this.videoAuthor = videoData.author || 'Unknown Artist'
      this.videoId = videoData.video_id || this.currentVideoId
    } catch (error) {
      this.videoTitle = 'YouTube Music'
      this.videoAuthor = 'Unknown Artist'
      this.videoId = this.currentVideoId
    }

    // Show music controls
    this.showMusicControls()

    // Mute by default for autoplay policies
    event.target.mute()
  }

  /**
   * Player state change callback
   */
  onPlayerStateChange(event) {
    // Update play/pause button state
    this.updatePlayPauseButton()
  }

  /**
   * Player error callback
   */
  onPlayerError(event) {
    console.error('YouTube player error:', event.data)
    
    // Hide loading overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden')
    }
    
    this.showError('Failed to play video. It may be restricted or unavailable.')
  }

  /**
   * Play the video
   */
  play() {
    if (this.player && this.isReady) {
      try {
        this.player.playVideo()
        // Unmute when user explicitly starts playback
        this.player.unMute()
        setTimeout(() => this.updatePlayPauseButton(), 100)

        // Save to history when user actually plays (works on desktop and mobile)
        try {
          saveSongToHistory({
            videoId: this.videoId,
            title: this.videoTitle,
            author: this.videoAuthor,
            duration: this.getDuration(),
            url: this.originalUrl
          })
        } catch (error) {
          console.error('Failed to save song to history:', error)
        }
      } catch (error) {
        console.error('Failed to play video:', error)
      }
    }
  }

  /**
   * Pause the video
   */
  pause() {
    if (this.player && this.isReady) {
      try {
        this.player.pauseVideo()
        setTimeout(() => this.updatePlayPauseButton(), 100)
      } catch (error) {
        console.error('Failed to pause video:', error)
      }
    }
  }

  /**
   * Stop the video
   */
  stop() {
    if (this.player && this.isReady) {
      try {
        this.player.stopVideo()
      } catch (error) {
        console.error('Failed to stop video:', error)
      }
    }
  }

  /**
   * Set video volume
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    if (this.player && this.isReady) {
      try {
        this.player.setVolume(volume)
      } catch (error) {
        console.error('Failed to set volume:', error)
      }
    }
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-100)
   */
  getVolume() {
    if (this.player && this.isReady) {
      try {
        return this.player.getVolume()
      } catch (error) {
        console.error('Failed to get volume:', error)
        return 100
      }
    }
    return 100
  }

  /**
   * Get video duration in seconds
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (this.player && this.isReady) {
      try {
        return this.player.getDuration()
      } catch (error) {
        console.error('Failed to get duration:', error)
        return 0
      }
    }
    return 0
  }

  /**
   * Get current time in seconds
   * @returns {number} Current time in seconds
   */
  getCurrentTime() {
    if (this.player && this.isReady) {
      try {
        return this.player.getCurrentTime()
      } catch (error) {
        console.error('Failed to get current time:', error)
        return 0
      }
    }
    return 0
  }

  /**
   * Seek to specific time
   * @param {number} seconds - Time in seconds
   */
  seekTo(seconds) {
    if (this.player && this.isReady) {
      try {
        this.player.seekTo(seconds, true)
      } catch (error) {
        console.error('Failed to seek:', error)
      }
    }
  }

  /**
   * Check if video is playing
   * @returns {boolean} True if playing
   */
  isPlaying() {
    if (this.player && this.isReady) {
      try {
        return this.player.getPlayerState() === 1 // 1 = playing
      } catch (error) {
        return false
      }
    }
    return false
  }

  /**
   * Show music controls
   */
  showMusicControls() {
    const musicControls = $('#musicControls')
    const musicTitle = $('#musicTitle')
    const musicTooltip = $('#musicTooltip')
    const musicInfoBtn = $('#musicInfoBtn')
    
    if (musicControls && musicTitle) {
      // Truncate title to 20 characters
      const displayTitle = this.videoTitle.length > 20 
        ? this.videoTitle.substring(0, 20) + '...' 
        : this.videoTitle
      
      musicTitle.textContent = displayTitle
      
      // Build detailed tooltip
      if (musicTooltip) {
        const duration = this.getDuration()
        const durationFormatted = this.formatTime(duration)
        
        musicTooltip.innerHTML = `
          <div class="music-tooltip-title">${this.escapeHtml(this.videoTitle)}</div>
          <div class="music-tooltip-info">
            <div class="music-tooltip-row">
              <span class="music-tooltip-label">Artist:</span>
              <span class="music-tooltip-value">${this.escapeHtml(this.videoAuthor)}</span>
            </div>
            <div class="music-tooltip-row">
              <span class="music-tooltip-label">Duration:</span>
              <span class="music-tooltip-value">${durationFormatted}</span>
            </div>
            <div class="music-tooltip-row">
              <span class="music-tooltip-label">Video ID:</span>
              <span class="music-tooltip-value">${this.videoId}</span>
            </div>
          </div>
        `
      }
      
      // Always show info button
      if (musicInfoBtn) {
        musicInfoBtn.style.display = 'flex'
      }
      
      musicControls.classList.remove('hidden')
      this.startProgressUpdates()
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Hide music controls
   */
  hideMusicControls() {
    const musicControls = $('#musicControls')
    if (musicControls) {
      musicControls.classList.add('hidden')
      this.stopProgressUpdates()
    }
  }

  /**
   * Start progress bar updates
   */
  startProgressUpdates() {
    this.stopProgressUpdates()
    this.updateProgress()
    this.progressInterval = setInterval(() => this.updateProgress(), 500)
  }

  /**
   * Stop progress bar updates
   */
  stopProgressUpdates() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    const currentTime = this.getCurrentTime()
    const duration = this.getDuration()
    
    if (duration > 0) {
      const percentage = (currentTime / duration) * 100
      
      const progressFill = $('#progressBarFill')
      const progressHandle = $('#progressBarHandle')
      const currentTimeEl = $('#musicCurrentTime')
      const durationEl = $('#musicDuration')
      
      if (progressFill) progressFill.style.width = `${percentage}%`
      if (progressHandle) progressHandle.style.left = `${percentage}%`
      if (currentTimeEl) currentTimeEl.textContent = this.formatTime(currentTime)
      if (durationEl) durationEl.textContent = this.formatTime(duration)
    }
  }

  /**
   * Update play/pause button state
   */
  updatePlayPauseButton() {
    const musicBtn = $('#musicPlayPauseBtn')
    if (!musicBtn) return
    
    const playIcon = musicBtn.querySelector('.play-icon')
    const pauseIcon = musicBtn.querySelector('.pause-icon')
    
    if (this.isPlaying()) {
      if (playIcon) playIcon.classList.add('hidden')
      if (pauseIcon) pauseIcon.classList.remove('hidden')
    } else {
      if (playIcon) playIcon.classList.remove('hidden')
      if (pauseIcon) pauseIcon.classList.add('hidden')
    }
  }

  /**
   * Format time in seconds to MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Show loading state
   */
  showLoading() {
    // Show full-screen loading overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('hidden')
    }
    
    // Also show loading in container for fallback
    if (this.container) {
      this.container.innerHTML = '<div class="youtube-loading">Loading video...</div>'
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    // Hide loading overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden')
    }
    
    if (this.container) {
      this.container.innerHTML = `<div class="youtube-error">${message}</div>`
      setTimeout(() => this.clear(), 3000)
    }
  }

  /**
   * Clear the video player
   */
  clear() {
    this.stopProgressUpdates()
    this.hideMusicControls()
    
    if (this.player) {
      this.player.destroy()
      this.player = null
    }
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.isReady = false
    this.currentVideoId = null
    this.videoTitle = ''
    this.videoAuthor = ''
    this.videoId = ''
  }
}

// Singleton instance
let youtubePlayer = null

/**
 * Initialize YouTube player
 * @param {string} containerId - Container element ID
 * @returns {YouTubePlayer}
 */
export function initYouTube(containerId = '#youtube-player') {
  if (!youtubePlayer) {
    youtubePlayer = new YouTubePlayer(containerId)
  }
  return youtubePlayer
}

/**
 * Get YouTube player instance
 * @returns {YouTubePlayer}
 */
export function getYouTube() {
  return youtubePlayer
}
