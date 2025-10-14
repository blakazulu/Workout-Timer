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

  // Setup favorites actions (shuffle, export, import)
  setupFavoritesActions(loadYouTubeModule, showNotification, () => renderLibrary(currentTab));

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

      // Add click handlers for favorite items
      document.querySelectorAll(".favorite-item").forEach(item => {
        const url = item.dataset.url;

        // Click on item to play
        item.addEventListener("click", async (e) => {
          // Don't trigger if clicking remove button
          if (e.target.closest(".history-item-remove")) return;

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
        });

        // Remove button handler
        const removeBtn = item.querySelector(".history-item-remove");
        if (removeBtn) {
          removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const videoId = removeBtn.dataset.videoId;

            if (confirm("Remove this song from favorites?")) {
              removeFromFavorites(videoId);
              updateFavoritesBadge();
              renderLibrary(currentTab);
              showNotification("Removed from favorites", false);

              // Update favorite button if this is the currently playing song
              if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
                updateFavoriteButton(videoId);
              }
            }
          });
        }
      });

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
        ? `<img src="${song.thumbnail}" alt="${escapeHtml(song.title)}" class="music-selection-item-thumbnail" loading="lazy">`
        : `<div class="music-selection-item-thumbnail" style="background: rgba(100, 100, 255, 0.1); display: flex; align-items: center; justify-content: center;">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 40px; height: 40px; opacity: 0.3;">
               <polygon points="5 3 19 12 5 21 5 3"></polygon>
             </svg>
           </div>`;

      return `
        <div class="music-selection-item" data-url="${escapeHtml(song.url)}" data-video-id="${escapeHtml(song.videoId)}" data-duration="${song.duration}">
          ${thumbnail}
          <div class="music-selection-item-info">
            <div class="music-selection-item-title">${escapeHtml(song.title)}</div>
            <div class="music-selection-item-artist">${escapeHtml(song.channel || "Unknown Channel")} • ${song.playCount} plays</div>
          </div>
          <div class="music-selection-item-duration">${duration}</div>
          ${createFavoriteButtonHTML(song.videoId, {size: "small", className: "music-selection-item-favorite"})}
        </div>
      `;
    }).join("");

    // Highlight favorited songs in library
    highlightFavoritesInHistory();

    // Set up favorite buttons for library items
    setupFavoriteButtons(libraryContent, showNotification, ({videoId, isFavorited}) => {
      // Update favorite button in music controls if this is the currently playing song
      if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
        updateFavoriteButton(videoId);
      }
      // Refresh the library display to show/hide badges
      highlightFavoritesInHistory();
    });

    // Add click handlers to library items
    document.querySelectorAll(".music-selection-item").forEach(item => {
      item.addEventListener("click", async (e) => {
        // Don't trigger if clicking favorite button
        if (e.target.closest("[data-action='toggle-favorite']")) {
          return;
        }

        const url = item.dataset.url;

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
      });
    });
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
