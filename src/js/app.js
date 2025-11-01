/**
 * Main Application - Entry point
 * Orchestrates module initialization and coordinates application startup
 */

import {$} from "./utils/dom.js";
import {getTimer, initTimer} from "./modules/timer.js";
import {initAudio} from "./modules/audio.js";
import {loadSettings} from "./modules/storage.js";
import {getRandomSong} from "./data/music-library.js";
import {getVersionInfo, startVersionChecking} from "./utils/version-check.js";
// Import PWA service worker registration
import {registerSW} from "virtual:pwa-register";
// Import favorites functionality
import {initFavoritesUI, updateFavoriteButton, updateFavoritesBadge} from "./modules/favorites-ui.js";

// Import extracted modules
import {showNotification} from "./core/notifications.js";
import {initPWAInstall} from "./core/pwa-install.js";
import {setupGestures} from "./core/gesture-handler.js";
import {eventBus} from "./core/event-bus.js";
import {setupEventListeners} from "./ui/event-handlers.js";
import {setupMusicTooltipPositioning} from "./ui/tooltip-handler.js";
import {setupMusicLibrary} from "./ui/library-ui.js";
import {setupMusicModeToggle} from "./ui/mode-toggle.js";
import {setupYouTubeSearch} from "./search/youtube-search-ui.js";
// Import analytics modules
import {analytics} from "./core/analytics.js";
import {initAnalyticsTracking} from "./core/analytics-tracker.js";
// Import icon color enhancer
import {initIconColorEnhancer} from "./utils/icon-color-enhancer.js";
// Import plan system modules
import {initPlanSelector, updateActivePlanDisplay} from "./ui/plan-selector.js";
import {initPlanBuilder} from "./ui/plan-builder.js";
import {initSettingsPanel} from "./ui/settings-panel.js";
import {getPlanById, loadActivePlan} from "./modules/plans/index.js";

// Lazy loaded modules
let youtubeModule = null;

// Search dropdown instance
let searchDropdown = null;

// Initialization guard to prevent duplicate setup
let isInitialized = false;

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
 * Lazy load YouTube module
 * @returns {Promise<Object>}
 */
async function loadYouTubeModule() {
  if (!youtubeModule) {
    console.log("Lazy loading YouTube module...");
    const module = await import("./modules/youtube/index.js");
    youtubeModule = module.initYouTube("#youtube-player-iframe");

    // Set up embedding error handler (for Error 150 - embedding disabled)
    youtubeModule.onEmbeddingError = handleEmbeddingError;

    // Initialize favorites UI after YouTube module is loaded
    initFavoritesUI(youtubeModule, loadYouTubeModule, showNotification);

    // Update window reference for compatibility with event handlers
    window.youtubeModule = youtubeModule;
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
 * Load and apply active workout plan to timer
 */
function loadAndApplyActivePlan() {
  let activePlanId = loadActivePlan();

  // Default to Quick Start if no active plan
  if (!activePlanId) {
    console.log("[App] No active plan, defaulting to Quick Start");
    activePlanId = "quick-start";
    setActivePlan(activePlanId);
  }

  const activePlan = getPlanById(activePlanId);
  if (!activePlan) {
    console.warn(`[App] Active plan not found: ${activePlanId}, defaulting to Quick Start`);
    // Fallback to Quick Start
    const quickStart = getPlanById("quick-start");
    if (quickStart) {
      setActivePlan("quick-start");
      const timer = getTimer();
      if (timer && quickStart.segments) {
        timer.loadPlanSegments(quickStart.segments);
        console.log(`[App] Loaded ${quickStart.segments.length} segments into timer (Quick Start)`);
      }
      updateActivePlanDisplay();
    }
    return;
  }

  console.log(`[App] Applying active plan: ${activePlan.name}`);

  // Apply plan segments to timer
  const timer = getTimer();
  if (timer && activePlan.segments) {
    timer.loadPlanSegments(activePlan.segments);
    console.log(`[App] Loaded ${activePlan.segments.length} segments into timer`);
  }

  // Update active plan display
  updateActivePlanDisplay();
}

/**
 * Initialize the application
 */
function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    console.warn("[App] Already initialized, skipping duplicate init()");
    return;
  }
  isInitialized = true;

  // Initialize icon color enhancement
  initIconColorEnhancer();

  // Initialize PWA install handlers
  initPWAInstall();

  // Initialize analytics (with debug mode for development)
  analytics.init({
    // API key will be set via environment variable VITE_POSTHOG_KEY
    debug: false, // Set to true for development debugging
  });

  // Initialize analytics event tracking
  initAnalyticsTracking();

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

  // Set up all UI modules
  setupEventListeners(loadYouTubeModule);
  setupMusicTooltipPositioning();
  setupGestures();
  setupMusicLibrary(loadYouTubeModule, showNotification);
  setupMusicModeToggle(loadYouTubeModule, showNotification);
  searchDropdown = setupYouTubeSearch(loadYouTubeModule, showNotification);

  // Initialize favorites badge
  updateFavoritesBadge();

  // Initialize plan system
  initPlanSelector();
  initPlanBuilder();
  initSettingsPanel();

  // Load and apply active workout plan
  loadAndApplyActivePlan();

  // Listen for plan selection to reload plan into timer
  eventBus.on("plan:selected", (data) => {
    if (data && data.plan) {
      const timer = getTimer();
      if (timer && data.plan.segments) {
        timer.loadPlanSegments(data.plan.segments);
        console.log(`[App] Reloaded plan segments: ${data.plan.name}`);
      }
    }
  });

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

// Expose functions to window for YouTube module callbacks
window.updateFavoriteButton = updateFavoriteButton;
window.getTimer = getTimer;

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {init};
