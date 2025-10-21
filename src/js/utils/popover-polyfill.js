/**
 * Popover API Polyfill for iOS/Safari
 * Provides fallback support for browsers without native Popover API
 *
 * @fileoverview
 * The HTML5 Popover API has limited support on iOS Safari (<17.0).
 * This polyfill provides progressive enhancement by:
 * 1. Detecting native popover support
 * 2. Falling back to manual implementation using classes + positioning
 * 3. Maintaining same API (showPopover, hidePopover, toggle events)
 */

/**
 * Check if Popover API is natively supported
 * @returns {boolean}
 */
export function isPopoverSupported() {
  return typeof HTMLElement !== 'undefined' &&
         HTMLElement.prototype.hasOwnProperty('popover');
}

/**
 * Initialize popover polyfill for browsers without native support
 * @param {HTMLElement} popoverElement - Element with [popover] attribute
 * @returns {object} Polyfill instance with showPopover, hidePopover methods
 */
export function initPopoverPolyfill(popoverElement) {
  if (!popoverElement) {
    console.warn('[Popover Polyfill] Element not found');
    return null;
  }

  // Use native API if supported
  if (isPopoverSupported()) {
    return {
      show: () => popoverElement.showPopover(),
      hide: () => popoverElement.hidePopover(),
      toggle: () => popoverElement.togglePopover(),
      isOpen: () => popoverElement.matches(':popover-open'),
      element: popoverElement,
      native: true
    };
  }

  // Polyfill implementation for iOS/older browsers
  console.log(`[Popover Polyfill] Initializing fallback for #${popoverElement.id}`);

  // Track state
  let isOpen = false;

  /**
   * Show popover using manual implementation
   */
  function showPopover() {
    if (isOpen) return;

    // Add CSS class for visibility
    popoverElement.classList.add('popover-open');
    popoverElement.style.display = 'block';

    // Position popover (adjust if needed)
    positionPopover(popoverElement);

    // Update state
    isOpen = true;

    // Dispatch custom toggle event to match native API
    const toggleEvent = new Event('toggle', { bubbles: true });
    toggleEvent.newState = 'open';
    popoverElement.dispatchEvent(toggleEvent);

    // Add backdrop/overlay to detect outside clicks
    addBackdrop(popoverElement);
  }

  /**
   * Hide popover using manual implementation
   */
  function hidePopover() {
    if (!isOpen) return;

    // Remove CSS class
    popoverElement.classList.remove('popover-open');
    popoverElement.style.display = 'none';

    // Update state
    isOpen = false;

    // Dispatch custom toggle event
    const toggleEvent = new Event('toggle', { bubbles: true });
    toggleEvent.newState = 'closed';
    popoverElement.dispatchEvent(toggleEvent);

    // Remove backdrop
    removeBackdrop(popoverElement);
  }

  /**
   * Toggle popover state
   */
  function togglePopover() {
    if (isOpen) {
      hidePopover();
    } else {
      showPopover();
    }
  }

  /**
   * Position popover on screen
   * @param {HTMLElement} element
   */
  function positionPopover(element) {
    // Basic centering for mobile
    // Can be enhanced with anchor positioning if needed
    element.style.position = 'fixed';

    // Check if it's a full-screen popover or positioned popover
    const isFullscreen = element.classList.contains('music-library-popover') ||
                         element.classList.contains('mood-popover') ||
                         element.classList.contains('genre-popover');

    if (isFullscreen) {
      // Full screen overlay positioning
      element.style.inset = '0';
      element.style.margin = 'auto';
    } else {
      // Centered positioning for tooltips/smaller popovers
      element.style.top = '50%';
      element.style.left = '50%';
      element.style.transform = 'translate(-50%, -50%)';
      element.style.maxHeight = '80vh';
      element.style.maxWidth = '90vw';
      element.style.overflow = 'auto';
    }

    // Ensure z-index is high
    element.style.zIndex = '999';
  }

  /**
   * Add backdrop/overlay for click-outside detection
   * @param {HTMLElement} popover
   */
  function addBackdrop(popover) {
    const backdropId = `${popover.id}-backdrop`;

    // Remove existing backdrop if any
    removeBackdrop(popover);

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = backdropId;
    backdrop.className = 'popover-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      cursor: pointer;
    `;

    // Click backdrop to close
    backdrop.addEventListener('click', () => {
      hidePopover();
    });

    // Insert backdrop before popover
    document.body.insertBefore(backdrop, popover);
  }

  /**
   * Remove backdrop
   * @param {HTMLElement} popover
   */
  function removeBackdrop(popover) {
    const backdropId = `${popover.id}-backdrop`;
    const backdrop = document.getElementById(backdropId);
    if (backdrop) {
      backdrop.remove();
    }
  }

  // Add methods to element for API compatibility
  popoverElement.showPopover = showPopover;
  popoverElement.hidePopover = hidePopover;
  popoverElement.togglePopover = togglePopover;

  return {
    show: showPopover,
    hide: hidePopover,
    toggle: togglePopover,
    isOpen: () => isOpen,
    element: popoverElement,
    native: false
  };
}

/**
 * Initialize all popovers on page with polyfill support
 * Scans for [popover] attribute and initializes polyfill if needed
 */
export function initAllPopovers() {
  const popovers = document.querySelectorAll('[popover]');
  const instances = [];

  popovers.forEach(popover => {
    const instance = initPopoverPolyfill(popover);
    if (instance) {
      instances.push(instance);
    }
  });

  // Handle popovertarget buttons
  setupPopoverTriggers();

  console.log(`[Popover Polyfill] Initialized ${instances.length} popovers (native: ${isPopoverSupported()})`);
  return instances;
}

/**
 * Setup event listeners for buttons with [popovertarget] attribute
 */
function setupPopoverTriggers() {
  if (isPopoverSupported()) return; // Native API handles this

  const triggers = document.querySelectorAll('[popovertarget]');

  triggers.forEach(trigger => {
    const targetId = trigger.getAttribute('popovertarget');
    const action = trigger.getAttribute('popovertargetaction') || 'toggle';
    const targetPopover = document.getElementById(targetId);

    if (!targetPopover) {
      console.warn(`[Popover Polyfill] Target popover #${targetId} not found`);
      return;
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();

      switch (action) {
        case 'show':
          targetPopover.showPopover?.();
          break;
        case 'hide':
          targetPopover.hidePopover?.();
          break;
        case 'toggle':
        default:
          targetPopover.togglePopover?.();
          break;
      }
    });
  });
}

/**
 * Add CSS for popover polyfill if not supported natively
 */
export function injectPopoverPolyfillStyles() {
  if (isPopoverSupported()) return;

  const styleId = 'popover-polyfill-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Popover Polyfill Styles - iOS Safari Fallback */
    [popover]:not(.popover-open) {
      display: none !important;
    }

    [popover].popover-open {
      display: block !important;
    }

    /* Backdrop for click-outside detection */
    .popover-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    /* Ensure popovers are above backdrop */
    [popover].popover-open {
      z-index: 999;
    }

    /* Smooth transitions for better UX */
    [popover] {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    [popover]:not(.popover-open) {
      opacity: 0;
      pointer-events: none;
    }

    [popover].popover-open {
      opacity: 1;
      pointer-events: auto;
    }
  `;

  document.head.appendChild(style);
  console.log('[Popover Polyfill] Styles injected');
}
