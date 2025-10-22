/**
 * Favorite Button Utility
 * Provides reusable functions for creating and managing favorite buttons in song lists
 */

import {isFavorite, toggleFavorite} from "../modules/favorites.js";
import {updateFavoriteButton, updateFavoritesBadge} from "../modules/favorites-ui.js";

/**
 * Create a favorite button HTML element
 * @param {string} videoId - YouTube video ID
 * @param {Object} options - Configuration options
 * @param {string} options.size - Button size ('small', 'medium', 'large')
 * @param {string} options.className - Additional CSS classes
 * @returns {string} HTML string for favorite button
 */
export function createFavoriteButtonHTML(videoId, options = {}) {
  const {size = "small", className = ""} = options;
  const favorited = isFavorite(videoId);
  const favoritedClass = favorited ? "favorited" : "";
  const sizeClass = `favorite-btn-${size}`;

  const iconSrc = favorited
    ? "/svg-icons/bookmark-favorite/favourite-filled.svg"
    : "/svg-icons/bookmark-favorite/favourite.svg";

  return `
    <button class="song-favorite-btn ${sizeClass} ${favoritedClass} ${className}"
            data-video-id="${escapeHtml(videoId)}"
            data-action="toggle-favorite"
            title="${favorited ? "Remove from favorites" : "Add to favorites"}"
            aria-label="${favorited ? "Remove from favorites" : "Add to favorites"}">
      <img src="${iconSrc}" class="svg-icon" alt="Favorite" />
    </button>
  `;
}

/**
 * Set up event listeners for favorite buttons in a container
 * @param {HTMLElement} container - Container element with favorite buttons
 * @param {Function} showNotification - Notification function
 * @param {Function} onToggle - Optional callback after toggle (receives {videoId, isFavorited, songData})
 */
export function setupFavoriteButtons(container, showNotification, onToggle = null) {
  if (!container) return;

  // Event delegation for favorite buttons
  container.addEventListener("click", async (e) => {
    const button = e.target.closest("[data-action='toggle-favorite']");
    if (!button) return;

    // Prevent event propagation to parent elements
    e.stopPropagation();
    e.preventDefault();

    const videoId = button.dataset.videoId;
    if (!videoId) return;

    // Get song data from parent element (skip the button itself and find the container)
    const songElement = button.closest(".song-card, .search-dropdown-item");
    if (!songElement) {
      showNotification("Unable to favorite: song data not found", true);
      return;
    }

    try {
      // Extract song data from element
      const songData = extractSongData(songElement);

      if (!songData.videoId) {
        showNotification("Unable to favorite: missing video ID", true);
        return;
      }

      // Toggle favorite status
      const isFavorited = toggleFavorite(songData);

      // Update this button's state
      updateButtonState(button, isFavorited);

      // Update all other instances of this song's favorite button
      syncFavoriteButtons(videoId, isFavorited);

      // Update the main music control favorite button if this is the current song
      if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
        updateFavoriteButton(videoId);
      }

      // Update badge count
      updateFavoritesBadge();

      // Show notification
      if (isFavorited) {
        showNotification(`Added to favorites: ${songData.title}`, false);
      } else {
        showNotification(`Removed from favorites: ${songData.title}`, false);
      }

      // Call optional callback
      if (typeof onToggle === "function") {
        onToggle({videoId, isFavorited, songData});
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      showNotification(error.message || "Failed to update favorites", true);
    }
  });
}

/**
 * Extract song data from a DOM element
 * @param {HTMLElement} element - Song element
 * @returns {Object} Song data object
 */
