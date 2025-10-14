/**
 * Playback Controls - Handles play, pause, stop, volume, and seeking
 */

import { saveSongToHistory } from "../storage.js";

export class PlaybackControls {
  constructor(player) {
    this.player = player;
  }

  /**
   * Play the video
   * @param {Function} onPlayCallback - Optional callback after play
   */
  play(onPlayCallback) {
    if (this.player.player && this.player.isReady) {
      try {
        this.player.player.playVideo();
        // Unmute when user explicitly starts playback
        this.player.player.unMute();

        // Save to history when user actually plays (works on desktop and mobile)
        try {
          saveSongToHistory({
            videoId: this.player.videoId,
            title: this.player.videoTitle,
            channel: this.player.videoChannel,
            duration: this.getDuration(),
            url: this.player.originalUrl
          });
        } catch (error) {
          console.error("Failed to save song to history:", error);
        }

        // Call callback after short delay to allow state to update
        if (onPlayCallback) {
          setTimeout(() => onPlayCallback(), 100);
        }
      } catch (error) {
        console.error("Failed to play video:", error);
      }
    }
  }

  /**
   * Pause the video
   * @param {Function} onPauseCallback - Optional callback after pause
   */
  pause(onPauseCallback) {
    if (this.player.player && this.player.isReady) {
      try {
        this.player.player.pauseVideo();

        // Call callback after short delay to allow state to update
        if (onPauseCallback) {
          setTimeout(() => onPauseCallback(), 100);
        }
      } catch (error) {
        console.error("Failed to pause video:", error);
      }
    }
  }

  /**
   * Stop the video
   */
  stop() {
    if (this.player.player && this.player.isReady) {
      try {
        this.player.player.stopVideo();
      } catch (error) {
        console.error("Failed to stop video:", error);
      }
    }
  }

  /**
   * Set video volume
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    if (this.player.player && this.player.isReady) {
      try {
        this.player.player.setVolume(volume);
      } catch (error) {
        console.error("Failed to set volume:", error);
      }
    }
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-100)
   */
  getVolume() {
    if (this.player.player && this.player.isReady) {
      try {
        return this.player.player.getVolume();
      } catch (error) {
        console.error("Failed to get volume:", error);
        return 100;
      }
    }
    return 100;
  }

  /**
   * Get video duration in seconds
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (this.player.player && this.player.isReady && typeof this.player.player.getDuration === "function") {
      try {
        return this.player.player.getDuration();
      } catch (error) {
        console.error("Failed to get duration:", error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * Get current time in seconds
   * @returns {number} Current time in seconds
   */
  getCurrentTime() {
    if (this.player.player && this.player.isReady && typeof this.player.player.getCurrentTime === "function") {
      try {
        return this.player.player.getCurrentTime();
      } catch (error) {
        console.error("Failed to get current time:", error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * Seek to specific time
   * @param {number} seconds - Time in seconds
   */
  seekTo(seconds) {
    if (this.player.player && this.player.isReady) {
      try {
        this.player.player.seekTo(seconds, true);
      } catch (error) {
        console.error("Failed to seek:", error);
      }
    }
  }

  /**
   * Check if video is playing
   * @returns {boolean} True if playing
   */
  isPlaying() {
    if (this.player.player && this.player.isReady && typeof this.player.player.getPlayerState === "function") {
      try {
        return this.player.player.getPlayerState() === 1; // 1 = playing
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
