/**
 * Main Application - Entry point
 */

import {$} from "./utils/dom.js";
import {getTimer, initTimer} from "./modules/timer.js";
import {initAudio} from "./modules/audio.js";
import {getMostPlayedSongs, getSongHistory, loadSettings, saveSettings} from "./modules/storage.js";
import {createGestureHandler} from "./utils/gestures.js";
import {getGenreSongs, getMoodPlaylists, getRandomSong, isMoodQuery} from "./data/music-library.js";
import {startVersionChecking, getVersionInfo} from "./utils/version-check.js";
// Import PWA service worker registration
import {registerSW} from "virtual:pwa-register";
// Import YouTube search functionality
import {isYouTubeUrl, debounce, searchYouTubeVideosDetailed} from "./utils/youtube-search.js";
import {createSearchDropdown} from "./components/search-dropdown.js";

// Lazy loaded modules
let youtubeModule = null;

// Search dropdown instance
let searchDropdown = null;

// Register service worker with update notifications
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available! Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
    // Optional: Show a subtle notification to user
  }
});

/**
 * Show a notification to the user
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showNotification(message, isError = false) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "music-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? "rgba(255, 0, 150, 0.95)" : "rgba(0, 255, 200, 0.95)"};
    color: #0a0a0a;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 40px ${isError ? "rgba(255, 0, 150, 0.6)" : "rgba(0, 255, 200, 0.6)"};
    z-index: 10001;
    animation: slideDown 0.3s ease;
    max-width: 90vw;
    text-align: center;
  `;

  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Lazy load YouTube module
 * @returns {Promise<Object>}
 */
async function loadYouTubeModule() {
  if (!youtubeModule) {
    console.log("Lazy loading YouTube module...");
    const module = await import("./modules/youtube.js");
    youtubeModule = module.initYouTube("#youtube-player-iframe");

    // Set up embedding error handler (for Error 150 - embedding disabled)
    youtubeModule.onEmbeddingError = handleEmbeddingError;
  }
  return youtubeModule;
}

/**
 * Handle YouTube embedding errors (Error 150) by loading a random alternative song
 * @param {string} errorMessage - The error message from YouTube
 */
async function handleEmbeddingError(errorMessage) {
  console.log("🎵 Handling embedding error, loading random alternative song...");

  // Show notification to user
  showNotification(`${errorMessage}. Loading alternative song...`, false);

  // Get a random song from the library
  const randomSong = getRandomSong();

  if (!randomSong) {
    showNotification("No alternative songs available", true);
    return;
  }

  console.log("🎲 Selected random song:", randomSong.title);

  // Wait a moment before loading the new song (better UX)
  setTimeout(async () => {
    // Update the URL input field
    const youtubeUrl = $("#youtubeUrl");
    if (youtubeUrl) {
      youtubeUrl.value = randomSong.url;
    }

    // Load the alternative song
    try {
      await youtubeModule.loadVideo(randomSong.url);

      // Connect YouTube player to timer
      const timer = getTimer();
      timer.setYouTubePlayer(youtubeModule);

      showNotification(`Now playing: ${randomSong.title}`, false);
    } catch (error) {
      console.error("Failed to load alternative song:", error);
      showNotification("Failed to load alternative song", true);
    }
  }, 1500);
}

/**
 * Initialize the application
 */
function init() {
  // Load saved settings
  const settings = loadSettings();

  // Apply settings to input fields
  $("#duration").value = settings.duration;
  $("#alertTime").value = settings.alertTime;
  $("#repetitions").value = settings.repetitions;
  $("#restTime").value = settings.restTime;

  // Initialize core modules (YouTube is lazy loaded)
  initAudio();
  initTimer(settings);

  // Set up event listeners
  setupEventListeners();
  handleInstallClick();
  setupGestures();
  setupHistory();
  setupMusicModeToggle();
  setupYouTubeSearch();

  // Start version checking (checks every 5 minutes)
  startVersionChecking();

  // Update version display in HTML
  const versionInfo = getVersionInfo();
  const appVersionEl = $("#appVersion");
  if (appVersionEl) {
    appVersionEl.textContent = `v${versionInfo.version}`;
  }

  // Log version info
  console.log(`🚀 CYCLE v${versionInfo.version}`);
  console.log(`   Build: ${versionInfo.buildTime}`);
  console.log("   Initialized successfully");

  // Hide app loader once everything is ready
  hideAppLoader();
}

