/**
 * YouTube Search UI Module
 * Handles YouTube search dropdown with autocomplete
 */

import {$} from "../utils/dom.js";
import {getTimer} from "../modules/timer.js";
import {debounce, isYouTubeUrl, searchYouTubeVideosDetailed} from "../utils/youtube-search.js";
import {createSearchDropdown} from "../components/search-dropdown.js";
import {eventBus} from "../core/event-bus.js";

/**
 * Set up YouTube search with autocomplete
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Notification display function
 * @returns {Object} searchDropdown - Search dropdown instance
 */
export function setupYouTubeSearch(loadYouTubeModule, showNotification) {
  const youtubeUrl = $("#youtubeUrl");
  if (!youtubeUrl) return null;

  // Create search dropdown
  const searchDropdown = createSearchDropdown(youtubeUrl, {
    showNotification: showNotification,
    onSelect: async (result) => {
      console.log("Selected video:", result.title);

      // Check if this is an actual video result (has URL)
      if (result.url && result.type === "video") {
        // Update input with the video URL
        youtubeUrl.value = result.url;

        // Load the video immediately
        const youtube = await loadYouTubeModule();
        await youtube.loadVideo(result.url);

        // Connect YouTube player to timer
        const timer = getTimer();
        timer.setYouTubePlayer(youtube);

        // Show notification
        showNotification(`Loading: ${result.title}`, false);
      } else {
        // Fallback for non-video results (shouldn't happen with new API)
        youtubeUrl.value = result.title;
        showNotification(`Selected: ${result.title}`, false);
      }
    }
  });

  // Debounced search function
  const performSearch = debounce(async (query) => {
    if (!query || query.trim().length < 2) {
      searchDropdown.hide();
      return;
    }

    // Check if input is a URL
    if (isYouTubeUrl(query)) {
      console.log("Detected YouTube URL, hiding dropdown");
      searchDropdown.hide();
      return;
    }

    // Show loading state
    searchDropdown.showLoading();

    try {
      // Fetch actual video results with thumbnails
      const results = await searchYouTubeVideosDetailed(query, 6);

      if (results && results.length > 0) {
        searchDropdown.show(results);

        // Emit analytics event for search performed
        eventBus.emit("ui:search_performed", {
          query,
          resultsCount: results.length,
        });
      } else {
        searchDropdown.hide();
      }
    } catch (error) {
      console.error("Search error:", error);
      searchDropdown.hide();
    }
  }, 300);

  // Listen to input changes
  youtubeUrl.addEventListener("input", (e) => {
    const query = e.target.value;
    performSearch(query);
  });

  // Hide dropdown when input loses focus (with small delay to allow clicks)
  youtubeUrl.addEventListener("blur", () => {
    setTimeout(() => {
      if (!searchDropdown.isOpen()) return;
      // Don't hide if user is hovering over dropdown
      const dropdown = document.getElementById("youtubeSearchDropdown");
      if (dropdown && dropdown.matches(":hover")) {
        return;
      }
      searchDropdown.hide();
    }, 150);
  });

  // Show dropdown again when input gets focus (if there's content)
  youtubeUrl.addEventListener("focus", () => {
    // Emit analytics event for search opened
    eventBus.emit("ui:search_opened");

    const query = youtubeUrl.value;
    if (query && query.trim().length >= 2 && !isYouTubeUrl(query)) {
      performSearch(query);
    }
  });

  return searchDropdown;
}
