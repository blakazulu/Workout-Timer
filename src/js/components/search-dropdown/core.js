/**
 * Search Dropdown Core - Constructor and initialization
 */

import { setupEventListeners } from './events.js';

/**
 * SearchDropdown class - Main dropdown component
 */
export class SearchDropdown {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      onSelect: options.onSelect || (() => {}),
      showNotification: options.showNotification || (() => {}),
      minChars: options.minChars || 2,
      maxResults: options.maxResults || 8,
      ...options
    };

    this.dropdown = null;
    this.results = [];
    this.selectedIndex = -1;
    this.isVisible = false;

    this.init();
  }

  /**
   * Initialize the dropdown
   */
  init() {
    // Create dropdown element
    this.dropdown = document.createElement("div");
    this.dropdown.className = "youtube-search-dropdown hidden";
    this.dropdown.id = "youtubeSearchDropdown";

    // Append to body for fixed positioning (like music tooltip popover)
    document.body.appendChild(this.dropdown);

    // Set up event listeners
    setupEventListeners(this);
  }

  /**
   * Destroy the dropdown
   */
  destroy() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    this.dropdown = null;
    this.results = [];
    this.selectedIndex = -1;
    this.isVisible = false;
  }
}
