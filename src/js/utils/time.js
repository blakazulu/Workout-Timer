/**
 * Time Utility Functions
 */

/**
 * Format seconds to MM:SS format
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse time string (MM:SS) to seconds
 * @param {string} timeString - Time in MM:SS format
 * @returns {number} Total seconds
 */
export function parseTime(timeString) {
  const [mins, secs] = timeString.split(':').map(Number)
  return mins * 60 + secs
}
