/**
 * Icon Font Loader & Fallback System
 *
 * Detects if Phosphor icon fonts loaded successfully.
 * If not, activates CSS fallback system to show Unicode/emoji alternatives.
 *
 * This provides Layer 4 protection: JavaScript-based detection
 * (CSS fallbacks work automatically as Layer 3, even without this)
 *
 * @module IconFontLoader
 */

/**
 * Configuration
 */
const CONFIG = {
  // Font families to check
  fontFamilies: ['Phosphor', 'Phosphor-Bold', 'Phosphor-Fill'],

  // Timeout for font loading (ms)
  timeout: 3000,

  // Test character code (using a character that exists in Phosphor fonts)
  testChar: '\ue900',

  // Fallback class to add when fonts fail
  fallbackClass: 'icon-fonts-failed',

  // Enable console logging
  debug: true,
};

/**
 * Check if a specific font family is loaded
 *
 * @param {string} fontFamily - Font family name to check
 * @returns {boolean} True if font is loaded
 */
function isFontLoaded(fontFamily) {
  // Create test elements with the font
  const testElement = document.createElement('span');
  testElement.textContent = CONFIG.testChar;
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.fontFamily = fontFamily;
  testElement.style.fontSize = '100px';

  // Create fallback element with system font
  const fallbackElement = document.createElement('span');
  fallbackElement.textContent = CONFIG.testChar;
  fallbackElement.style.position = 'absolute';
  fallbackElement.style.visibility = 'hidden';
  fallbackElement.style.fontFamily = 'monospace'; // System fallback
  fallbackElement.style.fontSize = '100px';

  document.body.appendChild(testElement);
  document.body.appendChild(fallbackElement);

  // Get computed widths
  const testWidth = testElement.offsetWidth;
  const fallbackWidth = fallbackElement.offsetWidth;

  // Clean up
  document.body.removeChild(testElement);
  document.body.removeChild(fallbackElement);

  // If widths differ, custom font is loaded
  // (icon fonts have different character widths than system fonts)
  return testWidth !== fallbackWidth;
}

/**
 * Check if icon fonts are loaded by testing actual icon rendering
 *
 * @returns {boolean} True if fonts are loaded
 */
function checkIconFontsSimple() {
  // Create test element with Phosphor icon class
  const testElement = document.createElement('i');
  testElement.className = 'ph-bold ph-heart';
  testElement.style.position = 'absolute';
  testElement.style.opacity = '0';
  testElement.style.pointerEvents = 'none';
  testElement.style.left = '-9999px';

  document.body.appendChild(testElement);

  // Check computed font family
  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.fontFamily.toLowerCase();

  // Clean up
  document.body.removeChild(testElement);

  // Check if Phosphor font is actually applied
  const hasPhosphorFont =
    fontFamily.includes('phosphor') ||
    fontFamily.includes('"phosphor"') ||
    fontFamily.includes("'phosphor'");

  return hasPhosphorFont;
}

/**
 * Activate fallback mode
 * Adds class to <html> element to trigger CSS fallbacks
 *
 * @param {string} reason - Reason for fallback activation
 */
function activateFallback(reason = 'Unknown') {
  document.documentElement.classList.add(CONFIG.fallbackClass);

  if (CONFIG.debug) {
    console.warn(
      `[IconFontLoader] Activating fallback mode - Reason: ${reason}`
    );
    console.warn(
      '[IconFontLoader] Using Unicode/emoji fallbacks instead of icon fonts'
    );
  }

  // Dispatch custom event for analytics tracking
  window.dispatchEvent(
    new CustomEvent('iconFontsFailed', {
      detail: {reason},
    })
  );
}

/**
 * Deactivate fallback mode (fonts loaded successfully)
 */
function deactivateFallback() {
  document.documentElement.classList.remove(CONFIG.fallbackClass);

  if (CONFIG.debug) {
    console.log('[IconFontLoader] Icon fonts loaded successfully ✓');
  }

  // Dispatch custom event for analytics tracking
  window.dispatchEvent(new CustomEvent('iconFontsLoaded'));
}

