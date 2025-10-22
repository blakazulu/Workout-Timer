/**
 * Main Entry Point
 * This file is loaded by Vite and initializes the application
 */

// Import CSS files
import "./css/variables.css";
import "./css/global.css";
import "./css/components.css";
import "./css/animations.css";

// Import popover polyfill for iOS/Safari compatibility
import {initAllPopovers, injectPopoverPolyfillStyles, isPopoverSupported} from "./js/utils/popover-polyfill.js";
// Import and initialize the application
import "./js/app.js";

// Initialize popover polyfill on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Inject polyfill styles if needed
  injectPopoverPolyfillStyles();

  // Initialize all popovers
  initAllPopovers();

  // Log support status in dev mode
  if (import.meta.env.DEV) {
    console.log(`[Popover] Native support: ${isPopoverSupported()}`);
  }
});

