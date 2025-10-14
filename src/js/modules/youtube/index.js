/**
 * YouTube Module - Public API
 * Composes player, video loader, playback controls, and UI controls
 */

import { YouTubePlayer } from "./player.js";
import { VideoLoader } from "./video-loader.js";
import { PlaybackControls } from "./playback-controls.js";
import { UIControls } from "./ui-controls.js";

/**
 * YouTubeModule - Facade that exposes all YouTube functionality
 */
class YouTubeModule {
  constructor(elementId) {
    // Create core components
    this.player = new YouTubePlayer(elementId);
    this.videoLoader = new VideoLoader(this.player);
    this.playbackControls = new PlaybackControls(this.player);
    this.uiControls = new UIControls(this.player, this.playbackControls);
  }

  /**
   * Load a YouTube video
   * @param {string} url - YouTube URL
   * @returns {Promise<boolean>} Success status
   */
  async loadVideo(url) {
    return await this.videoLoader.loadVideo(
      url,
      () => {
        // onReady callback
        this.uiControls.showMusicControls();
        this.uiControls.updatePlayPauseButton();
      },
      () => {
        // onStateChange callback
        this.uiControls.updatePlayPauseButton();
      }
    );
  }

  /**
   * Play the video
   */
  play() {
    this.playbackControls.play(() => {
      this.uiControls.updatePlayPauseButton();
    });
  }

  /**
   * Pause the video
   */
  pause() {
    this.playbackControls.pause(() => {
      this.uiControls.updatePlayPauseButton();
    });
  }

  /**
   * Stop the video
   */
  stop() {
    this.playbackControls.stop();
  }

  /**
   * Set video volume
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    this.playbackControls.setVolume(volume);
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-100)
   */
  getVolume() {
    return this.playbackControls.getVolume();
  }

  /**
   * Get video duration in seconds
   * @returns {number} Duration in seconds
   */
  getDuration() {
    return this.playbackControls.getDuration();
  }

  /**
   * Get current time in seconds
   * @returns {number} Current time in seconds
   */
  getCurrentTime() {
    return this.playbackControls.getCurrentTime();
  }

  /**
   * Seek to specific time
   * @param {number} seconds - Time in seconds
   */
  seekTo(seconds) {
    this.playbackControls.seekTo(seconds);
  }

  /**
   * Check if video is playing
   * @returns {boolean} True if playing
   */
  isPlaying() {
    return this.playbackControls.isPlaying();
  }

  /**
   * Clear the video player
   */
  clear() {
    this.uiControls.clear();
  }

  /**
   * Show music controls
   */
  showMusicControls() {
    this.uiControls.showMusicControls();
  }

  /**
   * Hide music controls
   */
  hideMusicControls() {
    this.uiControls.hideMusicControls();
  }

  /**
   * Update play/pause button state
   */
  updatePlayPauseButton() {
    this.uiControls.updatePlayPauseButton();
  }

  /**
   * Set embedding error callback
   * @param {Function} callback - Callback function for embedding errors
   */
  set onEmbeddingError(callback) {
    this.player.onEmbeddingError = callback;
  }

  /**
   * Get embedding error callback
   * @returns {Function} Callback function
   */
  get onEmbeddingError() {
    return this.player.onEmbeddingError;
  }

  /**
   * Get video metadata
   * @returns {object} Video metadata
   */
  getMetadata() {
    return this.player.getVideoMetadata();
  }

  /**
   * Get current video ID
   * @returns {string|null}
   */
  get videoId() {
    return this.player.videoId;
  }

  /**
   * Get video title
   * @returns {string}
   */
  get videoTitle() {
    return this.player.videoTitle;
  }

  /**
   * Get video channel
   * @returns {string}
   */
  get videoChannel() {
    return this.player.videoChannel;
  }

  /**
   * Check if player is ready
   * @returns {boolean}
   */
  get isReady() {
    return this.player.isReady;
  }

  /**
   * Get current video ID
   * @returns {string|null}
   */
  get currentVideoId() {
    return this.player.currentVideoId;
  }

  /**
   * Get original URL
   * @returns {string}
   */
  get originalUrl() {
    return this.player.originalUrl;
  }
}

// Singleton instance
let youtubeModule = null;

/**
 * Initialize YouTube module
 * @param {string} elementId - Container element ID
 * @returns {YouTubeModule}
 */
export function initYouTube(elementId = "#youtube-player-iframe") {
  if (!youtubeModule) {
    youtubeModule = new YouTubeModule(elementId);
  }
  return youtubeModule;
}

/**
 * Get YouTube module instance
 * @returns {YouTubeModule|null}
 */
export function getYouTube() {
  return youtubeModule;
}

// For backward compatibility, also export the class
export { YouTubeModule };
