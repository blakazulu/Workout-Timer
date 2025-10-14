/**
 * Event Constants - Typed event names for consistency
 *
 * Provides a centralized list of all application events with consistent
 * naming conventions to prevent typos and improve discoverability.
 *
 * Naming Convention: <domain>:<action>[:<detail>]
 *
 * @example
 * import { EVENTS } from './core/events.js';
 * import { eventBus } from './core/event-bus.js';
 *
 * // Emit an event
 * eventBus.emit(EVENTS.TIMER_STARTED, { startTime: Date.now() });
 *
 * // Subscribe to an event
 * eventBus.on(EVENTS.TIMER_STARTED, (data) => {
 *   console.log('Timer started!', data);
 * });
 */

export const EVENTS = {
  // ==================
  // Timer Events
  // ==================
  TIMER_STARTED: 'timer:started',
  TIMER_PAUSED: 'timer:paused',
  TIMER_RESUMED: 'timer:resumed',
  TIMER_STOPPED: 'timer:stopped',
  TIMER_COMPLETED: 'timer:completed',
  TIMER_TICK: 'timer:tick',
  TIMER_WORK_STARTED: 'timer:work:started',
  TIMER_REST_STARTED: 'timer:rest:started',
  TIMER_SETTINGS_CHANGED: 'timer:settings:changed',

  // ==================
  // Music Events
  // ==================
  MUSIC_PLAYING: 'music:playing',
  MUSIC_PAUSED: 'music:paused',
  MUSIC_STOPPED: 'music:stopped',
  MUSIC_RESUMED: 'music:resumed',
  MUSIC_TRACK_CHANGED: 'music:track:changed',
  MUSIC_TRACK_LOADED: 'music:track:loaded',
  MUSIC_TRACK_ERROR: 'music:track:error',
  MUSIC_VOLUME_CHANGED: 'music:volume:changed',
  MUSIC_MODE_CHANGED: 'music:mode:changed',
  MUSIC_PROGRESS_UPDATE: 'music:progress:update',

  // ==================
  // UI Events
  // ==================
  UI_PANEL_OPENED: 'ui:panel:opened',
  UI_PANEL_CLOSED: 'ui:panel:closed',
  UI_THEME_CHANGED: 'ui:theme:changed',
  UI_LIBRARY_OPENED: 'ui:library:opened',
  UI_LIBRARY_CLOSED: 'ui:library:closed',
  UI_SETTINGS_OPENED: 'ui:settings:opened',
  UI_SETTINGS_CLOSED: 'ui:settings:closed',
  UI_MOOD_SELECTOR_OPENED: 'ui:mood:opened',
  UI_MOOD_SELECTOR_CLOSED: 'ui:mood:closed',
  UI_GENRE_SELECTOR_OPENED: 'ui:genre:opened',
  UI_GENRE_SELECTOR_CLOSED: 'ui:genre:closed',
  UI_SEARCH_OPENED: 'ui:search:opened',
  UI_SEARCH_CLOSED: 'ui:search:closed',
  UI_CONTROLS_SHOWN: 'ui:controls:shown',
  UI_CONTROLS_HIDDEN: 'ui:controls:hidden',

  // ==================
  // Favorites Events
  // ==================
  FAVORITES_ADDED: 'favorites:added',
  FAVORITES_REMOVED: 'favorites:removed',
  FAVORITES_LOADED: 'favorites:loaded',
  FAVORITES_CLEARED: 'favorites:cleared',
  FAVORITES_UPDATED: 'favorites:updated',

  // ==================
  // Settings Events
  // ==================
  SETTINGS_LOADED: 'settings:loaded',
  SETTINGS_UPDATED: 'settings:updated',
  SETTINGS_SAVED: 'settings:saved',
  SETTINGS_RESET: 'settings:reset',

  // ==================
  // Search Events
  // ==================
  SEARCH_QUERY_CHANGED: 'search:query:changed',
  SEARCH_RESULTS_LOADED: 'search:results:loaded',
  SEARCH_RESULTS_ERROR: 'search:results:error',
  SEARCH_ITEM_SELECTED: 'search:item:selected',

  // ==================
  // Notification Events
  // ==================
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_HIDE: 'notification:hide',
  NOTIFICATION_PERMISSION_CHANGED: 'notification:permission:changed',

  // ==================
  // State Events
  // ==================
  STATE_CHANGED: 'state:changed',
  STATE_RESET: 'state:reset',
  STATE_MERGED: 'state:merged',

  // ==================
  // PWA Events
  // ==================
  PWA_INSTALL_PROMPT: 'pwa:install:prompt',
  PWA_INSTALLED: 'pwa:installed',
  PWA_UPDATE_AVAILABLE: 'pwa:update:available',
  PWA_UPDATE_INSTALLED: 'pwa:update:installed',

  // ==================
  // Error Events
  // ==================
  ERROR_OCCURRED: 'error:occurred',
  ERROR_NETWORK: 'error:network',
  ERROR_PLAYBACK: 'error:playback',
  ERROR_STORAGE: 'error:storage',

  // ==================
  // Gesture Events
  // ==================
  GESTURE_SWIPE_UP: 'gesture:swipe:up',
  GESTURE_SWIPE_DOWN: 'gesture:swipe:down',
  GESTURE_SWIPE_LEFT: 'gesture:swipe:left',
  GESTURE_SWIPE_RIGHT: 'gesture:swipe:right',
};

/**
 * Event payload type hints (for documentation purposes)
 * These describe what data each event should carry
 */
export const EVENT_PAYLOADS = {
  [EVENTS.TIMER_STARTED]: '{ startTime: number }',
  [EVENTS.TIMER_PAUSED]: '{ currentTime: number }',
  [EVENTS.TIMER_COMPLETED]: '{ totalTime: number }',
  [EVENTS.TIMER_TICK]: '{ currentTime: number, remainingTime: number }',

  [EVENTS.MUSIC_PLAYING]: '{ videoId: string, title: string }',
  [EVENTS.MUSIC_TRACK_CHANGED]: '{ videoId: string, title: string, previousTrack: string }',
  [EVENTS.MUSIC_VOLUME_CHANGED]: '{ volume: number, previousVolume: number }',
  [EVENTS.MUSIC_PROGRESS_UPDATE]: '{ currentTime: number, duration: number }',

  [EVENTS.UI_PANEL_OPENED]: '{ panelName: string }',
  [EVENTS.UI_PANEL_CLOSED]: '{ panelName: string }',

  [EVENTS.FAVORITES_ADDED]: '{ trackId: string, trackTitle: string }',
  [EVENTS.FAVORITES_REMOVED]: '{ trackId: string }',

  [EVENTS.SETTINGS_UPDATED]: '{ key: string, value: any, previousValue: any }',

  [EVENTS.SEARCH_RESULTS_LOADED]: '{ query: string, results: Array }',
  [EVENTS.SEARCH_ITEM_SELECTED]: '{ item: Object }',

  [EVENTS.STATE_CHANGED]: '{ path: string, value: any, oldValue: any }',

  [EVENTS.ERROR_OCCURRED]: '{ message: string, error: Error, context: string }',
};

// Freeze the EVENTS object to prevent modifications
Object.freeze(EVENTS);
Object.freeze(EVENT_PAYLOADS);
