/**
 * Favorites UI Actions - Action handlers (random)
 */

import {$} from "../../utils/dom.js";
import {getShuffledFavorites} from "../favorites.js";

/**
 * Set up favorites tab action buttons
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Function to show notifications
 * @param {Function} updateCurrentTab - Function to update current tab display
 */
export function setupFavoritesActions(loadYouTubeModule, showNotification, updateCurrentTab) {
  const shuffleBtn = $("#shuffleFavoritesBtn");

  // Random favorites
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", async () => {
      const favorites = getShuffledFavorites();

      if (favorites.length === 0) {
        showNotification("No favorites to randomize", true);
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

      showNotification(`Playing random favorite: ${firstSong.title}`, false);
    });
  }
}
