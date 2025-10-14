/**
 * Search Dropdown Component - Main entry point
 * Displays YouTube search suggestions in a dropdown
 */

import {$} from "../../utils/dom.js";
import {SearchDropdown} from "./core.js";
import {hide, show, showLoading} from "./rendering.js";
import {getSelected, isOpen} from "./navigation.js";

// Attach methods to the prototype
SearchDropdown.prototype.show = function (results) {
  return show(this, results);
};
SearchDropdown.prototype.hide = function () {
  return hide(this);
};
SearchDropdown.prototype.showLoading = function () {
  return showLoading(this);
};
SearchDropdown.prototype.isOpen = function () {
  return isOpen(this);
};
SearchDropdown.prototype.getSelected = function () {
  return getSelected(this);
};

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

export {SearchDropdown};
