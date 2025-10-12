/**
 * YouTube Module - YouTube IFrame Player API integration
 * Provides fullscreen background video with playback control
 */

import { $ } from '../utils/dom.js'

export class YouTubePlayer {
  constructor(containerId) {
    this.containerId = containerId
    this.container = $(containerId)
    this.player = null
    this.currentVideoId = null
    this.isReady = false
    this.apiLoaded = false
    this.loadingOverlay = $('#loadingOverlay')

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
    
    // Mute by default for autoplay policies
    event.target.mute()
  }

  /**
   * Player state change callback
   */
  onPlayerStateChange(event) {
    // Handle state changes if needed
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
    if (this.player) {
      this.player.destroy()
      this.player = null
    }
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.isReady = false
    this.currentVideoId = null
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
