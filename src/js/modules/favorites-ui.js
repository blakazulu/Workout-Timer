/**
 * Favorites UI Module - Handles all UI interactions for favorites feature
 * This module integrates favorites functionality with the existing app UI
 */

import {$} from "../utils/dom.js";
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  getFavoritesCount,
  getShuffledFavorites,
  downloadFavoritesFile,
  uploadFavoritesFile,
  getRandomFavorite
} from "./favorites.js";

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
        duration: youtubeModule.getDuration ? youtubeModule.getDuration() : 'N/A',
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

/**
 * Render favorites tab content
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Function to show notifications
 * @returns {string} HTML string for favorites content
 */
export function renderFavorites(loadYouTubeModule, showNotification) {
  const favorites = getFavorites();

  console.log(`🎨 Rendering ${favorites.length} favorites for display`);

  if (favorites.length === 0) {
    console.log("📭 No favorites to display");
    return '<div class="history-empty">No favorites yet<br><small>Click the heart icon while playing a song to add it to favorites</small></div>';
  }

  return favorites.map((song, index) => {
    // Extract and validate song data with fallbacks
    const title = song.title || "Unknown Title";
    const channel = song.channel || "Unknown Channel";
    const duration = formatDuration(song.duration);
    const videoId = song.videoId || "";
    const url = song.url || `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`  ${index + 1}. ${title} - ${channel} (${videoId})`);

    const thumbnail = song.thumbnail
      ? `<img src="${song.thumbnail}" alt="${escapeHtml(title)}" class="history-item-thumbnail" loading="lazy">`
      : `<div class="history-item-no-thumbnail">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <polygon points="5 3 19 12 5 21 5 3"></polygon>
           </svg>
         </div>`;

    const favoritedAt = song.favoritedAt ? new Date(song.favoritedAt).toLocaleDateString() : "Unknown date";

    return `
      <div class="history-item favorite-item" data-url="${escapeHtml(url)}" data-video-id="${escapeHtml(videoId)}" data-title="${escapeHtml(title)}" data-channel="${escapeHtml(channel)}">
        ${thumbnail}
        <div class="history-item-info">
          <div class="history-item-title">${escapeHtml(title)}</div>
          <div class="history-item-meta">
            <div class="history-item-favorite-icon">
              <i class="ph-bold ph-heart-fill"></i>
            </div>
            <span>Added ${favoritedAt}</span>
            <span>•</span>
            <span>${duration}</span>
          </div>
        </div>
        <button class="history-item-remove" data-video-id="${escapeHtml(videoId)}" title="Remove from favorites">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>
    `;
  }).join("");
}

/**
 * Set up favorites tab action buttons
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Function to show notifications
 * @param {Function} updateCurrentTab - Function to update current tab display
 */
export function setupFavoritesActions(loadYouTubeModule, showNotification, updateCurrentTab) {
  const shuffleBtn = $("#shuffleFavoritesBtn");
  const exportBtn = $("#exportFavoritesBtn");
  const importBtn = $("#importFavoritesBtn");

  // Shuffle favorites
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", async () => {
      const favorites = getShuffledFavorites();

      if (favorites.length === 0) {
        showNotification("No favorites to shuffle", true);
        return;
      }

      // Get first song from shuffled list
      const firstSong = favorites[0];

      // Close popover
      const musicLibraryPopover = $("#musicLibraryPopover");
      if (musicLibraryPopover) {
        musicLibraryPopover.hidePopover();
      }

      // Load the song
      const youtubeUrl = $("#youtubeUrl");
      if (youtubeUrl) {
        youtubeUrl.value = firstSong.url;
      }

      const youtube = await loadYouTubeModule();
      await youtube.loadVideo(firstSong.url);

      // Connect YouTube player to timer
      const timer = window.getTimer && window.getTimer();
      if (timer) {
        timer.setYouTubePlayer(youtube);
      }

      showNotification(`Shuffling favorites: ${firstSong.title}`, false);
    });
  }

  // Export favorites
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      try {
        downloadFavoritesFile();
        showNotification("Favorites exported successfully", false);
      } catch (error) {
        console.error("Export failed:", error);
        showNotification("Failed to export favorites", true);
      }
    });
  }

  // Import favorites
  if (importBtn) {
    importBtn.addEventListener("click", async () => {
      try {
        const result = await uploadFavoritesFile(true); // merge = true

        if (result.success) {
          updateFavoritesBadge();
          updateCurrentTab(); // Refresh current tab display

          let message = `Imported ${result.imported} favorites`;
          if (result.skipped > 0) {
            message += `, ${result.skipped} skipped (duplicates)`;
          }
          if (result.errors.length > 0) {
            message += `, ${result.errors.length} errors`;
          }

          showNotification(message, false);

          // Show detailed errors if any
          if (result.errors.length > 0) {
            console.warn("Import errors:", result.errors);
          }
        } else {
          showNotification(`Import failed: ${result.errors.join(", ")}`, true);
        }
      } catch (error) {
        console.error("Import failed:", error);
        showNotification("Failed to import favorites", true);
      }
    });
  }
}

/**
 * Check if current song is favorited and update highlighted status in history
 * @param {string} videoId - Video ID to check
 */
export function highlightFavoritesInHistory(videoId) {
  // Query both .history-item (for favorites tab) and .music-selection-item (for recent/top tabs)
  const historyItems = document.querySelectorAll(".history-item, .music-selection-item");

  historyItems.forEach(item => {
    const itemVideoId = item.dataset.videoId;

    if (itemVideoId && isFavorite(itemVideoId)) {
      item.classList.add("is-favorited");

      // Add heart icon if not already present (only for .history-item in favorites tab)
      if (item.classList.contains("history-item") && !item.querySelector(".history-item-favorite-badge")) {
        const favoriteBadge = document.createElement("div");
        favoriteBadge.className = "history-item-favorite-badge";
        favoriteBadge.innerHTML = '<i class="ph-bold ph-heart-fill"></i>';
        favoriteBadge.title = "Favorited";

        const info = item.querySelector(".history-item-info");
        if (info) {
          info.appendChild(favoriteBadge);
        }
      }
    } else {
      item.classList.remove("is-favorited");

      // Remove heart icon if present
      const favoriteBadge = item.querySelector(".history-item-favorite-badge");
      if (favoriteBadge) {
        favoriteBadge.remove();
      }
    }
  });
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  // Handle invalid or missing duration
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return "0:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
