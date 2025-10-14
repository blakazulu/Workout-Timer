/**
 * YouTube Player - Core player class with API loading
 */

import { $ } from "../../utils/dom.js";

export class YouTubePlayer {
  constructor(elementId) {
    this.elementId = elementId;
    this.element = $(elementId);
    this.player = null;
    this.currentVideoId = null;
    this.isReady = false;
    this.apiLoaded = false;
    this.loadingOverlay = $("#loadingOverlay");
    this.videoTitle = "";
    this.videoChannel = "";
    this.videoId = "";
    this.originalUrl = ""; // Store original URL for history
    this.onEmbeddingError = null; // Callback for embedding errors (101/150)
    this._loadingTimeout = null;

    // Load YouTube IFrame API
    this.loadAPI();
  }

  /**
   * Load YouTube IFrame Player API
   */
  loadAPI() {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      this.apiLoaded = true;
      return;
    }

    // Load the API script
    if (!document.querySelector("script[src*=\"youtube.com/iframe_api\"]")) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // API ready callback
    window.onYouTubeIframeAPIReady = () => {
      this.apiLoaded = true;
      console.log("YouTube IFrame API loaded");
    };
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null
   */
  extractVideoId(url) {
    if (!url) return null;

    let videoId = "";

    // Handle youtube.com/watch?v= format
    if (url.includes("youtube.com/watch")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    }
    // Handle youtu.be/ format
    else if (url.includes("youtu.be/")) {
      videoId = url.split("/").pop()?.split("?")[0];
    }

    return videoId || null;
  }

  /**
   * Wait for API to load
   * @returns {Promise}
   */
  waitForAPI() {
    return new Promise((resolve) => {
      if (this.apiLoaded && window.YT) {
        resolve();
        return;
      }

      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          this.apiLoaded = true;
          clearInterval(checkAPI);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkAPI);
        resolve();
      }, 10000);
    });
  }

  /**
   * Get current YouTube player instance
   * @returns {YT.Player|null}
   */
  getPlayerInstance() {
    return this.player;
  }

  /**
   * Check if player is ready
   * @returns {boolean}
   */
  isPlayerReady() {
    return this.isReady;
  }

  /**
   * Get current video ID
   * @returns {string|null}
   */
  getCurrentVideoId() {
    return this.currentVideoId;
  }

  /**
   * Get video metadata
   * @returns {object}
   */
  getVideoMetadata() {
    return {
      title: this.videoTitle,
      channel: this.videoChannel,
      videoId: this.videoId,
      originalUrl: this.originalUrl
    };
  }
}
