/**
 * Application State - Centralized state management
 *
 * Manages shared application data with automatic change notifications
 * through the event bus.
 *
 * @example
 * import { appState } from './core/app-state.js';
 *
 * // Set state
 * appState.set('timer.isRunning', true);
 *
 * // Get state
 * const isRunning = appState.get('timer.isRunning');
 *
 * // Subscribe to changes
 * const unsubscribe = appState.subscribe('timer.isRunning', ({ value, oldValue }) => {
 *   console.log(`Timer state changed from ${oldValue} to ${value}`);
 * });
 */

import {eventBus} from "./event-bus.js";

class AppState {
  constructor() {
    this.state = {
      timer: {
        isRunning: false,
        isPaused: false,
        currentTime: 0,
        totalTime: 0,
        workMinutes: 30,
        restMinutes: 5,
      },
      music: {
        isPlaying: false,
        currentTrack: null,
        currentTrackTitle: "",
        volume: 70,
        mode: "mood", // 'mood' or 'genre'
        selectedMood: null,
        selectedGenre: null,
      },
      ui: {
        activePanel: null,
        theme: "dark",
        musicControlsVisible: false,
        libraryOpen: false,
      },
      settings: {
        notifications: true,
        autoplay: false,
        soundEnabled: true,
      },
      favorites: {
        tracks: [],
      },
    };

    this.debugMode = false;
  }

  /**
   * Get a value from state using dot notation path
   * @param {string} path - The path to the value (e.g., 'timer.isRunning')
   * @returns {*} The value at the path, or undefined if not found
   */
  get(path) {
    if (!path || typeof path !== "string") {
      console.warn("[AppState] Invalid path provided to get()");
      return undefined;
    }

    const value = path.split(".").reduce((obj, key) => {
      return obj !== undefined && obj !== null ? obj[key] : undefined;
    }, this.state);

    if (this.debugMode) {
      console.log(`[AppState] Get "${path}":`, value);
    }

    return value;
  }

  /**
   * Set a value in state using dot notation path
   * @param {string} path - The path to set (e.g., 'timer.isRunning')
   * @param {*} value - The value to set
   */
  set(path, value) {
    if (!path || typeof path !== "string") {
      console.warn("[AppState] Invalid path provided to set()");
      return;
    }

    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key] || typeof obj[key] !== "object") {
        obj[key] = {};
      }
      return obj[key];
    }, this.state);

    const oldValue = target[lastKey];

    // Only update and emit if value actually changed
    if (oldValue !== value) {
      target[lastKey] = value;

      if (this.debugMode) {
        console.log(`[AppState] Set "${path}":`, oldValue, "→", value);
      }

      // Emit both generic and specific state change events
      eventBus.emit("state:changed", {path, value, oldValue});
      eventBus.emit(`state:changed:${path}`, {value, oldValue});
    }
  }

  /**
   * Update a value using an updater function
   * @param {string} path - The path to update
   * @param {Function} updater - Function that receives current value and returns new value
   */
  update(path, updater) {
    if (typeof updater !== "function") {
      console.warn("[AppState] Updater must be a function");
      return;
    }

    const currentValue = this.get(path);
    const newValue = updater(currentValue);
    this.set(path, newValue);
  }

  /**
   * Subscribe to changes for a specific path
   * @param {string} path - The path to watch
   * @param {Function} handler - Callback function receiving { value, oldValue }
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, handler) {
    return eventBus.on(`state:changed:${path}`, handler);
  }

  /**
   * Subscribe to all state changes
   * @param {Function} handler - Callback function receiving { path, value, oldValue }
   * @returns {Function} Unsubscribe function
   */
  subscribeAll(handler) {
    return eventBus.on("state:changed", handler);
  }

  /**
   * Get the entire state object (use sparingly, prefer get())
   * @returns {Object} The entire state object
   */
  getState() {
    if (this.debugMode) {
      console.log("[AppState] Getting entire state");
    }
    return this.state;
  }

  /**
   * Reset state to initial values
   */
  reset() {
    const oldState = {...this.state};

    this.state = {
      timer: {
        isRunning: false,
        isPaused: false,
        currentTime: 0,
        totalTime: 0,
        workMinutes: 30,
        restMinutes: 5,
      },
      music: {
        isPlaying: false,
        currentTrack: null,
        currentTrackTitle: "",
        volume: 70,
        mode: "mood",
        selectedMood: null,
        selectedGenre: null,
      },
      ui: {
        activePanel: null,
        theme: "dark",
        musicControlsVisible: false,
        libraryOpen: false,
      },
      settings: {
        notifications: true,
        autoplay: false,
        soundEnabled: true,
      },
      favorites: {
        tracks: [],
      },
    };

    if (this.debugMode) {
      console.log("[AppState] State reset");
    }

    eventBus.emit("state:reset", {oldState, newState: this.state});
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`[AppState] Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Merge partial state (useful for loading saved settings)
   * @param {Object} partialState - Object to merge into state
   */
  merge(partialState) {
    if (!partialState || typeof partialState !== "object") {
      console.warn("[AppState] Invalid partial state provided to merge()");
      return;
    }

    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    deepMerge(this.state, partialState);

    if (this.debugMode) {
      console.log("[AppState] Merged partial state:", partialState);
    }

    eventBus.emit("state:merged", {partialState});
  }
}

// Export singleton instance
export const appState = new AppState();

// Also export the class for testing purposes
export {AppState};
