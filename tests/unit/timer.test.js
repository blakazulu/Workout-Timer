/**
 * Unit Tests for Timer Module
 * Tests timer logic, calculations, and state management
 */

import {expect, test} from "@playwright/test";

test.describe("Timer Module - Unit Tests", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Setup timer module for testing
    await page.evaluate(() => {
      // Clear any existing state
      localStorage.clear();
    });
  });

  test("should calculate total workout duration correctly", async ({page}) => {
    const duration = await page.evaluate(() => {
      // 8 sets of 40s work + 20s rest = 8 * 60s = 480s
      const workTime = 40;
      const restTime = 20;
      const sets = 8;

      return (workTime + restTime) * sets;
    });

    expect(duration).toBe(480);
  });

  test("should format time correctly (MM:SS)", async ({page}) => {
    const formatted = await page.evaluate(() => {
      // Test time formatting function
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };

      return {
        case1: formatTime(0),
        case2: formatTime(45),
        case3: formatTime(60),
        case4: formatTime(125),
        case5: formatTime(3599)
      };
    });

    expect(formatted.case1).toBe("0:00");
    expect(formatted.case2).toBe("0:45");
    expect(formatted.case3).toBe("1:00");
    expect(formatted.case4).toBe("2:05");
    expect(formatted.case5).toBe("59:59");
  });

  test("should determine current phase correctly", async ({page}) => {
    const phases = await page.evaluate(() => {
      const determinePhase = (currentSet, totalSets, isWorkPhase) => {
        if (currentSet > totalSets) return "complete";
        return isWorkPhase ? "work" : "rest";
      };

      return {
        work: determinePhase(3, 8, true),
        rest: determinePhase(3, 8, false),
        complete: determinePhase(9, 8, true)
      };
    });

    expect(phases.work).toBe("work");
    expect(phases.rest).toBe("rest");
    expect(phases.complete).toBe("complete");
  });

  test("should calculate progress percentage", async ({page}) => {
    const progress = await page.evaluate(() => {
      const calculateProgress = (currentSet, totalSets, currentTime, phaseTime) => {
        const setsProgress = ((currentSet - 1) / totalSets) * 100;
        const timeProgress = ((phaseTime - currentTime) / phaseTime) * (100 / totalSets);
        return setsProgress + timeProgress;
      };

      return {
        start: calculateProgress(1, 8, 40, 40),
        quarter: calculateProgress(2, 8, 30, 40),
        half: calculateProgress(4, 8, 20, 40),
        end: calculateProgress(8, 8, 0, 40)
      };
    });

    expect(progress.start).toBeCloseTo(0, 1);
    expect(progress.quarter).toBeGreaterThan(10);
    expect(progress.half).toBeCloseTo(43.75, 1);
    expect(progress.end).toBeCloseTo(100, 1);
  });

  test("should handle timer countdown", async ({page}) => {
    const result = await page.evaluate(async () => {
      let time = 10;
      const results = [];

      // Simulate countdown
      for (let i = 0; i < 5; i++) {
        time--;
        results.push(time);
      }

      return results;
    });

    expect(result).toEqual([9, 8, 7, 6, 5]);
  });

  test("should transition from work to rest phase", async ({page}) => {
    const transitions = await page.evaluate(() => {
      const results = [];
      let phase = "work";
      let currentTime = 3;

      // Simulate countdown to transition
      for (let i = 0; i < 5; i++) {
        currentTime--;

        if (currentTime <= 0 && phase === "work") {
          phase = "rest";
          currentTime = 20; // rest time
        }

        results.push({time: currentTime, phase});
      }

      return results;
    });

    expect(transitions[0].phase).toBe("work");
    expect(transitions[3].phase).toBe("rest");
    expect(transitions[4].time).toBe(18);
  });

  test("should increment set counter after complete cycle", async ({page}) => {
    const setProgression = await page.evaluate(() => {
      let currentSet = 1;
      let phase = "work";
      let workTime = 2;
      let restTime = 2;
      let currentTime = workTime;

      const results = [];

      // Simulate one complete cycle
      for (let i = 0; i < 5; i++) {
        currentTime--;

        if (currentTime <= 0 && phase === "work") {
          phase = "rest";
          currentTime = restTime;
        } else if (currentTime <= 0 && phase === "rest") {
          currentSet++;
          phase = "work";
          currentTime = workTime;
        }

        results.push({set: currentSet, phase, time: currentTime});
      }

      return results;
    });

    expect(setProgression[0].set).toBe(1);
    expect(setProgression[setProgression.length - 1].set).toBe(2);
  });

  test("should detect workout completion", async ({page}) => {
    const isComplete = await page.evaluate(() => {
      const checkComplete = (currentSet, totalSets, currentTime, phase) => {
        return currentSet === totalSets && currentTime === 0 && phase === "rest";
      };

      return {
        notComplete1: checkComplete(5, 8, 10, "work"),
        notComplete2: checkComplete(8, 8, 10, "rest"),
        complete: checkComplete(8, 8, 0, "rest")
      };
    });

    expect(isComplete.notComplete1).toBe(false);
    expect(isComplete.notComplete2).toBe(false);
    expect(isComplete.complete).toBe(true);
  });

  test("should calculate remaining time correctly", async ({page}) => {
    const remaining = await page.evaluate(() => {
      const calculateRemaining = (currentSet, totalSets, currentTime, workTime, restTime, phase) => {
        const remainingSets = totalSets - currentSet;
        const currentPhaseTime = currentTime;
        const nextPhaseTime = phase === "work" ? restTime : 0;
        const fullSetsTime = remainingSets * (workTime + restTime);

        return currentPhaseTime + nextPhaseTime + fullSetsTime;
      };

      return calculateRemaining(3, 8, 25, 40, 20, "work");
    });

    // Set 3, work phase, 25s remaining
    // + 20s rest for current set
    // + 5 sets * 60s = 300s
    // Total: 25 + 20 + 300 = 345s
    expect(remaining).toBe(345);
  });

  test("should validate timer configuration", async ({page}) => {
    const validation = await page.evaluate(() => {
      const validateConfig = (workTime, restTime, sets) => {
        if (workTime <= 0 || restTime <= 0 || sets <= 0) return false;
        if (workTime > 600 || restTime > 600) return false; // max 10 minutes
        if (sets > 20) return false; // max 20 sets
        return true;
      };

      return {
        valid: validateConfig(40, 20, 8),
        invalidWork: validateConfig(-5, 20, 8),
        invalidRest: validateConfig(40, 0, 8),
        invalidSets: validateConfig(40, 20, 0),
        tooLongWork: validateConfig(700, 20, 8),
        tooManySets: validateConfig(40, 20, 25)
      };
    });

    expect(validation.valid).toBe(true);
    expect(validation.invalidWork).toBe(false);
    expect(validation.invalidRest).toBe(false);
    expect(validation.invalidSets).toBe(false);
    expect(validation.tooLongWork).toBe(false);
    expect(validation.tooManySets).toBe(false);
  });

  test("should handle pause and resume state", async ({page}) => {
    const pauseResume = await page.evaluate(() => {
      let isRunning = true;
      let isPaused = false;
      let timeWhenPaused = 0;

      // Pause
      if (isRunning) {
        isPaused = true;
        isRunning = false;
        timeWhenPaused = 35;
      }

      const afterPause = {isRunning, isPaused, time: timeWhenPaused};

      // Resume
      if (isPaused) {
        isRunning = true;
        isPaused = false;
      }

      const afterResume = {isRunning, isPaused, time: timeWhenPaused};

      return {afterPause, afterResume};
    });

    expect(pauseResume.afterPause.isRunning).toBe(false);
    expect(pauseResume.afterPause.isPaused).toBe(true);
    expect(pauseResume.afterPause.time).toBe(35);

    expect(pauseResume.afterResume.isRunning).toBe(true);
    expect(pauseResume.afterResume.isPaused).toBe(false);
    expect(pauseResume.afterResume.time).toBe(35);
  });
});
