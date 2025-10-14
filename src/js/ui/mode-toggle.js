/**
 * Mode Toggle Module
 * Handles mood/genre selection and music selection popover
 */

import {$} from "../utils/dom.js";
import {getTimer} from "../modules/timer.js";
import {getGenreSongs, getMoodPlaylists, isMoodQuery} from "../data/music-library.js";
import {updateFavoriteButton} from "../modules/favorites-ui.js";
import {createFavoriteButtonHTML, setupFavoriteButtons} from "../utils/favorite-button.js";
import {escapeHtml, formatDuration} from "./library-ui.js";

/**
 * Set up music mode toggle (Mood/Genre)
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Notification display function
 */
export function setupMusicModeToggle(loadYouTubeModule, showNotification) {
  const moodTags = document.querySelectorAll(".mood-tag");
  const genreTags = document.querySelectorAll(".genre-tag");

  // Handle mood tag clicks
  moodTags.forEach(tag => {
    tag.addEventListener("click", async () => {
      const query = tag.dataset.query;

      // Close the mood popover
      const moodPopover = $("#moodPopover");
      if (moodPopover) {
        moodPopover.hidePopover();
      }

      await searchAndLoadMusic(query, "mood", loadYouTubeModule, showNotification);
    });
  });

  // Handle genre tag clicks
  genreTags.forEach(tag => {
    tag.addEventListener("click", async () => {
      const query = tag.dataset.query;

      // Close the genre popover
      const genrePopover = $("#genrePopover");
      if (genrePopover) {
        genrePopover.hidePopover();
      }

      await searchAndLoadMusic(query, "genre", loadYouTubeModule, showNotification);
    });
  });
}

/**
 * Load music selection for mood/genre
 * @param {string} query - Original query from tag
 * @param {string} sourcePopover - 'mood' or 'genre' to track where we came from
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Notification display function
 */
async function searchAndLoadMusic(query, sourcePopover, loadYouTubeModule, showNotification) {
  // Get songs from library
  const isMood = isMoodQuery(query);
  const items = isMood ? getMoodPlaylists(query) : getGenreSongs(query);

  if (items.length === 0) {
    showNotification("No music found for this selection", true);
    return;
  }

  // Show music selection popover
  showMusicSelection(items, query, isMood, sourcePopover, loadYouTubeModule, showNotification);
}

/**
 * Show music selection popover with song list
 * @param {Array} items - Music items to display
 * @param {string} query - Original query
 * @param {boolean} isMood - Whether this is a mood or genre
 * @param {string} sourcePopover - 'mood' or 'genre' to track where we came from
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Function} showNotification - Notification display function
 */
function showMusicSelection(items, query, isMood, sourcePopover, loadYouTubeModule, showNotification) {
  const selectionPopover = $("#musicSelectionPopover");
  if (!selectionPopover) {
    // Create popover if it doesn't exist
    createMusicSelectionPopover();
    return showMusicSelection(items, query, isMood, sourcePopover, loadYouTubeModule, showNotification);
  }

  // Update title
  const title = selectionPopover.querySelector(".music-selection-title");
  if (title) {
    const formattedQuery = query.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    title.textContent = formattedQuery;
  }

  // Update subtitle
  const subtitle = selectionPopover.querySelector(".music-selection-subtitle");
  if (subtitle) {
    subtitle.textContent = `${items.length} ${isMood ? "playlists" : "mixes"} • Click to play`;
  }

  // Set up back button
  const backBtn = selectionPopover.querySelector(".music-selection-back");
  if (backBtn) {
    // Remove old listeners
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);

    // Add new listener
    newBackBtn.addEventListener("click", () => {
      selectionPopover.hidePopover();

      // Reopen the source popover
      setTimeout(() => {
        if (sourcePopover === "mood") {
          const moodPopover = $("#moodPopover");
          if (moodPopover) moodPopover.showPopover();
        } else if (sourcePopover === "genre") {
          const genrePopover = $("#genrePopover");
          if (genrePopover) genrePopover.showPopover();
        }
      }, 100);
    });
  }

  // Render items with thumbnails
  const content = selectionPopover.querySelector(".music-selection-content");
  if (content) {
    content.innerHTML = items.map((item, index) => {
      const duration = formatDuration(item.duration);
      const videoId = extractVideoIdFromUrl(item.url);
      return `
        <div class="music-selection-item" data-url="${escapeHtml(item.url)}" data-video-id="${escapeHtml(videoId)}" data-index="${index}" data-duration="${item.duration}">
          <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" class="music-selection-item-thumbnail" loading="lazy">
          <div class="music-selection-item-info">
            <div class="music-selection-item-title">${escapeHtml(item.title)}</div>
            <div class="music-selection-item-artist">${escapeHtml(item.channel)}</div>
          </div>
          <div class="music-selection-item-duration">${duration}</div>
          ${videoId ? createFavoriteButtonHTML(videoId, {
        size: "small",
        className: "music-selection-item-favorite"
      }) : ""}
        </div>
      `;
    }).join("");

    // Set up favorite buttons
    setupFavoriteButtons(content, showNotification, ({videoId}) => {
      // Update favorite button in music controls if this is the currently playing song
      if (window.youtubeModule && window.youtubeModule.videoId === videoId) {
        updateFavoriteButton(videoId);
      }
    });

    // Add click handlers
    content.querySelectorAll(".music-selection-item").forEach(itemEl => {
      itemEl.addEventListener("click", async (e) => {
        // Don't trigger if clicking favorite button
        if (e.target.closest("[data-action='toggle-favorite']")) {
          return;
        }

        const url = itemEl.dataset.url;

        // Close popover
        selectionPopover.hidePopover();

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

  // Show popover
  selectionPopover.showPopover();
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
 * Create music selection popover element
 */
function createMusicSelectionPopover() {
  const popover = document.createElement("div");
  popover.id = "musicSelectionPopover";
  popover.setAttribute("popover", "");
  popover.className = "music-selection-popover";
  popover.innerHTML = `
    <div class="music-selection-header">
      <button class="music-selection-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <div>
        <h3 class="music-selection-title">Select Music</h3>
        <p class="music-selection-subtitle">Choose a song to play</p>
      </div>
      <button class="music-selection-close" popovertarget="musicSelectionPopover" popovertargetaction="hide">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="music-selection-content"></div>
  `;
  document.body.appendChild(popover);
}