/**
 * Hide the app loader with smooth transition
 */
function hideAppLoader() {
  const loader = document.getElementById("app-loader");
  if (!loader) return;

  // Small delay to ensure fonts and assets are loaded
  setTimeout(() => {
    loader.classList.add("hidden");

    // Remove from DOM after transition completes
    setTimeout(() => {
      loader.remove();
    }, 500);
  }, 300);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  const timer = getTimer();

  // Start/Pause button
  const startBtn = $("#startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      timer.start();
      // Save settings when starting
      saveSettings({
        duration: parseInt($("#duration").value),
        alertTime: parseInt($("#alertTime").value),
        repetitions: parseInt($("#repetitions").value),
        restTime: parseInt($("#restTime").value)
      });
    });
  }

  // New Timer button (formerly Reset button)
  const resetBtn = $("#resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      timer.newTimer();
    });
  }

  // Clear All button
  const clearAllBtn = $("#clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      timer.clearAll();
    });
  }

  // YouTube load button - lazy load module on first interaction
  const loadYoutubeBtn = $("#loadYoutubeBtn");
  if (loadYoutubeBtn) {
    loadYoutubeBtn.addEventListener("click", async () => {
      const url = $("#youtubeUrl").value;
      if (url) {
        const youtube = await loadYouTubeModule();
        await youtube.loadVideo(url);
        // Connect YouTube player to timer
        timer.setYouTubePlayer(youtube);
      }
    });
  }

  // YouTube input - lazy load module and load on Enter key
  const youtubeUrl = $("#youtubeUrl");
  if (youtubeUrl) {
    youtubeUrl.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const url = $("#youtubeUrl").value;
        if (url) {
          const youtube = await loadYouTubeModule();
          await youtube.loadVideo(url);
          // Connect YouTube player to timer
          timer.setYouTubePlayer(youtube);
        }
      }
    });
  }

  // Music play/pause button
  const musicPlayPauseBtn = $("#musicPlayPauseBtn");
  if (musicPlayPauseBtn) {
    musicPlayPauseBtn.addEventListener("click", async () => {
      if (youtubeModule) {
        if (youtubeModule.isPlaying()) {
          youtubeModule.pause();
        } else {
          youtubeModule.play();
        }
      }
    });
  }

  // Progress bar seeking
  const progressBarContainer = $("#progressBarContainer");
  if (progressBarContainer) {
    progressBarContainer.addEventListener("click", async (e) => {
      if (youtubeModule) {
        const rect = progressBarContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const duration = youtubeModule.getDuration();
        const seekTime = (percentage / 100) * duration;
        youtubeModule.seekTo(seekTime);
      }
    });
  }

  // Music info tooltip - using Popover API with positioning fallback
  setupMusicTooltipPositioning();

  // Auto-save settings on change
  const settingsInputs = ["#duration", "#alertTime", "#repetitions", "#restTime"];
  settingsInputs.forEach(selector => {
    const input = $(selector);
    if (input) {
      input.addEventListener("change", () => {
        saveSettings({
          duration: parseInt($("#duration").value),
          alertTime: parseInt($("#alertTime").value),
          repetitions: parseInt($("#repetitions").value),
          restTime: parseInt($("#restTime").value)
        });
      });
    }
  });

  // Prevent form submission if inputs are in a form
  document.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Space bar to start/pause
    if (e.code === "Space" && !e.target.matches("input")) {
      e.preventDefault();
      timer.start();
    }
    // R key to start new timer
    if (e.code === "KeyR" && !e.target.matches("input")) {
      e.preventDefault();
      timer.newTimer();
    }
  });
}

