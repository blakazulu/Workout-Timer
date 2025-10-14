/**
 * Search Dropdown Events - Event listeners and positioning
 */

import {setupFavoriteButtons} from "../../utils/favorite-button.js";
import {selectNext, selectPrevious, selectResult} from "./navigation.js";
import {hide} from "./rendering.js";

/**
 * Position the dropdown relative to the input
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function positionDropdown(instance) {
  const rect = instance.input.getBoundingClientRect();
  const dropdownHeight = instance.dropdown.offsetHeight;
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  // Determine if dropdown should appear above or below input
  const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

  if (showAbove) {
    // Position above input
    instance.dropdown.style.bottom = `${viewportHeight - rect.top + 8}px`;
    instance.dropdown.style.top = "auto";
  } else {
    // Position below input
    instance.dropdown.style.top = `${rect.bottom + 8}px`;
    instance.dropdown.style.bottom = "auto";
  }

  // Get app-content width for dropdown width
  const appContent = document.querySelector(".app-content");
  const containerRect = appContent ? appContent.getBoundingClientRect() : null;

  if (containerRect) {
    // Use app-content dimensions
    instance.dropdown.style.left = `${containerRect.left}px`;
    instance.dropdown.style.width = `${containerRect.width}px`;
  } else {
    // Fallback to input dimensions
    instance.dropdown.style.left = `${rect.left}px`;
    instance.dropdown.style.width = `${rect.width}px`;
  }
}

/**
 * Set up event listeners
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function setupEventListeners(instance) {
  // Set up favorite buttons event delegation
  setupFavoriteButtons(instance.dropdown, instance.options.showNotification);

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!instance.input.contains(e.target) && !instance.dropdown.contains(e.target)) {
      hide(instance);
    }
  });

  // Keyboard navigation
  instance.input.addEventListener("keydown", (e) => {
    if (!instance.isVisible) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectNext(instance);
        break;
      case "ArrowUp":
        e.preventDefault();
        selectPrevious(instance);
        break;
      case "Enter":
        e.preventDefault();
        if (instance.selectedIndex >= 0) {
          selectResult(instance, instance.selectedIndex);
        }
        break;
      case "Escape":
        e.preventDefault();
        hide(instance);
        break;
    }
  });

  // Dropdown item clicks
  instance.dropdown.addEventListener("click", (e) => {
    // Don't trigger selection if clicking favorite button
    if (e.target.closest("[data-action='toggle-favorite']")) {
      return;
    }

    const item = e.target.closest(".search-dropdown-item");
    if (item) {
      const index = parseInt(item.dataset.index, 10);
      selectResult(instance, index);
    }
  });

  // Reposition on window resize and scroll
  window.addEventListener("resize", () => {
    if (instance.isVisible) {
      positionDropdown(instance);
    }
  });

  window.addEventListener("scroll", () => {
    if (instance.isVisible) {
      positionDropdown(instance);
    }
  }, true); // Use capture phase to catch scrolling in child elements
}
