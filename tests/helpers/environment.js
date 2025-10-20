/**
 * Test Environment Detection and Configuration
 * Helps tests adapt to development vs production environments
 */

/**
 * Detect if running in development environment
 * @returns {boolean}
 */
export function isDevEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Check if PWA features are fully enabled
 * PWA features only work reliably in production builds
 * @returns {boolean}
 */
export function isPWAEnabled() {
  return !isDevEnvironment();
}

/**
 * Get correct manifest path for current environment
 * @returns {string}
 */
export function getManifestPath() {
  return isDevEnvironment()
    ? '/.vite/manifest.json'
    : '/manifest.webmanifest';
}

/**
 * Check if we're running against localhost dev server
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
export async function isRunningOnLocalhost(page) {
  const url = page.url();
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Get recommended timeout for service worker operations
 * Dev environment needs longer timeouts
 * @returns {number} Timeout in milliseconds
 */
export function getServiceWorkerTimeout() {
  return isDevEnvironment() ? 10000 : 5000;
}
