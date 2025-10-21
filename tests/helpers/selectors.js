/**
 * Actual Selectors for CYCLE Workout Timer
 * Maps to real HTML elements in the application
 */

export const SELECTORS = {
  // Timer
  timerDisplay: "#timerDisplay",
  timerValue: "#timerValue",
  repCounter: "#repCounter",
  startButton: "#startBtn",
  resetButton: "#resetBtn",
  clearAllButton: "#clearAllBtn",

  // Music Controls
  musicControls: "#musicControls",
  musicTitle: "#musicTitle",
  musicPlayPauseBtn: "#musicPlayPauseBtn",
  musicFavoriteBtn: "#musicFavoriteBtn",
  player: "#youtube-player-iframe",

  // Favorites
  favoriteButton: ".song-favorite-btn[data-action=\"toggle-favorite\"]",
  favoriteItem: ".favorite-item",
  songCard: ".song-card",
  songCardRemove: ".song-card-remove",
  shuffleFavoritesBtn: "#shuffleFavoritesBtn",

  // Library/History
  musicLibraryPopover: "#musicLibraryPopover",
  historyBtn: "#historyBtn",
  historyContent: "#historyContent",
  historyEmpty: ".history-empty",
  historyTab: ".history-tab",

  // Settings
  settings: "#settings",
  durationInput: "#duration",
  alertTimeInput: "#alertTime",
  repetitionsInput: "#repetitions",
  restTimeInput: "#restTime",

  // Genre/Mood Selectors
  genrePopover: "#genrePopover",
  moodPopover: "#moodPopover",
  genreTag: ".genre-tag",
  moodTag: ".mood-tag",
  genrePopoverClose: ".genre-popover-close",
  moodPopoverClose: ".mood-popover-close",

  // YouTube Section
  youtubeUrl: "#youtubeUrl",
  loadYoutubeBtn: "#loadYoutubeBtn",
  youtubeSection: ".youtube-section",

  // Overlays
  updateOverlay: "#updateOverlay",
  loadingOverlay: "#loadingOverlay",

  // Song Cards
  songCardTitle: ".song-card-title",
  songCardThumbnail: ".song-card-thumbnail",
  songCardChannel: ".song-card-channel",

  // Mode Toggle
  linkModeBtn: "#linkModeBtn",
  moodModeBtn: "button.mode-toggle-btn[popovertarget=\"moodPopover\"]",
  genreModeBtn: "button.mode-toggle-btn[popovertarget=\"genrePopover\"]"
};

/**
 * Get selector for tab by name
 */
export function getTabSelector(tabName) {
  return `.history-tab[data-tab="${tabName}"]`;
}

/**
 * Get selector for genre tag by query
 */
export function getGenreSelector(genre) {
  return `.genre-tag[data-query*="${genre}"]`;
}

/**
 * Get selector for mood tag by query
 */
export function getMoodSelector(mood) {
  return `.mood-tag[data-query*="${mood}"]`;
}

/**
 * Get selector for favorite button by video ID
 */
export function getFavoriteButtonSelector(videoId) {
  return `.song-favorite-btn[data-video-id="${videoId}"]`;
}
