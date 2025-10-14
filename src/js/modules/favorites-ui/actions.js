/**
 * Favorites UI Actions - Action handlers (shuffle, export, import)
 */

import {$} from "../../utils/dom.js";
import {downloadFavoritesFile, getShuffledFavorites, uploadFavoritesFile} from "../favorites.js";
import {updateFavoritesBadge} from "./initialization.js";

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