/**
 * Handle PWA install prompt
 */
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button
  const installBtn = $("#installBtn");
  if (installBtn) {
    installBtn.style.display = "flex";
  }
  console.log("PWA install prompt available");
});

window.addEventListener("appinstalled", () => {
  console.log("PWA installed successfully");
  deferredPrompt = null;

  // Hide install button
  const installBtn = $("#installBtn");
  if (installBtn) {
    installBtn.style.display = "none";
  }
});

/**
 * Set up touch gesture handlers for mobile UX
 */
function setupGestures() {
  const timer = getTimer();
  const timerDisplay = $("#timerDisplay");

  if (!timerDisplay) return;

  const gestures = createGestureHandler(timerDisplay);

  // Double tap to start/pause
  gestures.on("doubleTap", () => {
    timer.start();
  });

  // Swipe down to start new timer
  gestures.on("swipeDown", () => {
    if (confirm("Start new timer?")) {
      timer.newTimer();
    }
  });
}

/**
 * Setup music tooltip positioning (fallback for browsers without anchor positioning)
 * Modern browsers with anchor positioning + position-try-fallbacks handle this automatically
 */
function setupMusicTooltipPositioning() {
  const musicInfoBtn = $("#musicInfoBtn");
  const musicTooltip = $("#musicTooltip");

  if (!musicInfoBtn || !musicTooltip) return;

  // Check if anchor positioning is supported
  const supportsAnchorPositioning = CSS.supports("anchor-name", "--test");

  if (!supportsAnchorPositioning) {
    console.log("Using JavaScript fallback for tooltip positioning (anchor positioning not supported)");

    const positionTooltip = () => {
      const rect = musicInfoBtn.getBoundingClientRect();
      const tooltipRect = musicTooltip.getBoundingClientRect();
      const margin = 10;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Simple positioning: centered below button, with basic viewport checks
      let top = rect.bottom + 8;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

      // Keep within viewport bounds
      left = Math.max(margin, Math.min(left, viewportWidth - tooltipRect.width - margin));

      // Position above if no space below
      if (top + tooltipRect.height > viewportHeight - margin) {
        top = rect.top - tooltipRect.height - 8;
      }

      musicTooltip.style.left = `${left}px`;
      musicTooltip.style.top = `${top}px`;
    };

    // Position on toggle
    musicTooltip.addEventListener("toggle", (e) => {
      if (e.newState === "open") {
        requestAnimationFrame(() => positionTooltip());
      }
    });

    // Reposition on scroll/resize
    window.addEventListener("scroll", () => {
      if (musicTooltip.matches(":popover-open")) {
        positionTooltip();
      }
    });

    window.addEventListener("resize", () => {
      if (musicTooltip.matches(":popover-open")) {
        positionTooltip();
      }
    });
  }
}

/**
 * Handle install button click
 */
