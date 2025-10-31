/**
 * E2E Tests for Segment-Based Timer Execution
 * Tests timer behavior with workout plan segments
 */

import {expect, test} from "@playwright/test";
import {
  clearStorage,
  waitForAppReady,
  wait,
  disablePostHog,
  mockAudioAPI
} from "../helpers/test-helpers.js";

test.describe("Segment Timer - Basic Execution", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    // Create and select a simple 2-segment plan
    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");

      const result = savePlan({
        name: "Test Segment Plan",
        mode: "custom",
        segments: [
          {
            type: "hiit-work",
            duration: 5,
            intensity: "hard",
            name: "Work",
            soundCue: "alert"
          },
          {
            type: "complete-rest",
            duration: 3,
            intensity: "light",
            name: "Rest",
            soundCue: "complete"
          }
        ]
      });

      setActivePlan(result.planId);

      // Load segments into timer
      const {getTimer} = await import("/src/js/modules/timer.js");
      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);
  });

  test("should display segment name instead of rep counter", async ({page}) => {
    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("Work");
    expect(text).toContain("(1/2)");
  });

  test("should show correct initial time for first segment", async ({page}) => {
    const timerDisplay = page.locator("#timerDisplay");
    const text = await timerDisplay.textContent();

    expect(text).toBe("0:05");
  });

  test("should countdown segment time when started", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(2000);

    const timerDisplay = page.locator("#timerDisplay");
    const text = await timerDisplay.textContent();

    expect(text).toBe("0:03");
  });

  test("should transition to next segment after completion", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(6000); // Wait for first segment to complete

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("Rest");
    expect(text).toContain("(2/2)");
  });

  test("should update timer display for new segment duration", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(6000); // Wait for first segment to complete

    const timerDisplay = page.locator("#timerDisplay");
    const text = await timerDisplay.textContent();

    // Should show rest duration (3 seconds)
    expect(text).toBe("0:03");
  });

  test("should complete workout after all segments finish", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(9000); // Wait for all segments (5s + 3s + buffer)

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("Complete");
  });

  test("should show start button again after completion", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(9000);

    const buttonText = await startBtn.textContent();

    expect(buttonText).toBe("START");
  });
});

test.describe("Segment Timer - Display Updates", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    // Create plan with distinct segment names
    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      const result = savePlan({
        name: "Display Test Plan",
        mode: "custom",
        segments: [
          {
            type: "warmup",
            duration: 3,
            intensity: "light",
            name: "Warmup Phase",
            soundCue: "none"
          },
          {
            type: "hiit-work",
            duration: 3,
            intensity: "very-hard",
            name: "Sprint Phase",
            soundCue: "alert"
          },
          {
            type: "cooldown",
            duration: 3,
            intensity: "light",
            name: "Cooldown Phase",
            soundCue: "complete"
          }
        ]
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);
  });

  test("should show segment 1 of 3 initially", async ({page}) => {
    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("(1/3)");
  });

  test("should update segment counter during execution", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const repCounter = page.locator("#repCounter");

    await startBtn.click();
    await wait(4000); // Move to segment 2

    const text = await repCounter.textContent();

    expect(text).toContain("(2/3)");
  });

  test("should show all three segment names in sequence", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const repCounter = page.locator("#repCounter");

    // Segment 1
    let text = await repCounter.textContent();
    expect(text).toContain("Warmup Phase");

    await startBtn.click();

    // Segment 2
    await wait(4000);
    text = await repCounter.textContent();
    expect(text).toContain("Sprint Phase");

    // Segment 3
    await wait(4000);
    text = await repCounter.textContent();
    expect(text).toContain("Cooldown Phase");
  });
});

test.describe("Segment Timer - Pause and Resume", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      const result = savePlan({
        name: "Pause Test Plan",
        mode: "custom",
        segments: [
          {
            type: "hiit-work",
            duration: 10,
            intensity: "hard",
            name: "Work",
            soundCue: "alert"
          }
        ]
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);
  });

  test("should pause segment timer", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");

    await startBtn.click();
    await wait(2000);

    // Pause
    await startBtn.click();
    await wait(500);

    const timerDisplay = page.locator("#timerDisplay");
    const pausedTime = await timerDisplay.textContent();

    await wait(2000);

    const stillPausedTime = await timerDisplay.textContent();

    expect(pausedTime).toBe(stillPausedTime);
  });

  test("should resume segment timer from paused state", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");

    await startBtn.click();
    await wait(2000);

    // Pause
    await startBtn.click();
    const timerDisplay = page.locator("#timerDisplay");
    const pausedTime = await timerDisplay.textContent();

    await wait(1000);

    // Resume
    await startBtn.click();
    await wait(2000);

    const resumedTime = await timerDisplay.textContent();

    expect(resumedTime).not.toBe(pausedTime);
  });

  test("should show PAUSE button when running", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");

    await startBtn.click();
    await wait(500);

    const buttonText = await startBtn.textContent();

    expect(buttonText).toBe("PAUSE");
  });

  test("should show RESUME button when paused", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");

    await startBtn.click();
    await wait(500);
    await startBtn.click(); // Pause
    await wait(500);

    const buttonText = await startBtn.textContent();

    expect(buttonText).toBe("RESUME");
  });
});

