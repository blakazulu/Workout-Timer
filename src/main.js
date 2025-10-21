/**
 * Main Entry Point
 * This file is loaded by Vite and initializes the application
 */

// Import CSS files
import "./css/variables.css";
import "./css/global.css";
import "./css/components.css";
import "./css/animations.css";

// Import icon fallback system (Layer 3: CSS Unicode fallbacks)
import "./css/components/icon-fallbacks.css";
// CRITICAL: Always-on fallbacks for Apple devices (shows Unicode immediately)
import "./css/components/icon-fallbacks-always-on.css";

// Import icon font loader (Layer 4: JavaScript detection)
import { initIconFontLoader } from "./js/utils/icon-font-loader.js";

// Initialize icon font loader with debugging enabled in development
initIconFontLoader({
  debug: import.meta.env.DEV, // Enable logging in dev mode only
  timeout: 3000, // 3 second timeout (iOS-optimized)
});

// Import popover polyfill for iOS/Safari compatibility
import {
  initAllPopovers,
  injectPopoverPolyfillStyles,
  isPopoverSupported
} from "./js/utils/popover-polyfill.js";

// Initialize popover polyfill on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Inject polyfill styles if needed
  injectPopoverPolyfillStyles();

  // Initialize all popovers
  initAllPopovers();

  // Log support status in dev mode
  if (import.meta.env.DEV) {
    console.log(`[Popover] Native support: ${isPopoverSupported()}`);
  }
});

// Import and initialize the application
import "./js/app.js";
