/**
 * Version Check Utility
 * Compares client version with server version and forces update if mismatch
 */

// Embedded version (injected at build time by Vite)
const CLIENT_VERSION = __APP_VERSION__;
const CLIENT_BUILD_TIME = __BUILD_TIME__;

// Check interval (default: 5 minutes for active users)
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

let checkIntervalId = null;

/**
 * Fetch server version from version.json
 * @returns {Promise<Object>} Server version data
 */
async function fetchServerVersion() {
  try {
    const response = await fetch("/version.json", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch server version:", error);
    throw error;
  }
}

/**
 * Compare versions
 * @param {string} clientVer - Client version
 * @param {string} serverVer - Server version
 * @returns {boolean} True if versions match
 */
function versionsMatch(clientVer, serverVer) {
  // Normalize versions (remove 'v' prefix if present)
  const normalizeVersion = (v) => v.replace(/^v/, "").trim();
  return normalizeVersion(clientVer) === normalizeVersion(serverVer);
}

/**
 * Force service worker update and reload with visual overlay
 * @param {string} oldVersion - Current version
 * @param {string} newVersion - New version to update to
 */
async function forceUpdate(oldVersion, newVersion) {
  console.log("🔄 Forcing app update...");

  try {
    // Show update overlay
    const overlay = document.getElementById("updateOverlay");
    const oldVersionEl = document.getElementById("updateOldVersion");
    const newVersionEl = document.getElementById("updateNewVersion");
    const step1 = document.getElementById("updateStep1");
    const step2 = document.getElementById("updateStep2");
    const step3 = document.getElementById("updateStep3");

    if (overlay) {
      overlay.classList.remove("hidden");
      if (oldVersionEl) oldVersionEl.textContent = `v${oldVersion}`;
      if (newVersionEl) newVersionEl.textContent = `v${newVersion}`;
    }

    // Helper function to activate step
    const activateStep = (step) => {
      step?.classList.remove("completed");
      step?.classList.add("active");
    };

    // Helper function to complete step
    const completeStep = (step) => {
      step?.classList.remove("active");
      step?.classList.add("completed");
    };

    // Step 1: Clear caches
    activateStep(step1);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Unregister all service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // Clear all caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    completeStep(step1);
    await new Promise(resolve => setTimeout(resolve, 400));

    // Step 2: Preserve user data
    activateStep(step2);
    await new Promise(resolve => setTimeout(resolve, 800));

    const preserveKeys = [
      "workout-timer-settings",      // Timer settings
      "workout-timer-favorites",     // Favorite songs
      "workout-timer-song-history",  // Song history
      "workout-timer-plans",         // Custom workout plans (CRITICAL!)
      "workout-timer-active-plan"    // Currently selected plan
    ];
    const dataToPreserve = {};
    preserveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) dataToPreserve[key] = value;
    });

    localStorage.clear();

    // Restore preserved data
    Object.entries(dataToPreserve).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    completeStep(step2);
    await new Promise(resolve => setTimeout(resolve, 400));

    // Step 3: Load new version
    activateStep(step3);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reload with cache busting
    window.location.href = window.location.href.split("?")[0] + "?v=" + Date.now();
  } catch (error) {
    console.error("Failed to force update:", error);
    // Fallback: simple reload
    window.location.reload(true);
  }
}

/**
 * Check version and update if needed
 * @param {boolean} showNotification - Whether to show notification to user
 * @returns {Promise<Object>} Check result
 */
export async function checkVersion(showNotification = false) {
  try {
    const serverData = await fetchServerVersion();
    const serverVersion = serverData.version;
    const serverBuildTime = serverData.buildTime;

    console.log("📋 Version Check:", {
      client: CLIENT_VERSION,
      clientBuild: CLIENT_BUILD_TIME,
      server: serverVersion,
      serverBuild: serverBuildTime
    });

    const match = versionsMatch(CLIENT_VERSION, serverVersion);

    if (!match) {
      console.warn("⚠️  Version mismatch detected!");
      console.warn(`Client: ${CLIENT_VERSION} | Server: ${serverVersion}`);

      if (showNotification) {
        // Show user-friendly notification
        const shouldUpdate = confirm(
          `🔄 New version available!\n\n` +
          `Current: v${CLIENT_VERSION}\n` +
          `Latest: v${serverVersion}\n\n` +
          `Update now to get the latest features and fixes?`
        );

        if (shouldUpdate) {
          await forceUpdate(CLIENT_VERSION, serverVersion);
        }
      } else {
        // Force update without notification (silent)
        await forceUpdate(CLIENT_VERSION, serverVersion);
      }

      return {match: false, action: "updated"};
    }

    console.log("✓ Version up to date:", CLIENT_VERSION);
    return {match: true, action: "none"};

  } catch (error) {
    console.error("Version check failed:", error);
    return {match: null, action: "error", error};
  }
}

/**
 * Start periodic version checking
 * @param {number} intervalMs - Check interval in milliseconds
 */
export function startVersionChecking(intervalMs = CHECK_INTERVAL_MS) {
  // Stop existing interval
  stopVersionChecking();

  // Initial check (without notification)
  checkVersion(false);

  // Periodic checks
  checkIntervalId = setInterval(() => {
    checkVersion(false);
  }, intervalMs);

  console.log(`✓ Version checking started (interval: ${intervalMs / 1000}s)`);
}

/**
 * Stop periodic version checking
 */
export function stopVersionChecking() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

/**
 * Get current client version info
 * @returns {Object} Version info
 */
export function getVersionInfo() {
  return {
    version: CLIENT_VERSION,
    buildTime: CLIENT_BUILD_TIME
  };
}
