/**
 * Gesture Handler Module
 * Sets up touch gesture handlers for mobile UX
 */

import {$} from "../utils/dom.js";
import {createGestureHandler} from "../utils/gestures.js";
import {getTimer} from "../modules/timer.js";

/**
 * Set up touch gesture handlers
 */
export function setupGestures() {
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
