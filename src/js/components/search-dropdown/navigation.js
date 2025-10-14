/**
 * Search Dropdown Navigation - Navigation and selection methods
 */

import {hide, render} from "./rendering.js";

/**
 * Select next result
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function selectNext(instance) {
  if (instance.results.length === 0) return;

  instance.selectedIndex = (instance.selectedIndex + 1) % instance.results.length;
  render(instance);
}

/**
 * Select previous result
 * @param {SearchDropdown} instance - SearchDropdown instance
 */
export function selectPrevious(instance) {
  if (instance.results.length === 0) return;

  instance.selectedIndex = instance.selectedIndex <= 0
    ? instance.results.length - 1
    : instance.selectedIndex - 1;
  render(instance);
}

/**
 * Select a result by index
 * @param {SearchDropdown} instance - SearchDropdown instance
 * @param {number} index - Result index
 */
export function selectResult(instance, index) {
  if (index < 0 || index >= instance.results.length) return;

  const result = instance.results[index];
  hide(instance);

  // Call the onSelect callback
  if (typeof instance.options.onSelect === "function") {
    instance.options.onSelect(result);
  }
}

/**
 * Check if dropdown is visible
 * @param {SearchDropdown} instance - SearchDropdown instance
 * @returns {boolean}
 */
export function isOpen(instance) {
  return instance.isVisible;
}

/**
 * Get selected result
 * @param {SearchDropdown} instance - SearchDropdown instance
 * @returns {Object|null}
 */
export function getSelected(instance) {
  if (instance.selectedIndex >= 0 && instance.selectedIndex < instance.results.length) {
    return instance.results[instance.selectedIndex];
  }
  return null;
}
