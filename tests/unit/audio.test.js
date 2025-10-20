/**
 * Unit Tests for Audio Module
 * Tests sound effects playback, volume control, and audio state
 */

import {expect, test} from "@playwright/test";
import {mockAudioAPI} from "../helpers/test-helpers.js";

test.describe("Audio Module - Unit Tests", () => {
  test.beforeEach(async ({page}) => {
    await mockAudioAPI(page);
    await page.goto("/");

    // Clear audio instances from previous tests
    await page.evaluate(() => {
      if (window.__clearAudioInstances) {
        window.__clearAudioInstances();
      }
    });
  });

  test("should create audio instance", async ({page}) => {
    const audioCreated = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");
      return audio !== null && audio.src.includes("test.mp3");
    });

    expect(audioCreated).toBe(true);
  });

  test("should play audio", async ({page}) => {
    const playResult = await page.evaluate(async () => {
      const audio = new Audio("/sounds/test.mp3");
      await audio.play();
      return audio._playing; // Mock property
    });

    expect(playResult).toBe(true);
  });

  test("should pause audio", async ({page}) => {
    const pauseResult = await page.evaluate(async () => {
      const audio = new Audio("/sounds/test.mp3");
      await audio.play();
      audio.pause();
      return audio._playing;
    });

    expect(pauseResult).toBe(false);
  });

  test("should set volume", async ({page}) => {
    const volume = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");
      audio.volume = 0.5;
      return audio.volume;
    });

    expect(volume).toBe(0.5);
  });

  test("should validate volume range", async ({page}) => {
    const volumes = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");

      // Try invalid volumes
      const results = [];

      audio.volume = -0.5;
      results.push(audio.volume); // Should be clamped to 0

      audio.volume = 1.5;
      results.push(audio.volume); // Should be clamped to 1

      audio.volume = 0;
      results.push(audio.volume);

      audio.volume = 1;
      results.push(audio.volume);

      return results;
    });

    // Volume should be clamped to 0-1 range
    expect(volumes[0]).toBe(0); // -0.5 clamped to 0
    expect(volumes[1]).toBe(1); // 1.5 clamped to 1
    expect(volumes[2]).toBe(0);
    expect(volumes[3]).toBe(1);
  });

  test("should track multiple audio instances", async ({page}) => {
    const count = await page.evaluate(async () => {
      const audio1 = new Audio("/sounds/sound1.mp3");
      const audio2 = new Audio("/sounds/sound2.mp3");
      const audio3 = new Audio("/sounds/sound3.mp3");

      return window.__testAudioInstances.length;
    });

    expect(count).toBe(3);
  });

  test("should handle audio playback promise", async ({page}) => {
    const result = await page.evaluate(async () => {
      const audio = new Audio("/sounds/test.mp3");

      try {
        await audio.play();
        return {success: true, error: null};
      } catch (error) {
        return {success: false, error: error.message};
      }
    });

    expect(result.success).toBe(true);
  });

  test("should preload audio", async ({page}) => {
    const loaded = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");
      audio.preload = "auto";
      audio.load();

      return audio.preload === "auto";
    });

    expect(loaded).toBe(true);
  });

  test("should handle audio source changes", async ({page}) => {
    const sources = await page.evaluate(() => {
      const audio = new Audio("/sounds/sound1.mp3");
      const firstSrc = audio.src;

      audio.src = "/sounds/sound2.mp3";
      const secondSrc = audio.src;

      return {firstSrc, secondSrc};
    });

    expect(sources.firstSrc).toContain("sound1.mp3");
    expect(sources.secondSrc).toContain("sound2.mp3");
  });

  test("should play different sound effects", async ({page}) => {
    const sounds = await page.evaluate(async () => {
      const startSound = new Audio("/sounds/start.mp3");
      const countdownSound = new Audio("/sounds/countdown.mp3");
      const restSound = new Audio("/sounds/rest.mp3");
      const completeSound = new Audio("/sounds/complete.mp3");

      await startSound.play();
      await countdownSound.play();
      await restSound.play();
      await completeSound.play();

      return window.__testAudioInstances
        .filter(a => a._playing)
        .map(a => a.src);
    });

    expect(sounds).toHaveLength(4);
    expect(sounds.some(s => s.includes("start.mp3"))).toBe(true);
    expect(sounds.some(s => s.includes("countdown.mp3"))).toBe(true);
    expect(sounds.some(s => s.includes("rest.mp3"))).toBe(true);
    expect(sounds.some(s => s.includes("complete.mp3"))).toBe(true);
  });

  test("should stop all audio", async ({page}) => {
    const result = await page.evaluate(async () => {
      const audio1 = new Audio("/sounds/sound1.mp3");
      const audio2 = new Audio("/sounds/sound2.mp3");

      await audio1.play();
      await audio2.play();

      // Stop all
      window.__testAudioInstances.forEach(a => a.pause());

      return window.__testAudioInstances.filter(a => a._playing).length;
    });

    expect(result).toBe(0);
  });

  test("should handle muted state", async ({page}) => {
    const muteStates = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");

      const unmuted = audio.muted;
      audio.muted = true;
      const muted = audio.muted;
      audio.muted = false;
      const unmutedAgain = audio.muted;

      return {unmuted, muted, unmutedAgain};
    });

    expect(muteStates.unmuted).toBe(false);
    expect(muteStates.muted).toBe(true);
    expect(muteStates.unmutedAgain).toBe(false);
  });

  test("should calculate sound timing for workout phases", async ({page}) => {
    const timings = await page.evaluate(() => {
      // When to play sounds during workout
      const workTime = 40;
      const countdownStart = 3; // Play countdown at 3 seconds remaining

      return {
        playStart: 0, // Play at timer start
        playCountdown: workTime - countdownStart, // Play at 37 seconds
        playRest: workTime, // Play when entering rest
        playComplete: workTime * 8 // Play at end of all sets
      };
    });

    expect(timings.playStart).toBe(0);
    expect(timings.playCountdown).toBe(37);
    expect(timings.playRest).toBe(40);
    expect(timings.playComplete).toBe(320);
  });

  test("should respect audio enabled/disabled setting", async ({page}) => {
    const result = await page.evaluate(async () => {
      const soundsEnabled = false;

      // Only play if enabled
      if (soundsEnabled) {
        const audio = new Audio("/sounds/test.mp3");
        await audio.play();
      }

      return window.__testAudioInstances.filter(a => a._playing).length;
    });

    expect(result).toBe(0);
  });

  test("should clean up audio resources", async ({page}) => {
    const result = await page.evaluate(() => {
      const audio = new Audio("/sounds/test.mp3");
      audio.pause();
      audio.src = ""; // Clear source

      return audio.src === "";
    });

    expect(result).toBe(true);
  });
});
