/**
 * UI Event Handlers Module
 * Handles all UI event listeners for controls, settings, and keyboard shortcuts
 */

import { $ } from "../utils/dom.js";
import { getTimer } from "../modules/timer.js";
import { saveSettings } from "../modules/storage.js";

/**
 * Set up all event listeners
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 */
export function setupEventListeners(loadYouTubeModule) {
  const timer = getTimer();

  // Set up timer controls
  setupTimerControls(timer);

  // Set up YouTube controls
  setupYouTubeControls(loadYouTubeModule, timer);

  // Set up music playback controls
  setupMusicPlaybackControls();

  // Set up progress bar seeking
  setupProgressBarSeeking();

  // Set up settings auto-save
  setupSettingsAutoSave();

  // Prevent form submission
  setupFormPrevention();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts(timer);
}

/**
 * Set up timer control buttons (Start, Reset, Clear All)
 * @param {Object} timer - Timer instance
 */
function setupTimerControls(timer) {
  // Start/Pause button
  const startBtn = $("#startBtn");
  if (startBtn) {
    const handleStart = (e) => {
      // Prevent any default behaviors and propagation
      e.preventDefault();
      e.stopPropagation();

      timer.start();
      // Save settings when starting
      saveSettings({
        duration: parseInt($("#duration").value),
        alertTime: parseInt($("#alertTime").value),
        repetitions: parseInt($("#repetitions").value),
        restTime: parseInt($("#restTime").value)
      });
    };

    // Handle both click and touch events
    startBtn.addEventListener("click", handleStart);

    // Prevent scrolling on touch devices
    startBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    // Handle touch end as the primary action on mobile
    startBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleStart(e);
    }, { passive: false });
  }

  // New Timer button (formerly Reset button)
  const resetBtn = $("#resetBtn");
  if (resetBtn) {
    const handleNewTimer = (e) => {
      e.preventDefault();
      e.stopPropagation();
      timer.newTimer();
    };

    resetBtn.addEventListener("click", handleNewTimer);
    resetBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    resetBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleNewTimer(e);
    }, { passive: false });
  }

  // Clear All button
  const clearAllBtn = $("#clearAllBtn");
  if (clearAllBtn) {
    const handleClearAll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      timer.clearAll();
    };

    clearAllBtn.addEventListener("click", handleClearAll);
    clearAllBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    clearAllBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleClearAll(e);
    }, { passive: false });
  }
}

/**
 * Set up YouTube load controls
 * @param {Function} loadYouTubeModule - Function to lazy load YouTube module
 * @param {Object} timer - Timer instance
 */
function setupYouTubeControls(loadYouTubeModule, timer) {
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
}

/**
 * Set up music playback controls (play/pause button)
 */
function setupMusicPlaybackControls() {
  const musicPlayPauseBtn = $("#musicPlayPauseBtn");
  if (musicPlayPauseBtn) {
    musicPlayPauseBtn.addEventListener("click", async () => {
      // youtubeModule is accessed from global scope (will be refactored with state management)
      if (window.youtubeModule) {
        if (window.youtubeModule.isPlaying()) {
          window.youtubeModule.pause();
        } else {
          window.youtubeModule.play();
        }
      }
    });
  }
}

/**
 * Set up progress bar seeking
 */
function setupProgressBarSeeking() {
  const progressBarContainer = $("#progressBarContainer");
  if (progressBarContainer) {
    progressBarContainer.addEventListener("click", async (e) => {
      // youtubeModule is accessed from global scope (will be refactored with state management)
      if (window.youtubeModule) {
        const rect = progressBarContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const duration = window.youtubeModule.getDuration();
        const seekTime = (percentage / 100) * duration;
        window.youtubeModule.seekTo(seekTime);
      }
    });
  }
}

/**
 * Set up settings auto-save
 */
function setupSettingsAutoSave() {
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
}

/**
 * Prevent form submission if inputs are in a form
 */
function setupFormPrevention() {
  document.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

/**
 * Set up keyboard shortcuts
 * @param {Object} timer - Timer instance
 */
function setupKeyboardShortcuts(timer) {
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