test.describe("Segment Timer - Reset Functionality", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      const result = savePlan({
        name: "Reset Test Plan",
        mode: "custom",
        segments: [
          {
            type: "hiit-work",
            duration: 5,
            intensity: "hard",
            name: "Segment 1",
            soundCue: "alert"
          },
          {
            type: "complete-rest",
            duration: 5,
            intensity: "light",
            name: "Segment 2",
            soundCue: "complete"
          }
        ]
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);
  });

  test("should reset to first segment", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const resetBtn = page.locator("#timerResetBtn");

    // Run to second segment
    await startBtn.click();
    await wait(6000);

    const repCounter = page.locator("#repCounter");
    let text = await repCounter.textContent();
    expect(text).toContain("Segment 2");

    // Reset
    await resetBtn.click();
    await wait(500);

    text = await repCounter.textContent();
    expect(text).toContain("Segment 1");
  });

  test("should reset timer to first segment duration", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const resetBtn = page.locator("#timerResetBtn");

    await startBtn.click();
    await wait(2000);

    // Reset
    await resetBtn.click();
    await wait(500);

    const timerDisplay = page.locator("#timerDisplay");
    const text = await timerDisplay.textContent();

    expect(text).toBe("0:05");
  });

  test("should reset segment counter to 1/N", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const resetBtn = page.locator("#timerResetBtn");

    await startBtn.click();
    await wait(6000); // Move to segment 2

    await resetBtn.click();
    await wait(500);

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("(1/2)");
  });
});

test.describe("Segment Timer - Simple Mode Compatibility", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    // Select Quick Start (simple mode)
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-card").first().click(); // Quick Start
    await wait(500);
  });

  test("should use simple mode when Quick Start selected", async ({page}) => {
    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    // Simple mode shows "Rep X / Y", not segment names
    expect(text).toMatch(/Rep \d+ \/ \d+/);
  });

  test("should transition between work and rest in simple mode", async ({page}) => {
    const startBtn = page.locator("#timerStartBtn");
    const repCounter = page.locator("#repCounter");

    await startBtn.click();
    await wait(2000);

    // Should still show Rep format
    const text = await repCounter.textContent();
    expect(text).toMatch(/Rep/);
  });

  test("should switch to segment mode when selecting preset plan", async ({page}) => {
    // Select a preset plan
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);
    await page.locator(".plan-card").first().click();
    await wait(500);

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    // Should now show segment name, not "Rep X / Y"
    expect(text).not.toMatch(/^Rep \d+ \/ \d+$/);
    expect(text).toContain("(");
    expect(text).toContain("/");
    expect(text).toContain(")");
  });
});

test.describe("Segment Timer - Edge Cases", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await mockAudioAPI(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should handle single segment plan", async ({page}) => {
    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      const result = savePlan({
        name: "Single Segment",
        mode: "custom",
        segments: [
          {
            type: "hiit-work",
            duration: 3,
            intensity: "hard",
            name: "Only Segment",
            soundCue: "final-complete"
          }
        ]
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("(1/1)");
  });

  test("should handle many segments plan", async ({page}) => {
    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      // Create plan with 10 segments
      const segments = [];
      for (let i = 0; i < 10; i++) {
        segments.push({
          type: i % 2 === 0 ? "hiit-work" : "complete-rest",
          duration: 2,
          intensity: i % 2 === 0 ? "hard" : "light",
          name: `Segment ${i + 1}`,
          soundCue: "none"
        });
      }

      const result = savePlan({
        name: "Many Segments",
        mode: "custom",
        segments
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("(1/10)");
  });

  test("should handle very short segment durations", async ({page}) => {
    await page.evaluate(async () => {
      const {savePlan, setActivePlan} = await import("/src/js/modules/plans/storage.js");
      const {getTimer} = await import("/src/js/modules/timer.js");

      const result = savePlan({
        name: "Short Segments",
        mode: "custom",
        segments: [
          {
            type: "hiit-work",
            duration: 1,
            intensity: "max",
            name: "Quick Burst",
            soundCue: "alert"
          },
          {
            type: "complete-rest",
            duration: 1,
            intensity: "light",
            name: "Quick Rest",
            soundCue: "complete"
          }
        ]
      });

      setActivePlan(result.planId);

      const timer = getTimer();
      const plan = await import("/src/js/modules/plans/storage.js");
      const loadedPlan = plan.getPlanById(result.planId);
      timer.loadPlanSegments(loadedPlan.segments);
    });

    await page.reload();
    await waitForAppReady(page);

    const startBtn = page.locator("#timerStartBtn");
    await startBtn.click();
    await wait(1500); // Wait for first segment

    const repCounter = page.locator("#repCounter");
    const text = await repCounter.textContent();

    expect(text).toContain("(2/2)");
  });
});
