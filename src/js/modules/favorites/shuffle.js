/**
 * Favorites Shuffle Module - Random and shuffle operations
 * Provides random selection and shuffling of favorite songs
 */

import { getFavorites } from './storage.js';

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