function handleInstallClick() {
  const installBtn = $("#installBtn");
  if (!installBtn) return;

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const {outcome} = await deferredPrompt.userChoice;
    console.log(`Install prompt outcome: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

/**
 * Set up song history popover
 */
function setupHistory() {
  const historyPopover = $("#historyPopover");
  const historyContent = $("#historyContent");
  const historyTabs = document.querySelectorAll(".history-tab");

  if (!historyPopover || !historyContent) return;

  let currentTab = "recent";

  // Render history when popover opens
  historyPopover.addEventListener("toggle", (e) => {
    if (e.newState === "open") {
      renderHistory(currentTab);
    }
  });

  // Tab switching
  historyTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Update active state
      historyTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Switch content
      currentTab = tab.dataset.tab;
      renderHistory(currentTab);
    });
  });

  /**
   * Render history items
   * @param {string} tab - 'recent' or 'top'
   */
  function renderHistory(tab) {
    const songs = tab === "recent" ? getSongHistory() : getMostPlayedSongs(20);

    if (songs.length === 0) {
      historyContent.innerHTML = "<div class=\"history-empty\">No songs played yet</div>";
      return;
    }

    historyContent.innerHTML = songs.map(song => {
      const duration = formatDuration(song.duration);
      const thumbnail = song.thumbnail
        ? `<img src="${song.thumbnail}" alt="${escapeHtml(song.title)}" class="history-item-thumbnail" loading="lazy">`
        : `<div class="history-item-no-thumbnail">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <polygon points="5 3 19 12 5 21 5 3"></polygon>
             </svg>
           </div>`;

      return `
        <div class="history-item" data-url="${escapeHtml(song.url)}">
          ${thumbnail}
          <div class="history-item-info">
            <div class="history-item-title">${escapeHtml(song.title)}</div>
            <div class="history-item-author">${escapeHtml(song.author)}</div>
            <div class="history-item-meta">
              <div class="history-item-plays">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                ${song.playCount}
              </div>
              <span>•</span>
              <span>${duration}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Add click handlers to history items
    document.querySelectorAll(".history-item").forEach(item => {
      item.addEventListener("click", async () => {
        const url = item.dataset.url;

        // Close popover
        historyPopover.hidePopover();

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

  /**
   * Format duration in seconds to MM:SS or HH:MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  function formatDuration(seconds) {
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
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Set up music mode toggle (Link/Mood/Genre)
 */
function setupMusicModeToggle() {
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

      await searchAndLoadMusic(query, "mood");
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

      await searchAndLoadMusic(query, "genre");
    });
  });

  /**
   * Load music selection for mood/genre
   * @param {string} query - Original query from tag
   * @param {string} sourcePopover - 'mood' or 'genre' to track where we came from
   */
  async function searchAndLoadMusic(query, sourcePopover) {
    // Get songs from library
    const isMood = isMoodQuery(query);
    const items = isMood ? getMoodPlaylists(query) : getGenreSongs(query);

    if (items.length === 0) {
      showNotification("No music found for this selection", true);
      return;
    }

    // Show music selection popover
    showMusicSelection(items, query, isMood, sourcePopover);
  }

  /**
   * Show music selection popover with song list
   * @param {Array} items - Music items to display
   * @param {string} query - Original query
   * @param {boolean} isMood - Whether this is a mood or genre
   * @param {string} sourcePopover - 'mood' or 'genre' to track where we came from
   */
  function showMusicSelection(items, query, isMood, sourcePopover) {
    const selectionPopover = $("#musicSelectionPopover");
    if (!selectionPopover) {
      // Create popover if it doesn't exist
      createMusicSelectionPopover();
      return showMusicSelection(items, query, isMood, sourcePopover);
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
        return `
          <div class="music-selection-item" data-url="${escapeHtml(item.url)}" data-index="${index}">
            <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" class="music-selection-item-thumbnail" loading="lazy">
            <div class="music-selection-item-info">
              <div class="music-selection-item-title">${escapeHtml(item.title)}</div>
              <div class="music-selection-item-artist">${escapeHtml(item.artist)}</div>
            </div>
            <div class="music-selection-item-duration">${duration}</div>
          </div>
        `;
      }).join("");

      // Add click handlers
      content.querySelectorAll(".music-selection-item").forEach(itemEl => {
        itemEl.addEventListener("click", async () => {
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

  /**
   * Format duration in seconds to MM:SS or HH:MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  function formatDuration(seconds) {
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
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Set up YouTube search with autocomplete
 */
function setupYouTubeSearch() {
  const youtubeUrl = $("#youtubeUrl");
  if (!youtubeUrl) return;

  // Create search dropdown
  searchDropdown = createSearchDropdown(youtubeUrl, {
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
    const query = youtubeUrl.value;
    if (query && query.trim().length >= 2 && !isYouTubeUrl(query)) {
      performSearch(query);
    }
  });
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {init};
