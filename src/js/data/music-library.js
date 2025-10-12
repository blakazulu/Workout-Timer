/**
 * Music Library - Verified Workout Music Collection
 *
 * This module loads curated, verified YouTube workout music organized by moods and genres.
 * All links have been verified to work and match their descriptions.
 */

// Import the song data
import songData from "./workout_music.json";

/**
 * Get playlists for a mood
 * @param {string} query - Mood query key
 * @returns {Array} Array of playlist objects with title, url, thumbnail, duration, artist
 */
export function getMoodPlaylists(query) {
  return songData[query] || [];
}

/**
 * Get songs for a genre
 * @param {string} query - Genre query key
 * @returns {Array} Array of song objects with title, url, thumbnail, duration, artist
 */
export function getGenreSongs(query) {
  return songData[query] || [];
}

/**
 * Check if a query is a mood (vs genre)
 * @param {string} query - Query to check
 * @returns {boolean} True if it's a mood query
 */
export function isMoodQuery(query) {
  const moodKeys = [
    "beast mode workout music",
    "intense workout music",
    "energetic workout music",
    "power workout music",
    "aggressive workout music",
    "pump up workout music",
    "focus workout music",
    "motivational workout music"
  ];
  return moodKeys.includes(query);
}

/**
 * Get all available moods
 * @returns {Array} Array of mood keys
 */
export function getAllMoods() {
  return [
    "beast mode workout music",
    "intense workout music",
    "energetic workout music",
    "power workout music",
    "aggressive workout music",
    "pump up workout music",
    "focus workout music",
    "motivational workout music"
  ];
}

/**
 * Get all available genres
 * @returns {Array} Array of genre keys
 */
export function getAllGenres() {
  return [
    "edm workout music",
    "rock workout music",
    "hip hop workout music",
    "metal workout music",
    "trap workout music",
    "dubstep workout music",
    "hardstyle workout music",
    "techno workout music",
    "phonk workout music",
    "drum and bass workout music"
  ];
}
