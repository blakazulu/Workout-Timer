/**
 * Icon Mapper - Maps Phosphor icon classes to self-hosted SVG icons
 *
 * This utility provides a comprehensive mapping between old Phosphor icon classes
 * and the new self-hosted SVG icons in /public/svg-icons/
 */

/**
 * Contextual color class mapping based on icon category
 * Automatically applies theme colors to icons
 */
const ICON_COLOR_MAP = {
  // Music & Playback - Hot Pink
  music: ['ph-play', 'ph-pause', 'ph-shuffle', 'ph-music-notes', 'ph-music-notes-simple',
          'ph-music-note', 'ph-speaker-high', 'ph-microphone-stage', 'ph-play-circle',
          'ph-pause-circle', 'ph-stop-circle', 'ph-youtube-logo'],

  // Timer & Time - Cyan
  timer: ['ph-clock-counter-clockwise', 'ph-timer', 'ph-calendar', 'ph-calendar-blank',
          'ph-calendar-check'],

  // Favorites & Hearts - Hot Pink
  favorite: ['ph-heart', 'ph-star'],

  // History & Stats - Purple
  history: ['ph-chart-pie', 'ph-chart-line', 'ph-chart-line-up', 'ph-trend-up', 'ph-trend-down',
            'ph-activity', 'ph-gauge'],

  // Success & Primary - Cyan
  success: ['ph-check-circle'],

  // Alert & Warning - Hot Pink
  alert: ['ph-warning', 'ph-warning-circle'],

  // User & Profile - Purple
  secondary: ['ph-users', 'ph-user', 'ph-user-circle', 'ph-user-plus'],
};

/**
 * Get contextual color class for an icon
 * @param {string} iconClass - Phosphor icon class
 * @returns {string} Color class (e.g., 'icon-music', 'icon-timer')
 */
