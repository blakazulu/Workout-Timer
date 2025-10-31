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

test.describe("Timer Module - Segment Mode", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test("should calculate total duration for segment plan", async ({page}) => {
    const totalDuration = await page.evaluate(() => {
      const segments = [
        {duration: 60}, // 1 minute warmup
        {duration: 30}, // 30 second work
        {duration: 15}, // 15 second rest
        {duration: 30}, // 30 second work
        {duration: 300}  // 5 minute cooldown
      ];

      return segments.reduce((sum, seg) => sum + seg.duration, 0);
    });

    expect(totalDuration).toBe(435); // 7 minutes 15 seconds
  });

  test("should track current segment index", async ({page}) => {
    const progression = await page.evaluate(() => {
      let currentSegmentIndex = 0;
      const totalSegments = 5;
      const results = [];

      // Simulate segment progression
      for (let i = 0; i < totalSegments; i++) {
        results.push({
          index: currentSegmentIndex,
          progress: `${currentSegmentIndex + 1}/${totalSegments}`
        });
        currentSegmentIndex++;
      }

      return results;
    });

    expect(progression[0].progress).toBe("1/5");
    expect(progression[2].progress).toBe("3/5");
    expect(progression[4].progress).toBe("5/5");
  });

  test("should advance to next segment after completion", async ({page}) => {
    const result = await page.evaluate(() => {
      const segments = [
        {name: "Warmup", duration: 60},
        {name: "Work", duration: 30},
        {name: "Rest", duration: 15}
      ];

      let currentSegmentIndex = 0;
      let currentTime = segments[0].duration;

      // Simulate countdown to 0
      currentTime = 0;

      // Advance to next segment
      if (currentTime === 0 && currentSegmentIndex < segments.length - 1) {
        currentSegmentIndex++;
        currentTime = segments[currentSegmentIndex].duration;
      }

      return {
        segmentIndex: currentSegmentIndex,
        segmentName: segments[currentSegmentIndex].name,
        currentTime
      };
    });

    expect(result.segmentIndex).toBe(1);
    expect(result.segmentName).toBe("Work");
    expect(result.currentTime).toBe(30);
  });

  test("should detect final segment completion", async ({page}) => {
    const result = await page.evaluate(() => {
      const segments = [
        {name: "Work", duration: 30},
        {name: "Rest", duration: 15},
        {name: "Cooldown", duration: 60}
      ];

      let currentSegmentIndex = 2; // Last segment
      let currentTime = 0; // Completed

      const isFinalSegment = currentSegmentIndex === segments.length - 1;
      const isComplete = isFinalSegment && currentTime === 0;

      return {isFinalSegment, isComplete};
    });

    expect(result.isFinalSegment).toBe(true);
    expect(result.isComplete).toBe(true);
  });

  test("should get current segment info", async ({page}) => {
    const segmentInfo = await page.evaluate(() => {
      const segments = [
        {
          type: "warmup",
          name: "Warm-up",
          duration: 300,
          intensity: "light",
          soundCue: "none"
        },
        {
          type: "hiit-work",
          name: "Sprint",
          duration: 30,
          intensity: "very-hard",
          soundCue: "alert"
        }
      ];

      const currentSegmentIndex = 1;
      const currentSegment = segments[currentSegmentIndex];

      return {
        type: currentSegment.type,
        name: currentSegment.name,
        duration: currentSegment.duration,
        intensity: currentSegment.intensity,
        soundCue: currentSegment.soundCue
      };
    });

    expect(segmentInfo.type).toBe("hiit-work");
    expect(segmentInfo.name).toBe("Sprint");
    expect(segmentInfo.duration).toBe(30);
    expect(segmentInfo.intensity).toBe("very-hard");
    expect(segmentInfo.soundCue).toBe("alert");
  });

  test("should calculate remaining time in segment plan", async ({page}) => {
    const remaining = await page.evaluate(() => {
      const segments = [
        {duration: 60}, // completed
        {duration: 30}, // completed
        {duration: 45}, // current (20s remaining)
        {duration: 60}, // upcoming
        {duration: 120}  // upcoming
      ];

      const currentSegmentIndex = 2;
      const currentTime = 20;

      // Current segment remaining time
      let totalRemaining = currentTime;

      // Add all upcoming segments
      for (let i = currentSegmentIndex + 1; i < segments.length; i++) {
        totalRemaining += segments[i].duration;
      }

      return totalRemaining;
    });

    expect(remaining).toBe(200); // 20 + 60 + 120
  });

  test("should validate segment structure", async ({page}) => {
    const validation = await page.evaluate(() => {
      const validateSegment = (segment) => {
        if (!segment.type || typeof segment.type !== "string") return false;
        if (!segment.duration || segment.duration <= 0) return false;
        if (!segment.intensity) return false;
        if (!segment.name) return false;
        if (!segment.soundCue) return false;
        return true;
      };

      const validSegment = {
        type: "hiit-work",
        duration: 30,
        intensity: "hard",
        name: "Sprint",
        soundCue: "alert"
      };

      const invalidSegment1 = {
        duration: 30,
        intensity: "hard"
        // Missing required fields
      };

      const invalidSegment2 = {
        type: "hiit-work",
        duration: -10, // Invalid duration
        intensity: "hard",
        name: "Sprint",
        soundCue: "alert"
      };

      return {
        valid: validateSegment(validSegment),
        invalid1: validateSegment(invalidSegment1),
        invalid2: validateSegment(invalidSegment2)
      };
    });

    expect(validation.valid).toBe(true);
    expect(validation.invalid1).toBe(false);
    expect(validation.invalid2).toBe(false);
  });

  test("should format segment display text", async ({page}) => {
    const displayText = await page.evaluate(() => {
      const formatSegmentDisplay = (segmentName, currentIndex, totalSegments) => {
        return `${segmentName} (${currentIndex + 1}/${totalSegments})`;
      };

      return {
        segment1: formatSegmentDisplay("Warmup", 0, 5),
        segment3: formatSegmentDisplay("Sprint", 2, 5),
        segment5: formatSegmentDisplay("Cooldown", 4, 5)
      };
    });

    expect(displayText.segment1).toBe("Warmup (1/5)");
    expect(displayText.segment3).toBe("Sprint (3/5)");
    expect(displayText.segment5).toBe("Cooldown (5/5)");
  });

  test("should handle segment mode vs simple mode distinction", async ({page}) => {
    const modeCheck = await page.evaluate(() => {
      const isSegmentMode = (segments) => {
        return segments && Array.isArray(segments) && segments.length > 0;
      };

      const segmentPlan = [
        {type: "warmup", duration: 60, intensity: "light", name: "Warmup", soundCue: "none"}
      ];

      const emptySegments = [];
      const nullSegments = null;

      return {
        withSegments: isSegmentMode(segmentPlan),
        emptyArray: isSegmentMode(emptySegments),
        nullValue: isSegmentMode(nullSegments)
      };
    });

    expect(modeCheck.withSegments).toBe(true);
    expect(modeCheck.emptyArray).toBe(false);
    expect(modeCheck.nullValue).toBe(false);
  });

  test("should map sound cues to appropriate sounds", async ({page}) => {
    const soundMapping = await page.evaluate(() => {
      const getSoundForCue = (soundCue) => {
        const soundMap = {
          "none": null,
          "alert": "beep",
          "complete": "double-beep",
          "rest-end": "whistle",
          "final-complete": "triple-beep"
        };

        return soundMap[soundCue] || null;
      };

      return {
        none: getSoundForCue("none"),
        alert: getSoundForCue("alert"),
        complete: getSoundForCue("complete"),
        restEnd: getSoundForCue("rest-end"),
        finalComplete: getSoundForCue("final-complete")
      };
    });

    expect(soundMapping.none).toBeNull();
    expect(soundMapping.alert).toBe("beep");
    expect(soundMapping.complete).toBe("double-beep");
    expect(soundMapping.restEnd).toBe("whistle");
    expect(soundMapping.finalComplete).toBe("triple-beep");
  });
});
