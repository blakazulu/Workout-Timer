/**
 * Storage Persistence Module
 * Handles persistent storage requests and iOS PWA storage safeguards
 */

/**
 * Request persistent storage (prevent eviction)
 * CRITICAL for iOS Safari - prevents 7-day eviction in browser mode
 * @returns {Promise<boolean>} True if persistent storage granted
 */
export async function requestPersistentStorage() {
  // Check if Storage API is available
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn("[Storage] Storage API not available");
    return false;
  }

  try {
    // Check if already persisted
    const isPersisted = await navigator.storage.persisted();

    if (isPersisted) {
      console.log("[Storage] ✅ Storage is already persisted");
      return true;
    }

    // Request persistent storage
    const granted = await navigator.storage.persist();

    if (granted) {
      console.log("[Storage] ✅ Persistent storage granted - data protected from eviction");
    } else {
      console.warn("[Storage] ⚠️ Persistent storage denied - data may be evicted after 7 days (iOS browser mode)");
      console.warn("[Storage] 💡 TIP: Install PWA to home screen for automatic persistence on iOS");
    }

    return granted;
  } catch (error) {
    console.error("[Storage] Failed to request persistent storage:", error);
    return false;
  }
}

/**
 * Get storage quota and usage information
 * @returns {Promise<Object>} Storage estimate object
 */
export async function getStorageInfo() {
  if (!navigator.storage || !navigator.storage.estimate) {
    console.warn("[Storage] Storage Estimate API not available");
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    const info = {
      usage: formatBytes(usage),
      quota: formatBytes(quota),
      percentUsed: percentUsed.toFixed(2),
      usageBytes: usage,
      quotaBytes: quota
    };

    console.log("[Storage] Usage:", info.usage, "of", info.quota, `(${info.percentUsed}%)`);

    return info;
  } catch (error) {
    console.error("[Storage] Failed to get storage info:", error);
    return null;
  }
}

/**
 * Check if running as installed PWA (added to home screen)
 * Installed PWAs are protected from iOS 7-day eviction
 * @returns {boolean} True if running as installed PWA
 */
export function isInstalledPWA() {
  // Check display mode
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  // Check navigator standalone (iOS)
  const isIOSStandalone = ("standalone" in window.navigator) && window.navigator.standalone;

  const installed = isStandalone || isIOSStandalone;

  if (installed) {
    console.log("[Storage] ✅ Running as installed PWA - storage is protected");
  } else {
    console.log("[Storage] ℹ️ Running in browser mode - storage may be evicted after 7 days on iOS");
  }

  return installed;
}

/**
 * Check if device is iOS
 * @returns {boolean} True if iOS device
 */
export function isIOSDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Get storage risk level for current environment
 * @returns {Object} Risk assessment
 */
export function getStorageRiskLevel() {
  const isIOS = isIOSDevice();
  const installed = isInstalledPWA();

  let risk = "low";
  let message = "Storage is stable";
  let recommendations = [];

  if (isIOS && !installed) {
    risk = "high";
    message = "iOS browser mode - data may be evicted after 7 days of inactivity";
    recommendations.push("Install PWA to home screen for permanent storage");
    recommendations.push("Use app regularly to prevent eviction");
  } else if (isIOS && installed) {
    risk = "low";
    message = "iOS PWA installed - storage is protected";
    recommendations.push("Keep PWA installed on home screen");
  } else {
    risk = "low";
    message = "Storage is stable on this platform";
  }

  return {
    risk,
    message,
    recommendations,
    isIOS,
    installed
  };
}

/**
 * Initialize storage persistence system
 * Call this on app startup
 * @returns {Promise<Object>} Initialization result
 */
export async function initStoragePersistence() {
  console.log("[Storage] Initializing storage persistence...");

  // Get environment info
  const isIOS = isIOSDevice();
  const installed = isInstalledPWA();
  const riskLevel = getStorageRiskLevel();

  console.log("[Storage] Environment:", {
    platform: isIOS ? "iOS" : "Other",
    mode: installed ? "Installed PWA" : "Browser",
    risk: riskLevel.risk
  });

  // Request persistent storage
  const persisted = await requestPersistentStorage();

  // Get storage info
  const storageInfo = await getStorageInfo();

  // Warn if high risk
  if (riskLevel.risk === "high") {
    console.warn("[Storage] ⚠️ HIGH RISK:", riskLevel.message);
    riskLevel.recommendations.forEach(rec => {
      console.warn("[Storage] 💡", rec);
    });
  }

  return {
    persisted,
    storageInfo,
    riskLevel,
    isIOS,
    installed
  };
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Export all data for backup
 * @returns {Object} All localStorage data
 */
export function exportAllData() {
  const data = {};
  const keys = [
    "workout-timer-settings",
    "workout-timer-favorites",
    "workout-timer-song-history",
    "workout-timer-plans",
    "workout-timer-active-plan"
  ];

  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        data[key] = value;
      }
    }
  });

  data._exportDate = new Date().toISOString();
  data._appVersion = window.__APP_VERSION__ || "unknown";

  return data;
}

/**
 * Import data from backup
 * @param {Object} data - Data to import
 * @returns {Object} Import result
 */
export function importAllData(data) {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid data format" };
  }

  let imported = 0;
  let errors = [];

  Object.keys(data).forEach(key => {
    if (key.startsWith("_")) return; // Skip metadata

    try {
      const value = typeof data[key] === "string"
        ? data[key]
        : JSON.stringify(data[key]);

      localStorage.setItem(key, value);
      imported++;
    } catch (error) {
      errors.push(`${key}: ${error.message}`);
    }
  });

  return {
    success: errors.length === 0,
    imported,
    errors
  };
}
