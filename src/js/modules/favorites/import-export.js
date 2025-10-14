/**
 * Favorites Import/Export Module - File operations and data portability
 * Handles exporting favorites to JSON and importing from files
 */

import {getFavorites, MAX_FAVORITES} from "./storage.js";

/**
 * Export favorites as JSON
 * @returns {string} JSON string of favorites
 */
export function exportFavorites() {
  try {
    const favorites = getFavorites();

    // Create export object with metadata
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appName: "CYCLE Workout Timer",
      count: favorites.length,
      favorites: favorites
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Failed to export favorites:", error);
    throw error;
  }
}

/**
 * Import favorites from JSON
 * @param {string} jsonString - JSON string of favorites
 * @param {boolean} merge - If true, merge with existing favorites; if false, replace
 * @returns {Object} Import result { success: boolean, imported: number, skipped: number, errors: Array }
 */
export function importFavorites(jsonString, merge = true) {
  try {
    const importData = JSON.parse(jsonString);

    // Validate import data structure
    if (!importData.favorites || !Array.isArray(importData.favorites)) {
      throw new Error("Invalid import file format: missing favorites array");
    }

    const existingFavorites = merge ? getFavorites() : [];
    const existingIds = new Set(existingFavorites.map(fav => fav.videoId));

    let imported = 0;
    let skipped = 0;
    const errors = [];

    // Process each favorite
    for (const favorite of importData.favorites) {
      // Validate required fields
      if (!favorite.videoId || !favorite.title || !favorite.url) {
        errors.push(`Invalid favorite entry: missing required fields`);
        skipped++;
        continue;
      }

      // Skip if already exists (in merge mode)
      if (existingIds.has(favorite.videoId)) {
        skipped++;
        continue;
      }

      // Check max limit
      if (existingFavorites.length + imported >= MAX_FAVORITES) {
        errors.push(`Maximum favorites limit (${MAX_FAVORITES}) reached`);
        break;
      }

      // Ensure thumbnail exists
      if (!favorite.thumbnail) {
        favorite.thumbnail = `https://img.youtube.com/vi/${favorite.videoId}/mqdefault.jpg`;
      }

      // Ensure favoritedAt exists
      if (!favorite.favoritedAt) {
        favorite.favoritedAt = new Date().toISOString();
      }

      existingFavorites.push(favorite);
      existingIds.add(favorite.videoId);
      imported++;
    }

    // Save updated favorites
    localStorage.setItem("workout-timer-favorites", JSON.stringify(existingFavorites));

    console.log(`Import complete: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);

    return {
      success: true,
      imported,
      skipped,
      errors
    };
  } catch (error) {
    console.error("Failed to import favorites:", error);
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error.message]
    };
  }
}

/**
 * Download favorites as JSON file
 */
export function downloadFavoritesFile() {
  try {
    const jsonString = exportFavorites();
    const blob = new Blob([jsonString], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `cycle-favorites-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL object
    URL.revokeObjectURL(url);

    console.log("Favorites file downloaded");
    return true;
  } catch (error) {
    console.error("Failed to download favorites file:", error);
    throw error;
  }
}

/**
 * Trigger file picker to import favorites from file
 * @param {boolean} merge - If true, merge with existing favorites; if false, replace
 * @returns {Promise<Object>} Import result
 */
export function uploadFavoritesFile(merge = true) {
  return new Promise((resolve, reject) => {
    try {
      // Create file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";

      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) {
            reject(new Error("No file selected"));
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const result = importFavorites(event.target.result, merge);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    } catch (error) {
      reject(error);
    }
  });
}
