/**
 * Library UI Module
 * Handles music library popover, history display, and favorites management
 */

import {$} from "../utils/dom.js";
import {getMostPlayedSongs, getSongHistory} from "../modules/storage.js";
import {getTimer} from "../modules/timer.js";
import {
  highlightFavoritesInHistory,
  renderFavorites,
  setupFavoritesActions,
  updateFavoriteButton,
  updateFavoritesBadge
} from "../modules/favorites-ui.js";
import {removeFromFavorites} from "../modules/favorites.js";
import {createFavoriteButtonHTML, setupFavoriteButtons} from "../utils/favorite-button.js";

/**
 * Set up music library popover
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Notification display function
 */
export function setupMusicLibrary(loadYouTubeModule, showNotification) {
  const musicLibraryPopover = $("#musicLibraryPopover");
  const libraryContent = $("#historyContent");
  const libraryTabs = document.querySelectorAll(".history-tab");
  const libraryActions = $("#historyActions");

  if (!musicLibraryPopover || !libraryContent) return;

  let currentTab = "recent";

  // Render library when popover opens
  musicLibraryPopover.addEventListener("toggle", (e) => {
    if (e.newState === "open") {
      renderLibrary(currentTab);
    }
  });

  // Tab switching
  libraryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Update active state
      libraryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Switch content
      currentTab = tab.dataset.tab;
      renderLibrary(currentTab);
    });
  });

  // Setup favorites actions (random, export, import)
  setupFavoritesActions(loadYouTubeModule, showNotification, () => renderLibrary(currentTab));

  // Setup favorite buttons event delegation ONCE for the library content
  // This handles favorite button clicks in recent/top tabs
  setupFavoriteButtons(libraryContent, showNotification, ({videoId, isFavorited}) => {
    // Update favorite button in music controls if this is the currently playing song
    if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
      updateFavoriteButton(videoId);
    }
    // Refresh the library display to show/hide badges
    highlightFavoritesInHistory();
  });

  // Setup click handlers for library items using event delegation
  libraryContent.addEventListener("click", async (e) => {
    // Handle remove button clicks (favorites tab)
    const removeBtn = e.target.closest(".song-card-remove");
    if (removeBtn) {
      e.stopPropagation();
      const videoId = removeBtn.dataset.videoId;
      const favoriteItem = removeBtn.closest(".favorite-item");
      const title = favoriteItem ? favoriteItem.dataset.title : "Unknown";

      removeFromFavorites(videoId);
      updateFavoritesBadge();
      renderLibrary(currentTab);
      showNotification(`Removed from favorites: ${title}`, false);

      // Update favorite button if this is the currently playing song
      if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
        updateFavoriteButton(videoId);
      }
      return;
    }

    // Handle favorite item clicks (favorites tab)
    const favoriteItem = e.target.closest(".favorite-item");
    if (favoriteItem && currentTab === "favorites") {
      const url = favoriteItem.dataset.url;

      // Close popover
      musicLibraryPopover.hidePopover();

      // Load video
      const youtubeUrl = $("#youtubeUrl");
      if (youtubeUrl) {
        youtubeUrl.value = url;
      }

      const youtube = await loadYouTubeModule();
      await youtube.loadVideo(url);

      // Connect YouTube player to timer
      const timer = getTimer();
      timer.setYouTubePlayer(youtube);
      return;
    }

    // Handle song card clicks (recent/top tabs)
    const songCard = e.target.closest(".song-card");
    if (songCard && !favoriteItem) {
      // Don't trigger if clicking favorite button
      if (e.target.closest("[data-action='toggle-favorite']")) {
        return;
      }

      const url = songCard.dataset.url;

      // Close popover
      musicLibraryPopover.hidePopover();

      // Load video
      const youtubeUrl = $("#youtubeUrl");
      if (youtubeUrl) {
        youtubeUrl.value = url;
      }

      const youtube = await loadYouTubeModule();
      await youtube.loadVideo(url);

      // Connect YouTube player to timer
      const timer = getTimer();
      timer.setYouTubePlayer(youtube);
    }
  });

  /**
   * Render library items
   * @param {string} tab - 'recent', 'top', or 'favorites'
   */
  function renderLibrary(tab) {
    // Show/hide actions bar based on tab
    if (libraryActions) {
      if (tab === "favorites") {
        libraryActions.classList.remove("hidden");
      } else {
        libraryActions.classList.add("hidden");
      }
    }

    // Render favorites tab differently
    if (tab === "favorites") {
      libraryContent.innerHTML = renderFavorites(loadYouTubeModule, showNotification);
      return;
    }

    // Library rendering for 'recent' and 'top' tabs
    const songs = tab === "recent" ? getSongHistory() : getMostPlayedSongs(20);

    if (songs.length === 0) {
      libraryContent.innerHTML = "<div class=\"history-empty\">No songs played yet</div>";
      return;
    }

    libraryContent.innerHTML = songs.map(song => {
      const duration = formatDuration(song.duration);
      const thumbnail = song.thumbnail
        ? `<img src="${song.thumbnail}" alt="${escapeHtml(song.title)}" class="song-card-thumbnail" loading="lazy">`
        : `<div class="song-card-no-thumbnail">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <polygon points="5 3 19 12 5 21 5 3"></polygon>
             </svg>
           </div>`;

      return `
        <div class="song-card" data-url="${escapeHtml(song.url)}" data-video-id="${escapeHtml(song.videoId)}" data-duration="${song.duration}" data-title="${escapeHtml(song.title)}" data-channel="${escapeHtml(song.channel || "Unknown Channel")}" data-thumbnail="${escapeHtml(song.thumbnail || "")}">
          ${thumbnail}
          <div class="song-card-bottom">
            <div class="song-card-info">
              <div class="song-card-title">${escapeHtml(song.title)}</div>
              <div class="song-card-channel">${escapeHtml(song.channel || "Unknown Channel")} • ${song.playCount} plays</div>
            </div>
            <div class="song-card-controls">
              ${createFavoriteButtonHTML(song.videoId, {size: "small", className: "song-card-favorite"})}
              <div class="song-card-duration">${duration}</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Highlight favorited songs in library
    highlightFavoritesInHistory();
  }
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
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
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
