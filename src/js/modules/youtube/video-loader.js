/**
 * Video Loader - Handles video loading, error handling, and player callbacks
 */

export class VideoLoader {
  constructor(player) {
    this.player = player;
  }

  /**
   * Load a YouTube video
   * @param {string} url - YouTube URL
   * @param {Function} onReadyCallback - Called when player is ready
   * @param {Function} onStateChangeCallback - Called when player state changes
   * @returns {Promise<boolean>} Success status
   */
  async loadVideo(url, onReadyCallback, onStateChangeCallback) {
    console.log("🎬 loadVideo called with URL:", url);

    const videoId = this.player.extractVideoId(url);
    console.log("📹 Extracted video ID:", videoId);

    if (!videoId || !this.player.element) {
      console.error("❌ Invalid video ID or player element missing");
      this.showError("Invalid YouTube URL. Please use a valid youtube.com or youtu.be link.");
      return false;
    }

    console.log("⏳ Showing loading overlay...");
    this.showLoading();

    try {
      // Wait for API to load
      console.log("⏳ Waiting for YouTube API...");
      await this.player.waitForAPI();
      console.log("✅ YouTube API ready");

      if (!window.YT || !window.YT.Player) {
        console.error("❌ YouTube API not available");
        this.showError("YouTube API failed to load. Check your connection.");
        return false;
      }

      this.player.currentVideoId = videoId;
      this.player.originalUrl = url; // Store original URL for history

      // Destroy existing player
      if (this.player.player) {
        console.log("🗑️ Destroying existing player...");
        this.player.player.destroy();
        this.player.player = null;
      }

      console.log("🎮 Creating new YouTube player with element ID:", this.player.element.id);
      console.log("📦 Player config:", {
        videoId,
        elementId: this.player.element.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          loop: 1,
          playlist: videoId,
          enablejsapi: 1
        }
      });

      // Create player using the element ID
      // The YouTube API will replace the div with an iframe
      this.player.player = new window.YT.Player(this.player.element.id, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          loop: 1,
          playlist: videoId,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => this.onPlayerReady(event, onReadyCallback),
          onStateChange: (event) => this.onPlayerStateChange(event, onStateChangeCallback),
          onError: (event) => this.onPlayerError(event)
        }
      });

      console.log("✅ YouTube Player constructor called successfully");

      // Set a timeout to hide loading overlay if player doesn't respond
      const loadingTimeout = setTimeout(() => {
        console.warn("⚠️ Loading timeout reached! Player did not respond.");
        if (this.player.loadingOverlay) {
          this.player.loadingOverlay.classList.add("hidden");
          console.log("🔻 Loading overlay hidden by timeout");
        }
      }, 15000); // 15 second timeout

      // Store timeout so we can clear it in onPlayerReady
      this.player._loadingTimeout = loadingTimeout;

      return true;
    } catch (error) {
      console.error("❌ Error in loadVideo:", error);
      this.showError("Failed to load YouTube video. Check your connection.");
      console.error("YouTube load error:", error);
      return false;
    }
  }

  /**
   * Player ready callback
   */
  onPlayerReady(event, callback) {
    console.log("🎉 onPlayerReady called!");
    this.player.isReady = true;

    // Clear loading timeout
    if (this.player._loadingTimeout) {
      clearTimeout(this.player._loadingTimeout);
      console.log("✅ Loading timeout cleared");
    }

    // Hide loading overlay
    console.log("🔻 Hiding loading overlay...");
    if (this.player.loadingOverlay) {
      this.player.loadingOverlay.classList.add("hidden");
      console.log("✅ Loading overlay hidden");
    } else {
      console.warn("⚠️ Loading overlay element not found");
    }

    // Hide background image when video is loaded
    const backgroundImage = document.querySelector(".background-image");
    if (backgroundImage) {
      backgroundImage.classList.add("hidden");
      console.log("✅ Background image hidden");
    }

    // Get video data
    console.log("📊 Getting video data...");
    try {
      const videoData = this.player.player.getVideoData();
      this.player.videoTitle = videoData.title || "YouTube Music";
      this.player.videoChannel = videoData.author || "Unknown Channel";
      this.player.videoId = videoData.video_id || this.player.currentVideoId;
      console.log("✅ Video data:", {
        title: this.player.videoTitle,
        channel: this.player.videoChannel,
        id: this.player.videoId
      });
    } catch (error) {
      console.error("❌ Error getting video data:", error);
      this.player.videoTitle = "YouTube Music";
      this.player.videoChannel = "Unknown Channel";
      this.player.videoId = this.player.currentVideoId;
    }

    // Mute by default for autoplay policies
    console.log("🔇 Muting player...");
    event.target.mute();

    // Update favorite button state (if favorites module is loaded)
    if (typeof window.updateFavoriteButton === "function") {
      window.updateFavoriteButton(this.player.videoId);
    }

    console.log("✅ Player setup complete!");

    // Call custom callback if provided
    if (callback) {
      callback(event);
    }
  }

  /**
   * Player state change callback
   */
  onPlayerStateChange(event, callback) {
    // Call custom callback if provided
    if (callback) {
      callback(event);
    }
  }

  /**
   * Player error callback
   */
  onPlayerError(event) {
    console.error("❌ YouTube player error event:", event);
    console.error("❌ Error code:", event.data);

    // Clear loading timeout
    if (this.player._loadingTimeout) {
      clearTimeout(this.player._loadingTimeout);
      console.log("✅ Loading timeout cleared (error)");
    }

    // Error codes:
    // 2 - Invalid parameter
    // 5 - HTML5 player error
    // 100 - Video not found or private
    // 101/150 - Video owner doesn't allow embedding

    const errorMessages = {
      2: "Invalid video parameter",
      5: "HTML5 player error",
      100: "Video not found or is private",
      101: "Video owner has disabled embedding",
      150: "Video owner has disabled embedding"
    };

    const errorMessage = errorMessages[event.data] || "Failed to play video. It may be restricted or unavailable.";
    console.error("❌ Error message:", errorMessage);

    // Hide loading overlay
    console.log("🔻 Hiding loading overlay due to error...");
    if (this.player.loadingOverlay) {
      this.player.loadingOverlay.classList.add("hidden");
    }

    // Check if this is an embedding restriction error (101 or 150)
    if ((event.data === 101 || event.data === 150) && this.player.onEmbeddingError) {
      console.log("🔄 Calling embedding error callback to load alternative song...");
      this.player.onEmbeddingError(errorMessage);
    } else {
      this.showError(errorMessage);
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    // Show full-screen loading overlay
    if (this.player.loadingOverlay) {
      this.player.loadingOverlay.classList.remove("hidden");
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    // Hide loading overlay
    if (this.player.loadingOverlay) {
      this.player.loadingOverlay.classList.add("hidden");
    }

    // Show error message to user (you can enhance this with a toast notification)
    console.error("YouTube Error:", message);
    alert(message);
  }
}
