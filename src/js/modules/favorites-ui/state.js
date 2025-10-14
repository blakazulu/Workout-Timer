/**
 * Favorites UI State - State management and highlighting
 */

import { isFavorite } from "../favorites.js";

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
        favoriteBadge.innerHTML = "<i class=\"ph-bold ph-heart-fill\"></i>";
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
