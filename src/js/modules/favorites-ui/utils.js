/**
 * Favorites UI Utils - Utility functions
 */

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  // Handle invalid or missing duration
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return "0:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
