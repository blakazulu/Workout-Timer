/**
 * Favorites UI State - State management and highlighting
 */

import {isFavorite} from "../favorites.js";

/**
 * Check if current song is favorited and update highlighted status in history
 * @param {string} videoId - Video ID to check
 */
export function highlightFavoritesInHistory(videoId) {
  // Query all song cards
  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach(item => {
    const itemVideoId = item.dataset.videoId;

    if (itemVideoId && isFavorite(itemVideoId)) {
      item.classList.add("is-favorited");
    } else {
      item.classList.remove("is-favorited");
    }
  });
}
