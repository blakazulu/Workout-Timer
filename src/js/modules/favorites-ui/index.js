/**
 * Favorites UI Module - Main entry point
 * Re-exports all favorites UI functionality from submodules
 */

export {
  initFavoritesUI,
  updateFavoriteButton,
  updateFavoritesBadge
} from './initialization.js';

export {
  renderFavorites
} from './rendering.js';

export {
  setupFavoritesActions
} from './actions.js';

export {
  highlightFavoritesInHistory
} from './state.js';
