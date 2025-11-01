/**
 * UI Event Handlers Module
 * Handles all UI event listeners for controls, settings, and keyboard shortcuts
 */

import {$} from "../utils/dom.js";
import {getTimer} from "../modules/timer.js";
import {saveSettings} from "../modules/storage.js";
import {loadActivePlan, createQuickStartPlan} from "../modules/plans/storage.js";

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
    }, {passive: false});

    // Handle touch end as the primary action on mobile
    startBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleStart(e);
    }, {passive: false});
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
    }, {passive: false});
    resetBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleNewTimer(e);
    }, {passive: false});
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
    }, {passive: false});
    clearAllBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleClearAll(e);
    }, {passive: false});
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
 * Set up progress bar seeking with drag support
 */
function setupProgressBarSeeking() {
  const progressBarContainer = $("#progressBarContainer");
  const progressBarFill = $("#progressBarFill");
  const progressBarHandle = $("#progressBarHandle");

  if (!progressBarContainer) return;

  let isDragging = false;
  let wasPlaying = false;

  /**
   * Calculate seek position from pointer coordinates
   * @param {number} clientX - Pointer X coordinate
   * @returns {number} Seek time in seconds
   */
  function calculateSeekTime(clientX) {
    const rect = progressBarContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    const duration = window.youtubeModule?.getDuration() || 0;
    return (percentage / 100) * duration;
  }

  /**
   * Update progress bar visual position
   * @param {number} clientX - Pointer X coordinate
   */
  function updateProgressBar(clientX) {
    const rect = progressBarContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));

    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    if (progressBarHandle) progressBarHandle.style.left = `${percentage}%`;

    // Update time display
    const duration = window.youtubeModule?.getDuration() || 0;
    const currentTime = (percentage / 100) * duration;
    const currentTimeEl = $("#musicCurrentTime");
    if (currentTimeEl && window.youtubeModule?.formatTime) {
      currentTimeEl.textContent = window.youtubeModule.formatTime(currentTime);
    }
  }

  /**
   * Start seeking operation
   * @param {number} clientX - Pointer X coordinate
   */
  function startSeeking(clientX) {
    if (!window.youtubeModule) return;

    isDragging = true;
    wasPlaying = window.youtubeModule.isPlaying();

    // Pause video while dragging for better UX
    if (wasPlaying) {
      window.youtubeModule.pause();
    }

    // Add dragging visual state
    progressBarContainer.classList.add("dragging");
    if (progressBarFill) progressBarFill.classList.add("no-transition");

    // Update immediately
    updateProgressBar(clientX);
  }

  /**
   * Continue seeking operation
   * @param {number} clientX - Pointer X coordinate
   */
  function continueSeeking(clientX) {
    if (!isDragging) return;
    updateProgressBar(clientX);
  }

  /**
   * End seeking operation
   * @param {number} clientX - Pointer X coordinate
   */
  function endSeeking(clientX) {
    if (!isDragging && clientX === null) return; // Not dragging, just a click

    // Remove dragging visual state
    progressBarContainer.classList.remove("dragging");
    if (progressBarFill) progressBarFill.classList.remove("no-transition");

    if (window.youtubeModule) {
      const seekTime = calculateSeekTime(clientX);
      window.youtubeModule.seekTo(seekTime);

      // Resume playback if it was playing before
      if (wasPlaying && isDragging) {
        // Small delay to ensure seek completes
        setTimeout(() => {
          window.youtubeModule.play();
        }, 100);
      }
    }

    isDragging = false;
    wasPlaying = false;
  }

  // Mouse events
  progressBarContainer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startSeeking(e.clientX);

    const handleMouseMove = (e) => {
      e.preventDefault();
      continueSeeking(e.clientX);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      endSeeking(e.clientX);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  // Touch events
  progressBarContainer.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startSeeking(touch.clientX);
  }, {passive: false});

  progressBarContainer.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.touches[0];
    continueSeeking(touch.clientX);
  }, {passive: false});

  progressBarContainer.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.changedTouches[0];
    endSeeking(touch.clientX);
  }, {passive: false});

  progressBarContainer.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.changedTouches[0];
    endSeeking(touch.clientX);
  }, {passive: false});

  // Click event for quick seeking (when not dragging)
  progressBarContainer.addEventListener("click", (e) => {
    // Only handle if this was a pure click (not a drag)
    if (!isDragging) {
      endSeeking(e.clientX);
    }
  });
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
        const newSettings = {
          duration: parseInt($("#duration").value),
          alertTime: parseInt($("#alertTime").value),
          repetitions: parseInt($("#repetitions").value),
          restTime: parseInt($("#restTime").value)
        };

        // Save settings to localStorage
        saveSettings(newSettings);

        // If Quick Start is the active plan, regenerate its segments with new settings
        const activePlanId = loadActivePlan();
        if (activePlanId === "quick-start") {
          const quickStart = createQuickStartPlan(newSettings);
          const timer = getTimer();
          if (timer && quickStart.segments) {
            timer.loadPlanSegments(quickStart.segments);
            console.log("[Settings] Regenerated Quick Start plan with new settings");
          }
        }
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
