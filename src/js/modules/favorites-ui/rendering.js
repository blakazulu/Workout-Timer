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
