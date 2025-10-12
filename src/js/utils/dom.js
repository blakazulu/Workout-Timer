/**
 * DOM Utility Functions
 */

/**
 * Select a single element
 * @param {string} selector - CSS selector
 * @returns {Element|null}
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Select multiple elements
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Add a class to an element
 * @param {Element} element
 * @param {string} className
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element
 * @param {Element} element
 * @param {string} className
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Toggle a class on an element
 * @param {Element} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Check if element has a class
 * @param {Element} element
 * @param {string} className
 * @returns {boolean}
 */
export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}
