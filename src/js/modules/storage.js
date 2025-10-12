/**
 * Storage Module - localStorage operations
 */

const STORAGE_KEY = 'workout-timer-settings'

const DEFAULT_SETTINGS = {
  duration: 30,
  alertTime: 5,
  repetitions: 3,
  restTime: 10
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object with defaults
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch (error) {
    console.error('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings to save
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear settings:', error)
  }
}