function getIconColorClass(iconClass) {
  // Clean the icon class
  const cleanClass = iconClass
    .replace(/ph-bold/g, '')
    .replace(/ph-fill/g, '')
    .replace(/ph-regular/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Check each color category
  for (const [colorName, icons] of Object.entries(ICON_COLOR_MAP)) {
    if (icons.some(icon => cleanClass.includes(icon))) {
      return `icon-${colorName}`;
    }
  }

  // Default to white for unmatched icons
  return 'icon-white';
}

/**
 * Icon mapping from Phosphor classes to SVG file paths
 * Path is relative to /public/svg-icons/
 */
export const ICON_MAP = {
  // Media & Playback
  'ph-play': 'media/play.svg',
  'ph-pause': 'media/pause.svg',
  'ph-shuffle': 'media/shuffle.svg',
  'ph-music-notes': 'media/music-note-01.svg',
  'ph-music-notes-simple': 'media/music-note-02.svg',
  'ph-music-note': 'media/music-note-01.svg',
  'ph-speaker-high': 'media/speaker.svg',
  'ph-microphone-stage': 'media/mic-01.svg',
  'ph-play-circle': 'image-camera-and-video/play-circle.svg',
  'ph-pause-circle': 'media/pause.svg',
  'ph-stop-circle': 'media/stop.svg',

  // Navigation & Actions
  'ph-x': 'add-remove-delete/cancel-01.svg',
  'ph-heart': 'bookmark-favorite/favourite.svg',
  'ph-info': 'alert-notification/information-circle.svg',
  'ph-magnifying-glass': 'search/search.svg',
  'ph-download-simple': 'download-and-upload/download-01.svg',
  'ph-caret-double-up': 'arrows-round/arrow-up-double-round.svg',
  'ph-caret-right': 'arrows-round/arrow-right-01-round.svg',
  'ph-arrow-clockwise': 'arrows-round/arrow-reload-horizontal-round.svg',
  'ph-arrow-counter-clockwise': 'arrows-round/circle-arrow-reload-01-round.svg',
  'ph-arrows-clockwise': 'arrows-round/circle-arrow-reload-01-round.svg',
  'ph-check-circle': 'check-validation/checkmark-circle-01.svg',
  'ph-minus': 'add-remove-delete/remove-01.svg',

  // Time & Calendar
  'ph-clock-counter-clockwise': 'date-and-time/clock-01.svg',
  'ph-timer': 'date-and-time/timer-01.svg',
  'ph-calendar': 'date-and-time/calendar-01.svg',
  'ph-calendar-blank': 'date-and-time/calendar-02.svg',
  'ph-calendar-check': 'date-and-time/calendar-check-in-01.svg',

  // Brands
  'ph-youtube-logo': 'brand-logo/youtube.svg',

  // Emotions & Moods
  'ph-smiley': 'smiley-and-emojis/smile.svg',
  'ph-barbell': 'gym-and-fitness/dumbbell-01.svg',
  'ph-fire': 'energy/fire.svg',
  'ph-fire-simple': 'energy/fire.svg',
  'ph-lightning': 'energy/energy.svg',
  'ph-lightning-slash': 'energy/energy.svg',
  'ph-heartbeat': 'gym-and-fitness/wellness.svg',
  'ph-crosshair': 'game-and-sports/dart.svg',
  'ph-rocket-launch': 'space-galaxy/rocket-01.svg',
  'ph-gauge': 'dashboard/dashboard-speed-01.svg',
  'ph-activity': 'gym-and-fitness/wellness.svg',

  // Genre Icons
  'ph-guitar': 'game-and-sports/baseball-bat.svg',
  'ph-skull': 'smiley-and-emojis/dead.svg',
  'ph-robot': 'artificial-intelligence/robotic.svg',
  'ph-car': 'transportation/car-01.svg',

  // Admin & Settings
  'ph-lock': 'security/lock.svg',
  'ph-warning': 'alert-notification/alert-01.svg',
  'ph-warning-circle': 'alert-notification/alert-circle.svg',
  'ph-list': 'more-menu/menu-01.svg',
  'ph-house': 'home/home-01.svg',
  'ph-chart-pie': 'business-and-finance/pie-chart.svg',
  'ph-chart-line': 'business-and-finance/chart-line-data-01.svg',
  'ph-chart-line-up': 'business-and-finance/chart-increase.svg',
  'ph-gear': 'setting/setting-01.svg',
  'ph-users': 'users/user-group.svg',
  'ph-user': 'users/user.svg',
  'ph-user-circle': 'users/user-circle.svg',
  'ph-user-plus': 'users/user-add-01.svg',
  'ph-sign-out': 'login-and-logout/logout-01.svg',
  'ph-sign-in': 'login-and-logout/login-01.svg',
  'ph-funnel': 'filter-sorting/filter.svg',
  'ph-trend-up': 'business-and-finance/chart-increase.svg',
  'ph-trend-down': 'business-and-finance/chart-decrease.svg',
  'ph-trash': 'add-remove-delete/delete-01.svg',
  'ph-star': 'bookmark-favorite/star.svg',
  'ph-clipboard': 'education/clipboard.svg',
  'ph-circle': 'geometric-shapes/circle.svg',

  // View & Visibility
  'ph-eye': 'edit-formatting/view.svg',
  'ph-eye-slash': 'edit-formatting/view-off.svg',
  'ph-browsers': 'education/browser.svg',

  // Tags & Labels
  'ph-tag': 'bookmark-favorite/tag-01.svg',

  // Loading & Spinners
  'ph-spinner': 'mouse-and-courses/loading-01.svg',
};

/**
 * Get SVG icon path from Phosphor class name
 * @param {string} phosphorClass - Phosphor icon class (e.g., 'ph-heart', 'ph-play', 'ph-fill ph-play')
 * @returns {string} SVG file path or empty string if not found
 */
export function getIconPath(phosphorClass) {
  if (!phosphorClass) return '';

  // Remove 'ph-bold', 'ph-fill', 'ph-regular' prefixes and extra whitespace
  const cleanClass = phosphorClass
    .replace(/ph-bold/g, '')
    .replace(/ph-fill/g, '')
    .replace(/ph-regular/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to find the icon in the map
  const iconKey = cleanClass.startsWith('ph-') ? cleanClass : `ph-${cleanClass}`;
  return ICON_MAP[iconKey] || ICON_MAP[cleanClass] || '';
}

/**
 * Create an inline SVG icon element
 * @param {string} iconClass - Phosphor icon class or icon name
 * @param {Object} options - Options for the icon
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.alt - Alt text for accessibility
 * @param {number} options.width - Icon width (default: 24)
 * @param {number} options.height - Icon height (default: 24)
 * @returns {Promise<string>} HTML string with inline SVG
 */
export async function createInlineSVG(iconClass, options = {}) {
  const {
    className = '',
    alt = '',
    width = 24,
    height = 24
  } = options;

  const iconPath = getIconPath(iconClass);

  if (!iconPath) {
    console.warn(`Icon not found for class: ${iconClass}`);
    return `<span class="icon-missing ${className}" aria-label="${alt || iconClass}">?</span>`;
  }

  try {
    const response = await fetch(`/svg-icons/${iconPath}`);
    const svgContent = await response.text();

    // Parse SVG and add classes
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (svg) {
      svg.setAttribute('class', `svg-icon ${className}`.trim());
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      if (alt) {
        svg.setAttribute('aria-label', alt);
      }
      return svg.outerHTML;
    }
  } catch (error) {
    console.error(`Failed to load icon: ${iconPath}`, error);
  }

  return `<span class="icon-error ${className}" aria-label="${alt || iconClass}">✕</span>`;
}

/**
 * Create an img tag for SVG icon (simpler, faster alternative to inline SVG)
 * @param {string} iconClass - Phosphor icon class or icon name
 * @param {Object} options - Options for the icon
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.alt - Alt text for accessibility
 * @returns {string} HTML string with img tag
 */
export function createIconImg(iconClass, options = {}) {
  const {
    className = '',
    alt = '',
    color = '' // Allow manual color override
  } = options;

  const iconPath = getIconPath(iconClass);

  if (!iconPath) {
    console.warn(`Icon not found for class: ${iconClass}`);
    return `<span class="icon-missing ${className}" aria-label="${alt || iconClass}">?</span>`;
  }

  // Auto-apply contextual color unless manually overridden
  const colorClass = color || getIconColorClass(iconClass);
  const classes = `svg-icon ${colorClass} ${className}`.trim();

  return `<img src="/svg-icons/${iconPath}" class="${classes}" alt="${alt || iconClass}" />`;
}

/**
 * Replace all Phosphor icon <i> elements with SVG icons in a container
 * @param {HTMLElement} container - Container element
 */
export async function replacePhosphorIconsInElement(container) {
  if (!container) return;

  const iconElements = container.querySelectorAll('i[class*="ph-"]');

  for (const iconEl of iconElements) {
    const classList = iconEl.className.split(' ');
    const phosphorClass = classList.find(cls => cls.startsWith('ph-'));

    if (!phosphorClass) continue;

    const iconPath = getIconPath(phosphorClass);
    if (!iconPath) {
      console.warn(`No mapping found for icon: ${phosphorClass}`);
      continue;
    }

    // Create img element with contextual color
    const img = document.createElement('img');
    img.src = `/svg-icons/${iconPath}`;
    const colorClass = getIconColorClass(phosphorClass);
    img.className = iconEl.className.replace(/ph-\S+/g, '').trim() + ` svg-icon ${colorClass}`;
    img.alt = iconEl.getAttribute('aria-label') || phosphorClass;

    // Replace the icon element
    iconEl.replaceWith(img);
  }
}

/**
 * Create a simple SVG icon element (synchronous, for direct rendering)
 * @param {string} iconClass - Phosphor icon class (e.g., 'ph-heart', 'ph-fill ph-play')
 * @param {Object} options - Options for the icon
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.alt - Alt text for accessibility
 * @param {string|number} options.size - Icon size (default: '1em')
 * @returns {HTMLElement} img element with SVG icon
 */
export function createIcon(iconClass, options = {}) {
  const {
    className = '',
    alt = '',
    size = '1em',
    color = '' // Allow manual color override
  } = options;

  const iconPath = getIconPath(iconClass);

  if (!iconPath) {
    console.warn(`Icon not found for class: ${iconClass}`);
    const span = document.createElement('span');
    span.className = `icon-missing ${className}`;
    span.setAttribute('aria-label', alt || iconClass);
    span.textContent = '?';
    return span;
  }

  const img = document.createElement('img');
  img.src = `/svg-icons/${iconPath}`;

  // Auto-apply contextual color unless manually overridden
  const colorClass = color || getIconColorClass(iconClass);
  img.className = `svg-icon ${colorClass} ${className}`.trim();
  img.alt = alt || iconClass.replace(/^ph-/, '').replace(/-/g, ' ');

  // Set size
  if (size) {
    img.style.width = typeof size === 'number' ? `${size}px` : size;
    img.style.height = typeof size === 'number' ? `${size}px` : size;
  }

  return img;
}

/**
 * Batch replace Phosphor icons in multiple elements
 * @param {string} containerSelector - CSS selector for containers
 */
export async function replaceAllPhosphorIcons(containerSelector = 'body') {
  const containers = document.querySelectorAll(containerSelector);

  for (const container of containers) {
    await replacePhosphorIconsInElement(container);
  }
}

export default {
  ICON_MAP,
  getIconPath,
  createInlineSVG,
  createIconImg,
  createIcon,
  replacePhosphorIconsInElement,
  replaceAllPhosphorIcons
};
