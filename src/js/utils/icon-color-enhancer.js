/**
 * Icon Color Enhancer - Automatically adds color classes to SVG icons
 *
 * This script runs on page load and adds contextual color classes to all
 * icons that have class="svg-icon" but are missing color classes.
 */

/**
 * Map of SVG file paths to color classes
 */
const ICON_PATH_TO_COLOR = {
  // Music & Playback - Hot Pink
  "media/play.svg": "icon-music",
  "media/pause.svg": "icon-music",
  "media/shuffle.svg": "icon-music",
  "media/music-note-01.svg": "icon-music",
  "media/music-note-02.svg": "icon-music",
  "media/speaker.svg": "icon-music",
  "media/mic-01.svg": "icon-music",
  "image-camera-and-video/play-circle.svg": "icon-music",
  "brand-logo/youtube.svg": "icon-music",

  // Timer & Time - Cyan
  "date-and-time/clock-01.svg": "icon-timer",
  "date-and-time/timer-01.svg": "icon-timer",
  "date-and-time/calendar-01.svg": "icon-timer",
  "date-and-time/calendar-02.svg": "icon-timer",
  "date-and-time/calendar-check-in-01.svg": "icon-timer",

  // Favorites - Hot Pink
  "bookmark-favorite/favourite.svg": "icon-favorite",
  "bookmark-favorite/star.svg": "icon-favorite",

  // Mood & Emotions - Hot Pink (same as music)
  "smiley-and-emojis/smile.svg": "icon-music",

  // Stats & Charts - Purple
  "business-and-finance/pie-chart.svg": "icon-history",
  "business-and-finance/chart-line-data-01.svg": "icon-history",
  "business-and-finance/chart-increase.svg": "icon-history",
  "business-and-finance/chart-decrease.svg": "icon-history",
  "dashboard/dashboard-speed-01.svg": "icon-history",
  "gym-and-fitness/wellness.svg": "icon-history",

  // Users - Purple
  "users/user.svg": "icon-secondary",
  "users/user-group.svg": "icon-secondary",
  "users/user-circle.svg": "icon-secondary",
  "users/user-add-01.svg": "icon-secondary",

  // Success - Cyan
  "check-validation/checkmark-circle-01.svg": "icon-success",

  // Alerts - Hot Pink
  "alert-notification/warning-circle.svg": "icon-alert",
  "alert-notification/alert-01.svg": "icon-alert",
  "alert-notification/alert-circle.svg": "icon-alert",

  // Special icons with specific colors
  "bookmark-favorite/favourite.svg": "icon-heart",
};

/**
 * Get color class from icon src path
 * @param {string} src - Icon src attribute (e.g., "/svg-icons/media/play.svg")
 * @returns {string} Color class or empty string
 */
function getColorClassFromPath(src) {
  if (!src) return "";

  // Extract path after /svg-icons/
  const match = src.match(/\/svg-icons\/(.+)$/);
  if (!match) return "";

  const iconPath = match[1];

  // Check exact match first
  if (ICON_PATH_TO_COLOR[iconPath]) {
    return ICON_PATH_TO_COLOR[iconPath];
  }

  // Check category-based fallbacks
  if (iconPath.startsWith("media/")) return "icon-music";
  if (iconPath.startsWith("date-and-time/")) return "icon-timer";
  if (iconPath.startsWith("bookmark-favorite/")) return "icon-favorite";
  if (iconPath.startsWith("business-and-finance/")) return "icon-history";
  if (iconPath.startsWith("users/")) return "icon-secondary";
  if (iconPath.startsWith("alert-notification/")) return "icon-alert";
  if (iconPath.startsWith("check-validation/")) return "icon-success";
  if (iconPath.startsWith("energy/")) return "icon-music";
  if (iconPath.startsWith("gym-and-fitness/")) return "icon-history";
  if (iconPath.startsWith("dashboard/")) return "icon-history";

  // Default to white for unmapped icons
  return "icon-white";
}

/**
 * Check if icon already has a color class
 * @param {HTMLElement} icon - Icon element
 * @returns {boolean} True if has color class
 */
function hasColorClass(icon) {
  const colorClasses = [
    "icon-cyan", "icon-pink", "icon-purple", "icon-white", "icon-gray",
    "icon-music", "icon-timer", "icon-favorite", "icon-history",
    "icon-success", "icon-alert", "icon-secondary", "icon-heart",
    "icon-play", "icon-pause", "icon-shuffle", "icon-clock", "icon-calendar"
  ];

  return colorClasses.some(cls => icon.classList.contains(cls));
}

/**
 * Add color class to an icon element
 * @param {HTMLElement} icon - Icon element
 */
function enhanceIcon(icon) {
  // Skip if already has color class
  if (hasColorClass(icon)) return;

  const src = icon.getAttribute("src");
  const colorClass = getColorClassFromPath(src);

  if (colorClass) {
    icon.classList.add(colorClass);
  }
}

/**
 * Enhance all SVG icons on the page
 */
export function enhanceAllIcons() {
  const icons = document.querySelectorAll("img.svg-icon");
  icons.forEach(enhanceIcon);
}

/**
 * Initialize icon color enhancement
 * Runs automatically when imported
 */
export function initIconColorEnhancer() {
  // Enhance icons on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceAllIcons);
  } else {
    enhanceAllIcons();
  }

  // Also enhance icons added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if the added node itself is an icon
          if (node.matches && node.matches("img.svg-icon")) {
            enhanceIcon(node);
          }
          // Check for icons within the added node
          if (node.querySelectorAll) {
            const icons = node.querySelectorAll("img.svg-icon");
            icons.forEach(enhanceIcon);
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log("🎨 Icon color enhancer initialized");
}

export default {
  enhanceAllIcons,
  initIconColorEnhancer,
  getColorClassFromPath,
  enhanceIcon
};
