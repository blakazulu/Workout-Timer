/**
 * PWA Install Module
 * Handles Progressive Web App installation prompt and related functionality
 */

import { $ } from "../utils/dom.js";

// Store deferred install prompt
let deferredPrompt = null;

/**
 * Initialize PWA install handlers
 */
export function initPWAInstall() {
  // Listen for install prompt event
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // Listen for successful installation
  window.addEventListener("appinstalled", handleAppInstalled);

  // Set up install button click handler
  setupInstallButton();

  // Detect if running as installed PWA
  detectStandaloneMode();
}

/**
 * Handle beforeinstallprompt event
 * @param {Event} e - Install prompt event
 */
function handleBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button
  const installBtn = $("#installBtn");
  if (installBtn) {
    installBtn.style.display = "flex";
  }
  console.log("PWA install prompt available");
}

/**
 * Handle successful app installation
 */
function handleAppInstalled() {
  console.log("PWA installed successfully");
  deferredPrompt = null;

  // Hide install button
  const installBtn = $("#installBtn");
  if (installBtn) {
    installBtn.style.display = "none";
  }
}

/**
 * Set up install button click handler
 */
function setupInstallButton() {
  const installBtn = $("#installBtn");
  if (!installBtn) return;

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install prompt outcome: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

/**
 * Detect if running as installed PWA and add appropriate class
 */
function detectStandaloneMode() {
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) {
    document.body.classList.add('pwa-standalone');
  }
}
