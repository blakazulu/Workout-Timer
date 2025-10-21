/**
 * Favorites UI Rendering - Rendering favorites list
 */

import {getFavorites} from "../favorites.js";
import {escapeHtml, formatDuration} from "./utils.js";

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
    return "<div class=\"history-empty\">No favorites yet<br><small>Click the heart icon while playing a song to add it to favorites</small></div>";
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
      ? `<img src="${song.thumbnail}" alt="${escapeHtml(title)}" class="song-card-thumbnail" loading="lazy">`
      : `<div class="song-card-no-thumbnail">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <polygon points="5 3 19 12 5 21 5 3"></polygon>
           </svg>
         </div>`;

    const favoritedAt = song.favoritedAt ? new Date(song.favoritedAt).toLocaleDateString() : "Unknown date";

    return `
      <div class="song-card favorite-item" data-url="${escapeHtml(url)}" data-video-id="${escapeHtml(videoId)}" data-title="${escapeHtml(title)}" data-channel="${escapeHtml(channel)}">
        ${thumbnail}
        <div class="song-card-bottom">
          <div class="song-card-info">
            <div class="song-card-title">${escapeHtml(title)}</div>
            <div class="song-card-channel">${escapeHtml(channel)} • Added ${favoritedAt}</div>
          </div>
          <div class="song-card-controls">
            <button class="song-card-remove" data-video-id="${escapeHtml(videoId)}" title="Remove from favorites">
              <img src="/svg-icons/add-remove-delete/cancel-01.svg" class="svg-icon" alt="Remove" />
            </button>
            <div class="song-card-duration">${duration}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}
