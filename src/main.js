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

// Import icon font loader (Layer 4: JavaScript detection)
import { initIconFontLoader } from "./js/utils/icon-font-loader.js";

// Initialize icon font loader with debugging enabled in development
initIconFontLoader({
  debug: import.meta.env.DEV, // Enable logging in dev mode only
  timeout: 3000, // 3 second timeout (iOS-optimized)
});

// Import and initialize the application
import "./js/app.js";
