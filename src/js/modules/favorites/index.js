/**
 * Favorites Module - Main entry point
 * Re-exports all favorites functionality from submodules
 */

// Storage operations (CRUD)
export {
  getFavorites,
  isFavorite,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  getFavoritesCount,
  clearAllFavorites,
  FAVORITES_KEY,
  MAX_FAVORITES
} from "./storage.js";

// Shuffle and random operations
export {
  getRandomFavorite,
  getShuffledFavorites
} from "./shuffle.js";
