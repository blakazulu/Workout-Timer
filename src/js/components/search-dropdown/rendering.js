/**
 * Search Dropdown Rendering - Display and rendering methods
 */

import {createFavoriteButtonHTML} from "../../utils/favorite-button.js";
import {positionDropdown} from "./events.js";
import {escapeHtml, formatDuration} from "./utils.js";

/**
 * Show the dropdown with results
 * @param {SearchDropdown} instance - SearchDropdown instance
 * @param {Array} results - Array of result objects
 */
export function show(instance, results) {
  instance.results = results.slice(0, instance.options.maxResults);

  if (instance.results.length === 0) {
    hide(instance);
    return;
  }

  instance.selectedIndex = -1;
  render(instance);
  instance.dropdown.classList.remove("hidden");
  instance.isVisible = true;

  // Position dropdown after rendering
  requestAnimationFrame(() => positionDropdown(instance));
}

/**
 * Hide the dropdown
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function hide(instance) {
  instance.dropdown.classList.add("hidden");
  instance.isVisible = false;
  instance.results = [];
  instance.selectedIndex = -1;
}

/**
 * Render dropdown content
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function render(instance) {
  if (instance.results.length === 0) {
    instance.dropdown.innerHTML = `
      <div class="search-dropdown-empty">
        <img src="/svg-icons/search/search.svg" class="svg-icon" alt="Search" />
        <span>No results found</span>
      </div>
    `;
    return;
  }

  const items = instance.results.map((result, index) => {
    const isSelected = index === instance.selectedIndex;
    const hasThumbnail = result.thumbnail && result.type === "video";
    const duration = result.duration ? formatDuration(result.duration) : null;
    const isVideo = result.type === "video" && result.id;

    return `
      <div class="search-dropdown-item ${isSelected ? "selected" : ""}"
           data-index="${index}"
           data-video-id="${isVideo ? escapeHtml(result.id) : ""}"
           data-url="${isVideo ? escapeHtml(result.url) : ""}"
           data-title="${escapeHtml(result.title)}"
           data-channel="${escapeHtml(result.description || "")}"
           data-thumbnail="${isVideo ? escapeHtml(result.thumbnail || "") : ""}"
           data-duration="${isVideo ? (result.duration || 0) : ""}">
        ${hasThumbnail ? `
          <img src="${escapeHtml(result.thumbnail)}"
               alt="${escapeHtml(result.title)}"
               class="search-dropdown-item-thumbnail"
               loading="lazy">
        ` : `
          <div class="search-dropdown-item-icon">
            <img src="/svg-icons/search/search.svg" class="svg-icon" alt="Search" />
          </div>
        `}
        <div class="search-dropdown-item-content">
          <div class="search-dropdown-item-title">${escapeHtml(result.title)}</div>
          ${result.description ? `<div class="search-dropdown-item-description">${escapeHtml(result.description)}</div>` : ""}
        </div>
        ${duration ? `<div class="search-dropdown-item-duration">${duration}</div>` : ""}
        ${isVideo ? createFavoriteButtonHTML(result.id, {
      size: "small",
      className: "search-dropdown-item-favorite"
    }) : ""}
      </div>
    `;
  }).join("");

  instance.dropdown.innerHTML = `
    <div class="search-dropdown-header">
      <img src="/svg-icons/brand-logo/youtube.svg" class="svg-icon" alt="YouTube" />
      <span>YouTube Search Suggestions</span>
    </div>
    ${items}
  `;
}

/**
 * Show loading state
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function showLoading(instance) {
  instance.dropdown.innerHTML = `
    <div class="search-dropdown-loading">
      <div class="search-dropdown-spinner"></div>
      <span>Searching...</span>
    </div>
  `;
  instance.dropdown.classList.remove("hidden");
  instance.isVisible = true;

  // Position dropdown after rendering
  requestAnimationFrame(() => positionDropdown(instance));
}