/**
 * Main font check function
 * Runs multiple detection methods for reliability
 *
 * @returns {Promise<boolean>} True if fonts loaded successfully
 */
async function checkIconFonts() {
  try {
    // Method 1: Use FontFaceSet API (modern browsers)
    if ('fonts' in document) {
      try {
        // Wait for fonts to load (with timeout)
        const fontsReady = await Promise.race([
          document.fonts.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Font loading timeout')), CONFIG.timeout)
          ),
        ]);

        // Check if Phosphor fonts are in the set
        const phosphorFonts = [];
        document.fonts.forEach((font) => {
          if (font.family.toLowerCase().includes('phosphor')) {
            phosphorFonts.push(font);
          }
        });

        if (phosphorFonts.length > 0) {
          const allLoaded = phosphorFonts.every(
            (font) => font.status === 'loaded'
          );

          if (allLoaded) {
            deactivateFallback();
            return true;
          }
        }
      } catch (error) {
        if (CONFIG.debug) {
          console.warn('[IconFontLoader] FontFaceSet check failed:', error.message);
        }
        // Fall through to Method 2
      }
    }

    // Method 2: Simple DOM-based check
    const simpleCheck = checkIconFontsSimple();
    if (simpleCheck) {
      deactivateFallback();
      return true;
    }

    // Method 3: Check each font family individually
    let anyLoaded = false;
    for (const fontFamily of CONFIG.fontFamilies) {
      if (isFontLoaded(fontFamily)) {
        anyLoaded = true;
        break;
      }
    }

    if (anyLoaded) {
      deactivateFallback();
      return true;
    }

    // All checks failed - activate fallback
    activateFallback('Font loading checks failed');
    return false;
  } catch (error) {
    if (CONFIG.debug) {
      console.error('[IconFontLoader] Error checking fonts:', error);
    }
    activateFallback(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Initialize icon font loader
 * Sets up monitoring and fallback system
 *
 * @param {Object} options - Configuration options
 */
export function initIconFontLoader(options = {}) {
  // Merge options with defaults
  Object.assign(CONFIG, options);

  if (CONFIG.debug) {
    console.log('[IconFontLoader] Initializing...');
  }

  // Check immediately if fonts are already loaded
  if (document.readyState === 'complete') {
    setTimeout(checkIconFonts, 100);
  } else {
    // Wait for page load
    window.addEventListener('load', () => {
      // Delay check slightly to allow fonts to render
      setTimeout(checkIconFonts, 100);
    });
  }

  // Additional check after longer timeout (for slow connections)
  setTimeout(() => {
    if (!document.documentElement.classList.contains(CONFIG.fallbackClass)) {
      checkIconFonts();
    }
  }, CONFIG.timeout);

  // Re-check when page becomes visible (handles iOS tab suspension)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(checkIconFonts, 100);
    }
  });

  // Expose to window for manual testing
  if (CONFIG.debug) {
    window.IconFontLoader = {
      check: checkIconFonts,
      activateFallback,
      deactivateFallback,
      isFontLoaded,
      config: CONFIG,
    };
  }
}

/**
 * Manual check function (can be called from anywhere)
 *
 * @returns {Promise<boolean>} True if fonts loaded
 */
export async function checkFonts() {
  return await checkIconFonts();
}

/**
 * Get current fallback status
 *
 * @returns {boolean} True if fallback mode is active
 */
export function isFallbackActive() {
  return document.documentElement.classList.contains(CONFIG.fallbackClass);
}

// Auto-initialize on import (can be disabled by setting autoInit: false in options)
if (typeof window !== 'undefined' && document.readyState !== 'loading') {
  // DOM already loaded
  initIconFontLoader();
} else if (typeof window !== 'undefined') {
  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    initIconFontLoader();
  });
}

export default {
  init: initIconFontLoader,
  check: checkFonts,
  isFallbackActive,
  activateFallback,
  deactivateFallback,
};
