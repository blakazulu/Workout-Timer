/**
 * Favorites Module - localStorage operations for favorite songs
 * Manages favorite songs with CRUD operations, export/import, and shuffle
 */

const FAVORITES_KEY = "workout-timer-favorites";
const MAX_FAVORITES = 100; // Limit to prevent localStorage overflow

/**
 * Get all favorite songs from localStorage
 * @returns {Array} Array of favorite song objects
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
}

/**
 * Check if a song is favorited
 * @param {string} videoId - YouTube video ID
 * @returns {boolean} True if song is favorited
 */
export function isFavorite(videoId) {
  if (!videoId) return false;

  try {
    const favorites = getFavorites();
    return favorites.some(fav => fav.videoId === videoId);
  } catch (error) {
    console.error("Failed to check favorite status:", error);
    return false;
  }
}

/**
 * Add a song to favorites
 * @param {Object} songData - Song information
 * @param {string} songData.videoId - YouTube video ID
 * @param {string} songData.title - Video title
 * @param {string} songData.channel - YouTube channel name
 * @param {number} songData.duration - Video duration in seconds
 * @param {string} songData.url - Original YouTube URL
 * @returns {boolean} Success status
 */
export function addToFavorites(songData) {
  try {
    console.log("➕ Adding song to favorites - Input data:", songData);

    const favorites = getFavorites();

    // Check if already favorited
    if (favorites.some(fav => fav.videoId === songData.videoId)) {
      console.log("⚠️ Song already in favorites:", songData.videoId);
      return false;
    }

    // Check max limit
    if (favorites.length >= MAX_FAVORITES) {
      throw new Error(`Maximum favorites limit (${MAX_FAVORITES}) reached`);
    }

    // Create favorite entry with metadata
    const favoriteEntry = {
      videoId: songData.videoId,
      title: songData.title,
      channel: songData.channel,
      duration: songData.duration,
      url: songData.url,
      thumbnail: `https://img.youtube.com/vi/${songData.videoId}/mqdefault.jpg`,
      favoritedAt: new Date().toISOString()
    };

    console.log("💾 Created favorite entry:", favoriteEntry);

    // Add to beginning of array (most recent first)
    favorites.unshift(favoriteEntry);

    // Save back to localStorage
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    console.log(`✅ Song added to favorites: ${songData.title} (Total favorites: ${favorites.length})`);
    return true;
  } catch (error) {
    console.error("❌ Failed to add song to favorites:", error);
    throw error;
  }
}

/**
 * Remove a song from favorites
 * @param {string} videoId - Video ID to remove
 * @returns {boolean} Success status
 */
export function removeFromFavorites(videoId) {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.videoId !== videoId);

    if (filtered.length === favorites.length) {
      console.log("Song not found in favorites");
      return false;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    console.log(`Song removed from favorites: ${videoId}`);
    return true;
  } catch (error) {
    console.error("Failed to remove song from favorites:", error);
    return false;
  }
}

/**
 * Toggle favorite status of a song
 * @param {Object} songData - Song information (same as addToFavorites)
 * @returns {boolean} New favorite status (true = favorited, false = unfavorited)
 */
export function toggleFavorite(songData) {
  try {
    if (isFavorite(songData.videoId)) {
      removeFromFavorites(songData.videoId);
      return false;
    } else {
      addToFavorites(songData);
      return true;
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    throw error;
  }
}

/**
 * Get count of favorited songs
 * @returns {number} Number of favorites
 */
export function getFavoritesCount() {
  try {
    return getFavorites().length;
  } catch (error) {
    console.error("Failed to get favorites count:", error);
    return 0;
  }
}

/**
 * Clear all favorites
 * @returns {boolean} Success status
 */
export function clearAllFavorites() {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    console.log("All favorites cleared");
    return true;
  } catch (error) {
    console.error("Failed to clear favorites:", error);
    return false;
  }
}

/**
 * Get a random favorite song
 * @returns {Object|null} Random favorite song or null if no favorites
 */
export function getRandomFavorite() {
  try {
    const favorites = getFavorites();
    if (favorites.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * favorites.length);
    return favorites[randomIndex];
  } catch (error) {
    console.error("Failed to get random favorite:", error);
    return null;
  }
}

/**
 * Shuffle and get all favorites in random order
 * @returns {Array} Shuffled array of favorite songs
 */
export function getShuffledFavorites() {
  try {
    const favorites = [...getFavorites()]; // Create copy to avoid mutating original

    // Fisher-Yates shuffle algorithm
    for (let i = favorites.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [favorites[i], favorites[j]] = [favorites[j], favorites[i]];
    }

    return favorites;
  } catch (error) {
    console.error("Failed to shuffle favorites:", error);
    return [];
  }
}

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
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(existingFavorites));

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
    const blob = new Blob([jsonString], { type: "application/json" });
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
