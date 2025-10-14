/**
 * Favorites UI Initialization - Setup and badge management
 */

import {$} from "../../utils/dom.js";
import {getFavoritesCount, isFavorite, toggleFavorite} from "../favorites.js";

/**
 * Initialize favorites UI components
 * @param {Object} youtubeModule - YouTube player module instance
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Function to show notifications
 */
export function initFavoritesUI(youtubeModule, loadYouTubeModule, showNotification) {
  setupFavoriteButton(youtubeModule, showNotification);
  setupFavoritesBadge();
  updateFavoritesBadge();
}

/**
 * Set up the favorite button in music controls
 * @param {Object} youtubeModule - YouTube player module instance
 * @param {Function} showNotification - Function to show notifications
 */
function setupFavoriteButton(youtubeModule, showNotification) {
  const favoriteBtn = $("#musicFavoriteBtn");
  if (!favoriteBtn) return;

  favoriteBtn.addEventListener("click", () => {
    if (!youtubeModule || !youtubeModule.isReady) {
      showNotification("No song loaded", true);
      return;
    }

    try {
      // Extract song data with fallbacks for missing metadata
      console.log("🎵 Extracting song data from YouTube module:", {
        videoId: youtubeModule.videoId,
        currentVideoId: youtubeModule.currentVideoId,
        videoTitle: youtubeModule.videoTitle,
        videoChannel: youtubeModule.videoChannel,
        duration: youtubeModule.getDuration ? youtubeModule.getDuration() : "N/A",
        originalUrl: youtubeModule.originalUrl
      });

      const videoId = youtubeModule.videoId || youtubeModule.currentVideoId;
      const title = youtubeModule.videoTitle || "YouTube Music";
      const channel = youtubeModule.videoChannel || "Unknown Channel";
      const duration = youtubeModule.getDuration() || 0;
      const url = youtubeModule.originalUrl || `https://www.youtube.com/watch?v=${videoId}`;

      // Validate required fields
      if (!videoId) {
        console.error("❌ Cannot favorite: Video ID missing");
        showNotification("Cannot favorite: Video ID missing", true);
        return;
      }

      const songData = {
        videoId,
        title,
        channel,
        duration,
        url
      };

      console.log("💝 Attempting to favorite song with data:", songData);

      const isFavorited = toggleFavorite(songData);
      updateFavoriteButton(videoId);
      updateFavoritesBadge();

      if (isFavorited) {
        showNotification(`Added to favorites: ${title}`, false);
      } else {
        showNotification(`Removed from favorites: ${title}`, false);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      showNotification(error.message || "Failed to update favorites", true);
    }
  });
}

/**
 * Update favorite button state based on current song
 * @param {string} videoId - Current video ID
 */
export function updateFavoriteButton(videoId) {
  const favoriteBtn = $("#musicFavoriteBtn");
  if (!favoriteBtn) return;

  const favoriteIcon = favoriteBtn.querySelector(".favorite-icon");
  const favoritedIcon = favoriteBtn.querySelector(".favorited-icon");

  const isCurrentlyFavorited = isFavorite(videoId);

  if (isCurrentlyFavorited) {
    favoriteIcon.classList.add("hidden");
    favoritedIcon.classList.remove("hidden");
    favoriteBtn.classList.add("favorited");
    favoriteBtn.title = "Remove from favorites";
  } else {
    favoriteIcon.classList.remove("hidden");
    favoritedIcon.classList.add("hidden");
    favoriteBtn.classList.remove("favorited");
    favoriteBtn.title = "Add to favorites";
  }
}

/**
 * Set up favorites badge
 */
function setupFavoritesBadge() {
  updateFavoritesBadge();
}

/**
 * Update favorites count badge
 */
export function updateFavoritesBadge() {
  const badge = $("#favoritesBadge");
  if (!badge) return;

  const count = getFavoritesCount();

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}
