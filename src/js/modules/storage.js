/**
 * Storage Module - localStorage operations
 */

const STORAGE_KEY = "workout-timer-settings";

const DEFAULT_SETTINGS = {
  duration: 30,
  alertTime: 3,
  repetitions: 3,
  restTime: 10
};

/**
 * Load settings from localStorage
 * @returns {Object} Settings object with defaults
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? {...DEFAULT_SETTINGS, ...JSON.parse(stored)} : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings to save
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear settings:", error);
  }
}

// ===== YouTube Song History =====

const SONG_HISTORY_KEY = "workout-timer-song-history";
const MAX_SONG_HISTORY = 50; // Keep more songs but only thumbnail select ones
const MAX_THUMBNAIL_RECENT = 20; // Store thumbnails for last 20 played
const MAX_THUMBNAIL_TOP = 10; // Store thumbnails for top 10 most played

/**
 * Save a song to history
 * @param {Object} songData - Song information
 * @param {string} songData.videoId - YouTube video ID
 * @param {string} songData.title - Video title
 * @param {string} songData.channel - YouTube channel name
 * @param {number} songData.duration - Video duration in seconds
 * @param {string} songData.url - Original YouTube URL
 */
export function saveSongToHistory(songData) {
  try {
    const history = getSongHistory();

    // Check if song already exists (by videoId)
    const existingIndex = history.findIndex(song => song.videoId === songData.videoId);

    // Create song entry with metadata
    const songEntry = {
      videoId: songData.videoId,
      title: songData.title,
      channel: songData.channel,
      duration: songData.duration,
      url: songData.url,
      thumbnail: `https://img.youtube.com/vi/${songData.videoId}/mqdefault.jpg`, // Medium quality thumbnail (320x180)
      playedAt: new Date().toISOString(),
      playCount: 1
    };

    // If song exists, update it and move to front
    if (existingIndex !== -1) {
      songEntry.playCount = history[existingIndex].playCount + 1;
      history.splice(existingIndex, 1);
    }

    // Add to beginning of array (most recent first)
    history.unshift(songEntry);

    // Trim to max history size
    if (history.length > MAX_SONG_HISTORY) {
      history.splice(MAX_SONG_HISTORY);
    }

    // Optimize thumbnails - only keep for top played and recent
    optimizeThumbnails(history);

    // Save back to localStorage
    localStorage.setItem(SONG_HISTORY_KEY, JSON.stringify(history));

    console.log(`Song saved to history: ${songData.title}`);
  } catch (error) {
    console.error("Failed to save song to history:", error);
  }
}

/**
 * Get song history from localStorage
 * @returns {Array} Array of song objects, most recent first
 */
export function getSongHistory() {
  try {
    const stored = localStorage.getItem(SONG_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load song history:", error);
    return [];
  }
}

/**
 * Clear all song history
 */
export function clearSongHistory() {
  try {
    localStorage.removeItem(SONG_HISTORY_KEY);
    console.log("Song history cleared");
  } catch (error) {
    console.error("Failed to clear song history:", error);
  }
}

/**
 * Remove a specific song from history
 * @param {string} videoId - Video ID to remove
 */
export function removeSongFromHistory(videoId) {
  try {
    const history = getSongHistory();
    const filtered = history.filter(song => song.videoId !== videoId);
    localStorage.setItem(SONG_HISTORY_KEY, JSON.stringify(filtered));
    console.log(`Song removed from history: ${videoId}`);
  } catch (error) {
    console.error("Failed to remove song from history:", error);
  }
}

/**
 * Get most played songs
 * @param {number} limit - Number of songs to return
 * @returns {Array} Array of most played songs
 */
export function getMostPlayedSongs(limit = 10) {
  try {
    const history = getSongHistory();
    return history
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get most played songs:", error);
    return [];
  }
}

/**
 * Optimize thumbnails in history
 * Only keep thumbnails for:
 * - Last 20 most recent songs
 * - Top 10 most played songs
 * @param {Array} history - Song history array
 * @private
 */
function optimizeThumbnails(history) {
  if (history.length === 0) return;

  // Get video IDs that should keep thumbnails
  const thumbnailWhitelist = new Set();

  // Add last 20 recent songs (already sorted by recency)
  history.slice(0, MAX_THUMBNAIL_RECENT).forEach(song => {
    thumbnailWhitelist.add(song.videoId);
  });

  // Add top 10 most played songs
  const topPlayed = [...history]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, MAX_THUMBNAIL_TOP);

  topPlayed.forEach(song => {
    thumbnailWhitelist.add(song.videoId);
  });

  // Remove thumbnails from songs not in whitelist
  history.forEach(song => {
    if (!thumbnailWhitelist.has(song.videoId)) {
      delete song.thumbnail;
    }
  });

  console.log(`Thumbnails kept for ${thumbnailWhitelist.size} songs`);
}
