/**
 * Favorites Storage Module - Core CRUD operations for favorite songs
 * Manages localStorage operations for favorites
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

// Export constants for use in other modules
export {FAVORITES_KEY, MAX_FAVORITES};
