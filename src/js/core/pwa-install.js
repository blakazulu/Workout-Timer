/**
 * PWA Install Module
 * Handles Progressive Web App installation prompt and related functionality
 */

import {$} from "../utils/dom.js";
import {createGestureHandler} from "../utils/gestures.js";

// Store deferred install prompt
let deferredPrompt = null;
let installBanner = null;
let hasShownBanner = false;

/**
 * Initialize PWA install handlers
 */
export function initPWAInstall() {
  // Listen for install prompt event
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // Listen for successful installation
  window.addEventListener("appinstalled", handleAppInstalled);

  // Set up install banner
  setupInstallBanner();

  // Detect if running as installed PWA
  detectStandaloneMode();

  // TEST MODE: Show banner after 3 seconds on mobile (even without beforeinstallprompt)
  // Remove this in production or when beforeinstallprompt works
  if (window.innerWidth < 768 && !isStandalone()) {
    setTimeout(() => {
      if (!hasShownBanner) {
        console.log("TEST MODE: Showing install banner");
        showInstallBanner();
      }
    }, 3000);
  }
}

/**
 * Check if app is running in standalone mode
 * @returns {boolean}
 */
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

/**
 * Handle beforeinstallprompt event
 * @param {Event} e - Install prompt event
 */
function handleBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt = e;

  // Don't show banner on desktop or if already shown
  if (window.innerWidth >= 768 || hasShownBanner) return;

  // Show banner after 3 seconds
  setTimeout(() => {
    showInstallBanner();
  }, 3000);

  console.log("PWA install prompt available");
}

/**
 * Handle successful app installation
 */
function handleAppInstalled() {
  console.log("PWA installed successfully");
  deferredPrompt = null;
  hideInstallBanner();
}

/**
 * Set up install banner and handlers
 */
function setupInstallBanner() {
  installBanner = $("#installBanner");
  if (!installBanner) return;

  const installBtn = $("#installBannerBtn");
  const closeBtn = $("#installBannerClose");

  // Install button click handler
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for user response
      const {outcome} = await deferredPrompt.userChoice;
      console.log(`Install prompt outcome: ${outcome}`);

      // Clear the deferred prompt and hide banner
      deferredPrompt = null;
      hideInstallBanner();
    });
  }

  // Close button click handler
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideInstallBanner();
    });
  }

  // Set up swipe-up gesture
  const gestures = createGestureHandler(installBanner);
  gestures.on("swipeUp", () => {
    hideInstallBanner();
  });
}

/**
 * Show the install banner with dropdown animation
 */
function showInstallBanner() {
  if (!installBanner || hasShownBanner) return;

  // Check if already installed
  if (isStandalone()) {
    return;
  }

  hasShownBanner = true;
  installBanner.classList.add("show");
  console.log("PWA install banner shown");
}

/**
 * Hide the install banner with roll-up animation
 */
function hideInstallBanner() {
  if (!installBanner) return;

  // Add rolling-up animation
  installBanner.classList.add("rolling-up");

  // Remove banner after animation completes
  setTimeout(() => {
    installBanner.classList.remove("show", "rolling-up");
  }, 500);

  console.log("PWA install banner dismissed");
}

/**
 * Detect if running as installed PWA and add appropriate class
 */
function detectStandaloneMode() {
  if (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true) {
    document.body.classList.add("pwa-standalone");
  }
}
