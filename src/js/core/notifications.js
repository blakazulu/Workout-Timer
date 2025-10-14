/**
 * Notifications Module
 * Handles user notifications with context-aware positioning
 */

/**
 * Show a notification to the user
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
export function showNotification(message, isError = false) {
  // Check if we're inside a popover with a header
  const musicSelectionPopover = document.querySelector(".music-selection-popover:popover-open");
  const musicLibraryPopover = document.querySelector(".music-library-popover:popover-open");
  const activePopover = musicSelectionPopover || musicLibraryPopover;

  if (activePopover) {
    // Show notification inside the popover, dropping down over the header
    showPopoverNotification(activePopover, message, isError);
  } else {
    // Show notification in fixed position (original behavior)
    showGlobalNotification(message, isError);
  }
}

/**
 * Show notification that drops down over popover header
 * @param {HTMLElement} popover - The popover element
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showPopoverNotification(popover, message, isError) {
  const notification = document.createElement("div");
  notification.className = "popover-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: ${isError ? "rgba(255, 0, 150, 0.95)" : "rgba(0, 255, 200, 0.95)"};
    color: #0a0a0a;
    padding: 20px 24px;
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid ${isError ? "rgba(255, 0, 150, 0.3)" : "rgba(0, 255, 200, 0.3)"};
    z-index: 100;
    transform: translateY(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  popover.style.position = "relative";
  popover.insertBefore(notification, popover.firstChild);

  // Slide down
  requestAnimationFrame(() => {
    notification.style.transform = "translateY(0)";
  });

  // Slide up and remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateY(-100%)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Show notification in global fixed position
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showGlobalNotification(message, isError) {
  const notification = document.createElement("div");
  notification.className = "music-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? "rgba(255, 0, 150, 0.95)" : "rgba(0, 255, 200, 0.95)"};
    color: #0a0a0a;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: var(--font-family-base);
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 40px ${isError ? "rgba(255, 0, 150, 0.6)" : "rgba(0, 255, 200, 0.6)"};
    z-index: 100000;
    animation: slideDown 0.3s ease;
    max-width: 90vw;
    text-align: center;
  `;

  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
