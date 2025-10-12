/**
 * YouTube Module - YouTube video integration
 */

import { $ } from '../utils/dom.js'

export class YouTubePlayer {
  constructor(containerId) {
    this.containerId = containerId
    this.container = $(containerId)
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
   * Load a YouTube video
   * @param {string} url - YouTube URL
   * @returns {boolean} Success status
   */
  loadVideo(url) {
    const videoId = this.extractVideoId(url)

    if (!videoId || !this.container) {
      this.showError('Invalid YouTube URL. Please use a valid youtube.com or youtu.be link.')
      return false
    }

    // Show loading state
    this.showLoading()

    try {
      this.container.innerHTML = `
        <iframe width="100%" height="200"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          onload="this.classList.add('loaded')"
          onerror="this.classList.add('error')"></iframe>`
      return true
    } catch (error) {
      this.showError('Failed to load YouTube video. Check your connection.')
      console.error('YouTube load error:', error)
      return false
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.container) {
      this.container.innerHTML = '<div class="youtube-loading">Loading video...</div>'
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    if (this.container) {
      this.container.innerHTML = `<div class="youtube-error">${message}</div>`
      setTimeout(() => this.clear(), 3000)
    }
  }

  /**
   * Clear the video player
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = ''
    }
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