function extractSongData(element) {
  const url = element.dataset.url || "";
  const videoId = element.dataset.videoId || extractVideoIdFromUrl(url);

  // Prefer data attributes for clean data (important for library items that have "• X plays" in text)
  // Fall back to parsing DOM elements if data attributes are missing
  const title = element.dataset.title ||
    element.querySelector(".song-card-title, .search-dropdown-item-title")?.textContent.trim() ||
    "Unknown Title";

  const channel = element.dataset.channel ||
    element.querySelector(".song-card-channel, .search-dropdown-item-artist, .search-dropdown-item-description")?.textContent.trim() ||
    "Unknown Channel";

  // Try to extract duration (it might be in text like "3:45" or as a data attribute)
  let duration = 0;
  if (element.dataset.duration) {
    duration = parseInt(element.dataset.duration, 10);
  } else {
    const durationEl = element.querySelector(".song-card-duration, .search-dropdown-item-duration");
    if (durationEl) {
      const durationText = durationEl.textContent.trim();
      duration = parseDurationString(durationText);
    }
  }

  return {
    videoId,
    title,
    channel,
    duration,
    url: url || `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: element.dataset.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  };
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string} Video ID or empty string
 */
function extractVideoIdFromUrl(url) {
  if (!url) return "";

  try {
    // Handle youtube.com/watch?v= format
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v") || "";
    }

    // Handle youtu.be/ format
    if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match ? match[1] : "";
    }

    // Handle youtube.com/embed/ format
    if (url.includes("youtube.com/embed/")) {
      const match = url.match(/youtube\.com\/embed\/([^?&]+)/);
      return match ? match[1] : "";
    }
  } catch (error) {
    console.error("Failed to extract video ID:", error);
  }

  return "";
}

/**
 * Parse duration string (MM:SS or HH:MM:SS) to seconds
 * @param {string} durationStr - Duration string
 * @returns {number} Duration in seconds
 */
function parseDurationString(durationStr) {
  if (!durationStr) return 0;

  const parts = durationStr.split(":").map(p => parseInt(p.trim(), 10));

  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Update a favorite button's visual state
 * @param {HTMLElement} button - Button element
 * @param {boolean} isFavorited - Whether the song is favorited
 */
function updateButtonState(button, isFavorited) {
  if (isFavorited) {
    button.classList.add("favorited");
    button.title = "Remove from favorites";
    button.setAttribute("aria-label", "Remove from favorites");

    // Switch to filled icon
    const img = button.querySelector("img.svg-icon");
    if (img) {
      img.src = "/svg-icons/bookmark-favorite/favourite-filled.svg";
    }
  } else {
    button.classList.remove("favorited");
    button.title = "Add to favorites";
    button.setAttribute("aria-label", "Add to favorites");

    // Switch to outline icon
    const img = button.querySelector("img.svg-icon");
    if (img) {
      img.src = "/svg-icons/bookmark-favorite/favourite.svg";
    }
  }
}

/**
 * Synchronize all favorite buttons for a given video ID
 * @param {string} videoId - Video ID to sync
 * @param {boolean} isFavorited - New favorite status
 */
function syncFavoriteButtons(videoId, isFavorited) {
  const buttons = document.querySelectorAll(`[data-action="toggle-favorite"][data-video-id="${videoId}"]`);

  buttons.forEach(button => {
    updateButtonState(button, isFavorited);
  });

  // Also update any favorite badges in history items
  const historyItems = document.querySelectorAll(`[data-video-id="${videoId}"]`);
  historyItems.forEach(item => {
    if (isFavorited) {
      item.classList.add("is-favorited");
    } else {
      item.classList.remove("is-favorited");
    }
  });
}

/**
 * Update all favorite buttons in the document based on current state
 * Useful for refreshing after bulk operations or page navigation
 */
export function refreshAllFavoriteButtons() {
  const buttons = document.querySelectorAll("[data-action='toggle-favorite']");

  buttons.forEach(button => {
    const videoId = button.dataset.videoId;
    if (videoId) {
      const favorited = isFavorite(videoId);
      updateButtonState(button, favorited);
    }
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Add favorite button to existing song element
 * @param {HTMLElement} songElement - Song element
 * @param {string} videoId - Video ID
 * @param {Object} options - Button options
 * @returns {HTMLElement} The created button element
 */
export function addFavoriteButtonToElement(songElement, videoId, options = {}) {
  if (!songElement || !videoId) return null;

  // Check if button already exists
  if (songElement.querySelector("[data-action='toggle-favorite']")) {
    return null;
  }

  const buttonHTML = createFavoriteButtonHTML(videoId, options);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = buttonHTML;
  const button = tempDiv.firstElementChild;

  // Find appropriate place to insert button (depends on element structure)
  const info = songElement.querySelector(".song-card-info, .search-dropdown-item-content");
  if (info) {
    info.appendChild(button);
  } else {
    songElement.appendChild(button);
  }

  return button;
}
