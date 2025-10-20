/**
 * Test Helpers for CYCLE Workout Timer
 * Common utilities and setup functions for E2E and unit tests
 */

import {expect} from "@playwright/test";

/**
 * Wait for a specific time (in milliseconds)
 * @param {number} ms - Milliseconds to wait
 */
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clear all localStorage data
 * @param {Page} page - Playwright page object
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set a value in localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 */
export async function setLocalStorage(page, key, value) {
  await page.evaluate(
    ({key, value}) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    {key, value}
  );
}

/**
 * Get a value from localStorage
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @returns {Promise<any>} Parsed value from localStorage
 */
export async function getLocalStorage(page, key) {
  return await page.evaluate(
    key => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    key
  );
}

/**
 * Wait for the app to be fully loaded
 * @param {Page} page - Playwright page object
 */
export async function waitForAppReady(page) {
  // Wait for the main app container to be visible
  await page.waitForSelector(".container", {state: "visible"});

  // Wait for settings panel to be visible (always shown on load)
  await page.waitForSelector("#settings", {state: "visible"});

  // Wait for app loader to disappear
  await page.waitForSelector("#app-loader", {state: "hidden"}).catch(() => {
    // Loader might already be hidden, that's fine
  });

  // Give a bit more time for initialization
  await wait(500);
}

/**
 * Mock YouTube IFrame API
 * @param {Page} page - Playwright page object
 */
export async function mockYouTubeAPI(page) {
  await page.addInitScript(() => {
    // Mock YouTube IFrame API
    window.YT = {
      Player: class {
        constructor(elementId, config) {
          this.elementId = elementId;
          this.config = config;
          this.state = -1; // UNSTARTED
          setTimeout(() => config.events?.onReady?.({target: this}), 100);
        }

        playVideo() {
          this.state = 1; // PLAYING
        }

        pauseVideo() {
          this.state = 2; // PAUSED
        }

        stopVideo() {
          this.state = 0; // ENDED
        }

        setVolume(volume) {
          this.volume = volume;
        }

        getVolume() {
          return this.volume || 50;
        }

        getPlayerState() {
          return this.state;
        }

        loadVideoById(videoId) {
          this.currentVideoId = videoId;
        }

        getCurrentTime() {
          return 0;
        }

        getDuration() {
          return 180;
        }
      },
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
      }
    };

    window.onYouTubeIframeAPIReady = () => {
    };
  });
}

/**
 * Mock Audio API for sound effects
 * @param {Page} page - Playwright page object
 */
export async function mockAudioAPI(page) {
  await page.addInitScript(() => {
    // Track audio instances for testing
    window.__testAudioInstances = [];

    const OriginalAudio = window.Audio;
    window.Audio = class extends OriginalAudio {
      constructor(src) {
        super();
        this.src = src;
        this._playing = false;
        window.__testAudioInstances.push(this);
      }

      play() {
        this._playing = true;
        this.dispatchEvent(new Event("play"));
        // Simulate successful playback
        return Promise.resolve();
      }

      pause() {
        this._playing = false;
        this.dispatchEvent(new Event("pause"));
      }

      load() {
        this.dispatchEvent(new Event("canplaythrough"));
      }
    };
  });
}

/**
 * Get list of audio files that were played
 * @param {Page} page - Playwright page object
 * @returns {Promise<Array>} Array of played audio sources
 */
export async function getPlayedAudio(page) {
  return await page.evaluate(() => {
    return window.__testAudioInstances
      .filter(audio => audio._playing)
      .map(audio => audio.src);
  });
}

/**
 * Wait for an element to be visible and click it
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 */
export async function waitAndClick(page, selector) {
  await page.waitForSelector(selector, {state: "visible"});
  await page.click(selector);
}

/**
 * Check if an element has a specific class
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {string} className - Class name to check
 * @returns {Promise<boolean>}
 */
export async function hasClass(page, selector, className) {
  return await page.locator(selector).evaluate(
    (el, cls) => el.classList.contains(cls),
    className
  );
}

/**
 * Get the text content of an element
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @returns {Promise<string>}
 */
export async function getText(page, selector) {
  return await page.locator(selector).textContent();
}

/**
 * Wait for PostHog to be initialized (if needed for tests)
 * @param {Page} page - Playwright page object
 */
export async function waitForPostHog(page) {
  await page.waitForFunction(() => {
    return window.posthog && window.posthog.__loaded;
  }, {timeout: 5000}).catch(() => {
    // PostHog might not load in tests, that's okay
  });
}

/**
 * Disable PostHog in tests
 * @param {Page} page - Playwright page object
 */
export async function disablePostHog(page) {
  await page.addInitScript(() => {
    window.posthog = {
      __loaded: true,
      init: () => {
      },
      capture: () => {
      },
      identify: () => {
      },
      reset: () => {
      },
      opt_out_capturing: () => {
      },
      has_opted_out_capturing: () => true,
    };
  });
}

/**
 * Assert that audio was played
 * @param {Page} page - Playwright page object
 * @param {string} expectedSoundFile - Expected sound file name
 */
export async function expectAudioPlayed(page, expectedSoundFile) {
  const playedAudio = await getPlayedAudio(page);
  const wasPlayed = playedAudio.some(src => src.includes(expectedSoundFile));
  expect(wasPlayed).toBeTruthy();
}
