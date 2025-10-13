/**
 * Search Dropdown Component
 * Displays YouTube search suggestions in a dropdown
 */

import {$} from "../utils/dom.js";

export class SearchDropdown {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = {
      onSelect: options.onSelect || (() => {}),
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

    // Insert dropdown after the input
    this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hide();
      }
    });

    // Keyboard navigation
    this.input.addEventListener("keydown", (e) => {
      if (!this.isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.selectNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.selectPrevious();
          break;
        case "Enter":
          e.preventDefault();
          if (this.selectedIndex >= 0) {
            this.selectResult(this.selectedIndex);
          }
          break;
        case "Escape":
          e.preventDefault();
          this.hide();
          break;
      }
    });

    // Dropdown item clicks
    this.dropdown.addEventListener("click", (e) => {
      const item = e.target.closest(".search-dropdown-item");
      if (item) {
        const index = parseInt(item.dataset.index, 10);
        this.selectResult(index);
      }
    });
  }

  /**
   * Show the dropdown with results
   * @param {Array} results - Array of result objects
   */
  show(results) {
    this.results = results.slice(0, this.options.maxResults);

    if (this.results.length === 0) {
      this.hide();
      return;
    }

    this.selectedIndex = -1;
    this.render();
    this.dropdown.classList.remove("hidden");
    this.isVisible = true;
  }

  /**
   * Hide the dropdown
   */
  hide() {
    this.dropdown.classList.add("hidden");
    this.isVisible = false;
    this.results = [];
    this.selectedIndex = -1;
  }

  /**
   * Render dropdown content
   */
  render() {
    if (this.results.length === 0) {
      this.dropdown.innerHTML = `
        <div class="search-dropdown-empty">
          <i class="ph-bold ph-magnifying-glass"></i>
          <span>No results found</span>
        </div>
      `;
      return;
    }

    const items = this.results.map((result, index) => {
      const isSelected = index === this.selectedIndex;
      const hasThumbnail = result.thumbnail && result.type === "video";

      return `
        <div class="search-dropdown-item ${isSelected ? "selected" : ""}" data-index="${index}">
          ${hasThumbnail ? `
            <img src="${this.escapeHtml(result.thumbnail)}"
                 alt="${this.escapeHtml(result.title)}"
                 class="search-dropdown-item-thumbnail"
                 loading="lazy">
          ` : `
            <div class="search-dropdown-item-icon">
              <i class="ph-bold ph-magnifying-glass"></i>
            </div>
          `}
          <div class="search-dropdown-item-content">
            <div class="search-dropdown-item-title">${this.escapeHtml(result.title)}</div>
            ${result.description ? `<div class="search-dropdown-item-description">${this.escapeHtml(result.description)}</div>` : ""}
          </div>
          <div class="search-dropdown-item-action">
            <i class="ph-bold ph-arrow-bend-down-left"></i>
          </div>
        </div>
      `;
    }).join("");

    this.dropdown.innerHTML = `
      <div class="search-dropdown-header">
        <i class="ph-bold ph-youtube-logo"></i>
        <span>YouTube Search Suggestions</span>
      </div>
      ${items}
    `;
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.dropdown.innerHTML = `
      <div class="search-dropdown-loading">
        <div class="search-dropdown-spinner"></div>
        <span>Searching...</span>
      </div>
    `;
    this.dropdown.classList.remove("hidden");
    this.isVisible = true;
  }

  /**
   * Select next result
   */
  selectNext() {
    if (this.results.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
    this.render();
  }

  /**
   * Select previous result
   */
  selectPrevious() {
    if (this.results.length === 0) return;

    this.selectedIndex = this.selectedIndex <= 0
      ? this.results.length - 1
      : this.selectedIndex - 1;
    this.render();
  }

  /**
   * Select a result by index
   * @param {number} index - Result index
   */
  selectResult(index) {
    if (index < 0 || index >= this.results.length) return;

    const result = this.results[index];
    this.hide();

    // Call the onSelect callback
    if (typeof this.options.onSelect === "function") {
      this.options.onSelect(result);
    }
  }

  /**
   * Check if dropdown is visible
   * @returns {boolean}
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Get selected result
   * @returns {Object|null}
   */
  getSelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      return this.results[this.selectedIndex];
    }
    return null;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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

/**
 * Create a search dropdown for an input element
 * @param {HTMLElement|string} input - Input element or selector
 * @param {Object} options - Configuration options
 * @returns {SearchDropdown}
 */
export function createSearchDropdown(input, options = {}) {
  const inputElement = typeof input === "string" ? $(input) : input;

  if (!inputElement) {
    throw new Error("Input element not found");
  }

  return new SearchDropdown(inputElement, options);
}
