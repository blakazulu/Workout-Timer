/**
 * UI Controls - Handles music controls display, progress bar, and UI synchronization
 */

import {$} from "../../utils/dom.js";

export class UIControls {
  constructor(player, playbackControls) {
    this.player = player;
    this.playbackControls = playbackControls;
    this.progressInterval = null;
  }

  /**
   * Show music controls
   */
  showMusicControls() {
    const musicControls = $("#musicControls");
    const musicTitle = $("#musicTitle");
    const musicTooltip = $("#musicTooltip");
    const musicInfoBtn = $("#musicInfoBtn");

    if (musicControls && musicTitle) {
      // Truncate title to 20 characters
      const displayTitle = this.player.videoTitle.length > 20
        ? this.player.videoTitle.substring(0, 20) + "..."
        : this.player.videoTitle;

      musicTitle.textContent = displayTitle;

      // Build detailed tooltip
      if (musicTooltip) {
        const duration = this.playbackControls.getDuration();
        const durationFormatted = this.formatTime(duration);

        musicTooltip.innerHTML = `
          <div class="music-tooltip-title">${this.escapeHtml(this.player.videoTitle)}</div>
          <div class="music-tooltip-info">
            <div class="music-tooltip-row">
              <span class="music-tooltip-label">Duration:</span>
              <span class="music-tooltip-value">${durationFormatted}</span>
            </div>
            <div class="music-tooltip-row">
              <span class="music-tooltip-label">Video ID:</span>
              <span class="music-tooltip-value">${this.player.videoId}</span>
            </div>
          </div>
        `;
      }

      // Always show info button
      if (musicInfoBtn) {
        musicInfoBtn.style.display = "flex";
      }

      musicControls.classList.remove("hidden");
      this.startProgressUpdates();
    }
  }

  /**
   * Hide music controls
   */
  hideMusicControls() {
    const musicControls = $("#musicControls");
    if (musicControls) {
      musicControls.classList.add("hidden");
      this.stopProgressUpdates();
    }
  }

  /**
   * Start progress bar updates
   */
  startProgressUpdates() {
    this.stopProgressUpdates();
    this.updateProgress();
    this.progressInterval = setInterval(() => this.updateProgress(), 500);
  }

  /**
   * Stop progress bar updates
   */
  stopProgressUpdates() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    const currentTime = this.playbackControls.getCurrentTime();
    const duration = this.playbackControls.getDuration();

    if (duration > 0) {
      const percentage = (currentTime / duration) * 100;

      const progressFill = $("#progressBarFill");
      const progressHandle = $("#progressBarHandle");
      const currentTimeEl = $("#musicCurrentTime");
      const durationEl = $("#musicDuration");

      if (progressFill) progressFill.style.width = `${percentage}%`;
      if (progressHandle) progressHandle.style.left = `${percentage}%`;
      if (currentTimeEl) currentTimeEl.textContent = this.formatTime(currentTime);
      if (durationEl) durationEl.textContent = this.formatTime(duration);
    }
  }

  /**
   * Update play/pause button state
   */
  updatePlayPauseButton() {
    const musicBtn = $("#musicPlayPauseBtn");
    if (!musicBtn) return;

    const playIcon = musicBtn.querySelector(".play-icon");
    const pauseIcon = musicBtn.querySelector(".pause-icon");

    if (this.playbackControls.isPlaying()) {
      if (playIcon) playIcon.classList.add("hidden");
      if (pauseIcon) pauseIcon.classList.remove("hidden");
    } else {
      if (playIcon) playIcon.classList.remove("hidden");
      if (pauseIcon) pauseIcon.classList.add("hidden");
    }
  }

  /**
   * Clear the video player and UI
   */
  clear() {
    this.stopProgressUpdates();
    this.hideMusicControls();

    if (this.player.player) {
      this.player.player.destroy();
      this.player.player = null;
    }

    // The YouTube API will have replaced our div with an iframe
    // We need to recreate the div element
    if (this.player.element) {
      const parent = this.player.element.parentNode;
      const newDiv = document.createElement("div");
      newDiv.id = this.player.element.id;
      newDiv.className = this.player.element.className;
      parent.replaceChild(newDiv, this.player.element);
      this.player.element = newDiv;
    }

    // Show background image again when video is cleared
    const backgroundImage = document.querySelector(".background-image");
    if (backgroundImage) {
      backgroundImage.classList.remove("hidden");
    }

    this.player.isReady = false;
    this.player.currentVideoId = null;
    this.player.videoTitle = "";
    this.player.videoChannel = "";
    this.player.videoId = "";
  }

  /**
   * Format time in seconds to MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
