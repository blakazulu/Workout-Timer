/**
 * Unit Tests for Segment Types Module
 * Tests segment type definitions, categories, and utilities
 */

import {expect, test} from "@playwright/test";

test.describe("Segment Types Module - Type Definitions", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import segment types module
    await page.evaluate(async () => {
      const {
        SEGMENT_TYPES,
        SEGMENT_CATEGORIES,
        INTENSITY_LEVELS,
        SOUND_CUES,
        getSegmentType,
        isValidSegmentType
      } = await import("/src/js/modules/plans/segment-types.js");

      window.__testSegmentTypes = {
        SEGMENT_TYPES,
        SEGMENT_CATEGORIES,
        INTENSITY_LEVELS,
        SOUND_CUES,
        getSegmentType,
        isValidSegmentType
      };
    });
  });

  test("should have all preparation segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        WARMUP: SEGMENT_TYPES.WARMUP,
        MOVEMENT_PREP: SEGMENT_TYPES.MOVEMENT_PREP,
        ACTIVATION: SEGMENT_TYPES.ACTIVATION
      };
    });

    expect(types.WARMUP).toBeDefined();
    expect(types.WARMUP.id).toBe("warmup");
    expect(types.WARMUP.category).toBe("preparation");

    expect(types.MOVEMENT_PREP).toBeDefined();
    expect(types.ACTIVATION).toBeDefined();
  });

  test("should have all work segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        HIIT_WORK: SEGMENT_TYPES.HIIT_WORK,
        TABATA_WORK: SEGMENT_TYPES.TABATA_WORK,
        VO2_MAX: SEGMENT_TYPES.VO2_MAX,
        THRESHOLD: SEGMENT_TYPES.THRESHOLD,
        TEMPO: SEGMENT_TYPES.TEMPO
      };
    });

    expect(types.HIIT_WORK).toBeDefined();
    expect(types.HIIT_WORK.id).toBe("hiit-work");
    expect(types.HIIT_WORK.category).toBe("work");

    expect(types.TABATA_WORK).toBeDefined();
    expect(types.VO2_MAX).toBeDefined();
    expect(types.THRESHOLD).toBeDefined();
    expect(types.TEMPO).toBeDefined();
  });

  test("should have all rest segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        COMPLETE_REST: SEGMENT_TYPES.COMPLETE_REST,
        ACTIVE_RECOVERY: SEGMENT_TYPES.ACTIVE_RECOVERY,
        TRANSITION: SEGMENT_TYPES.TRANSITION
      };
    });

    expect(types.COMPLETE_REST).toBeDefined();
    expect(types.COMPLETE_REST.id).toBe("complete-rest");
    expect(types.COMPLETE_REST.category).toBe("rest");

    expect(types.ACTIVE_RECOVERY).toBeDefined();
    expect(types.TRANSITION).toBeDefined();
  });

  test("should have all rounds segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        BOXING_ROUND: SEGMENT_TYPES.BOXING_ROUND,
        AMRAP: SEGMENT_TYPES.AMRAP,
        EMOM: SEGMENT_TYPES.EMOM,
        CIRCUIT: SEGMENT_TYPES.CIRCUIT
      };
    });

    expect(types.BOXING_ROUND).toBeDefined();
    expect(types.BOXING_ROUND.category).toBe("rounds");

    expect(types.AMRAP).toBeDefined();
    expect(types.EMOM).toBeDefined();
    expect(types.CIRCUIT).toBeDefined();
  });

  test("should have all training-specific segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        STRENGTH: SEGMENT_TYPES.STRENGTH,
        POWER: SEGMENT_TYPES.POWER,
        ENDURANCE: SEGMENT_TYPES.ENDURANCE,
        SKILL: SEGMENT_TYPES.SKILL
      };
    });

    expect(types.STRENGTH).toBeDefined();
    expect(types.STRENGTH.category).toBe("training-specific");

    expect(types.POWER).toBeDefined();
    expect(types.ENDURANCE).toBeDefined();
    expect(types.SKILL).toBeDefined();
  });

  test("should have all completion segment types", async ({page}) => {
    const types = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      return {
        COOLDOWN: SEGMENT_TYPES.COOLDOWN,
        STATIC_STRETCH: SEGMENT_TYPES.STATIC_STRETCH,
        MOBILITY_WORK: SEGMENT_TYPES.MOBILITY_WORK
      };
    });

    expect(types.COOLDOWN).toBeDefined();
    expect(types.COOLDOWN.category).toBe("completion");

    expect(types.STATIC_STRETCH).toBeDefined();
    expect(types.MOBILITY_WORK).toBeDefined();
  });

  test("all segment types should have required properties", async ({page}) => {
    const validation = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      const results = [];

      for (const [key, type] of Object.entries(SEGMENT_TYPES)) {
        results.push({
          key,
          hasId: !!type.id,
          hasName: !!type.name,
          hasCategory: !!type.category,
          hasDescription: !!type.description,
          hasDefaultIntensity: !!type.defaultIntensity,
          hasDefaultDuration: typeof type.defaultDuration === "number"
        });
      }

      return results;
    });

    validation.forEach(type => {
      expect(type.hasId, `${type.key} should have id`).toBe(true);
      expect(type.hasName, `${type.key} should have name`).toBe(true);
      expect(type.hasCategory, `${type.key} should have category`).toBe(true);
      expect(type.hasDescription, `${type.key} should have description`).toBe(true);
      expect(type.hasDefaultIntensity, `${type.key} should have defaultIntensity`).toBe(true);
      expect(type.hasDefaultDuration, `${type.key} should have defaultDuration`).toBe(true);
    });
  });
});

test.describe("Segment Types Module - Categories", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {SEGMENT_CATEGORIES} = await import("/src/js/modules/plans/segment-types.js");
      window.__testSegmentTypes = {SEGMENT_CATEGORIES};
    });
  });

  test("should have all six categories defined", async ({page}) => {
    const categories = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_CATEGORIES;
    });

    expect(categories.PREPARATION).toBe("preparation");
    expect(categories.WORK).toBe("work");
    expect(categories.REST).toBe("rest");
    expect(categories.ROUNDS).toBe("rounds");
    expect(categories.TRAINING_SPECIFIC).toBe("training-specific");
    expect(categories.COMPLETION).toBe("completion");
  });

  test("categories should match segment type assignments", async ({page}) => {
    const categoryCheck = await page.evaluate(() => {
      const {SEGMENT_TYPES, SEGMENT_CATEGORIES} = window.__testSegmentTypes;

      const categoryCounts = {
        preparation: 0,
        work: 0,
        rest: 0,
        rounds: 0,
        "training-specific": 0,
        completion: 0
      };

      for (const type of Object.values(SEGMENT_TYPES)) {
        if (categoryCounts.hasOwnProperty(type.category)) {
          categoryCounts[type.category]++;
        }
      }

      return categoryCounts;
    });

    // Each category should have at least one segment type
    expect(categoryCheck.preparation).toBeGreaterThan(0);
    expect(categoryCheck.work).toBeGreaterThan(0);
    expect(categoryCheck.rest).toBeGreaterThan(0);
    expect(categoryCheck.rounds).toBeGreaterThan(0);
    expect(categoryCheck["training-specific"]).toBeGreaterThan(0);
    expect(categoryCheck.completion).toBeGreaterThan(0);
  });
});

test.describe("Segment Types Module - Intensity Levels", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {INTENSITY_LEVELS} = await import("/src/js/modules/plans/segment-types.js");
      window.__testSegmentTypes = {INTENSITY_LEVELS};
    });
  });

  test("should have all five intensity levels", async ({page}) => {
    const levels = await page.evaluate(() => {
      return window.__testSegmentTypes.INTENSITY_LEVELS;
    });

    expect(levels.LIGHT).toBe("light");
    expect(levels.MODERATE).toBe("moderate");
    expect(levels.HARD).toBe("hard");
    expect(levels.VERY_HARD).toBe("very-hard");
    expect(levels.MAX).toBe("max");
  });

  test("intensity levels should follow progression", async ({page}) => {
    const progression = await page.evaluate(() => {
      const {INTENSITY_LEVELS} = window.__testSegmentTypes;
      return [
        INTENSITY_LEVELS.LIGHT,
        INTENSITY_LEVELS.MODERATE,
        INTENSITY_LEVELS.HARD,
        INTENSITY_LEVELS.VERY_HARD,
        INTENSITY_LEVELS.MAX
      ];
    });

    // Just verify they're all different and defined
    const unique = new Set(progression);
    expect(unique.size).toBe(5);
    progression.forEach(level => {
      expect(level).toBeDefined();
      expect(typeof level).toBe("string");
    });
  });
});

test.describe("Segment Types Module - Sound Cues", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {SOUND_CUES} = await import("/src/js/modules/plans/segment-types.js");
      window.__testSegmentTypes = {SOUND_CUES};
    });
  });

  test("should have all sound cue options", async ({page}) => {
    const cues = await page.evaluate(() => {
      return window.__testSegmentTypes.SOUND_CUES;
    });

    expect(cues.NONE).toBe("none");
    expect(cues.ALERT).toBe("alert");
    expect(cues.COMPLETE).toBe("complete");
    expect(cues.REST_END).toBe("rest-end");
    expect(cues.FINAL_COMPLETE).toBe("final-complete");
  });

  test("sound cues should have distinct values", async ({page}) => {
    const values = await page.evaluate(() => {
      const {SOUND_CUES} = window.__testSegmentTypes;
      return Object.values(SOUND_CUES);
    });

    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

test.describe("Segment Types Module - Utility Functions", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {getSegmentType, isValidSegmentType, SEGMENT_TYPES} =
        await import("/src/js/modules/plans/segment-types.js");

      window.__testSegmentTypes = {
        getSegmentType,
        isValidSegmentType,
        SEGMENT_TYPES
      };
    });
  });

  test("getSegmentType should return type object for valid ID", async ({page}) => {
    const type = await page.evaluate(() => {
      return window.__testSegmentTypes.getSegmentType("hiit-work");
    });

    expect(type).toBeDefined();
    expect(type.id).toBe("hiit-work");
    expect(type.name).toBeDefined();
    expect(type.category).toBe("work");
  });

  test("getSegmentType should return null for invalid ID", async ({page}) => {
    const type = await page.evaluate(() => {
      return window.__testSegmentTypes.getSegmentType("invalid-type");
    });

    expect(type).toBeNull();
  });

  test("getSegmentType should work for all defined types", async ({page}) => {
    const allValid = await page.evaluate(() => {
      const {SEGMENT_TYPES, getSegmentType} = window.__testSegmentTypes;

      for (const type of Object.values(SEGMENT_TYPES)) {
        const retrieved = getSegmentType(type.id);
        if (!retrieved || retrieved.id !== type.id) {
          return false;
        }
      }

      return true;
    });

    expect(allValid).toBe(true);
  });

  test("isValidSegmentType should return true for valid types", async ({page}) => {
    const results = await page.evaluate(() => {
      const {isValidSegmentType} = window.__testSegmentTypes;

      return {
        warmup: isValidSegmentType("warmup"),
        hiitWork: isValidSegmentType("hiit-work"),
        tabataWork: isValidSegmentType("tabata-work"),
        completeRest: isValidSegmentType("complete-rest"),
        cooldown: isValidSegmentType("cooldown")
      };
    });

    expect(results.warmup).toBe(true);
    expect(results.hiitWork).toBe(true);
    expect(results.tabataWork).toBe(true);
    expect(results.completeRest).toBe(true);
    expect(results.cooldown).toBe(true);
  });

  test("isValidSegmentType should return false for invalid types", async ({page}) => {
    const results = await page.evaluate(() => {
      const {isValidSegmentType} = window.__testSegmentTypes;

      return {
        invalid1: isValidSegmentType("invalid-type"),
        invalid2: isValidSegmentType(""),
        invalid3: isValidSegmentType(null),
        invalid4: isValidSegmentType(undefined),
        invalid5: isValidSegmentType("WARMUP") // case sensitive
      };
    });

    expect(results.invalid1).toBe(false);
    expect(results.invalid2).toBe(false);
    expect(results.invalid3).toBe(false);
    expect(results.invalid4).toBe(false);
    expect(results.invalid5).toBe(false);
  });
});

test.describe("Segment Types Module - Default Values", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {SEGMENT_TYPES} = await import("/src/js/modules/plans/segment-types.js");
      window.__testSegmentTypes = {SEGMENT_TYPES};
    });
  });

  test("warmup should have appropriate defaults", async ({page}) => {
    const warmup = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_TYPES.WARMUP;
    });

    expect(warmup.defaultIntensity).toBe("light");
    expect(warmup.defaultDuration).toBeGreaterThan(30);
    expect(warmup.defaultDuration).toBeLessThanOrEqual(600);
  });

  test("HIIT work should have appropriate defaults", async ({page}) => {
    const hiit = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_TYPES.HIIT_WORK;
    });

    expect(["hard", "very-hard", "max"]).toContain(hiit.defaultIntensity);
    expect(hiit.defaultDuration).toBeGreaterThanOrEqual(20);
    expect(hiit.defaultDuration).toBeLessThanOrEqual(60);
  });

  test("Tabata should have 20-second default", async ({page}) => {
    const tabata = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_TYPES.TABATA_WORK;
    });

    expect(tabata.defaultDuration).toBe(20);
  });

  test("complete rest should have light or no intensity", async ({page}) => {
    const rest = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_TYPES.COMPLETE_REST;
    });

    expect(["light", "none"]).toContain(rest.defaultIntensity);
  });

  test("cooldown should have light intensity", async ({page}) => {
    const cooldown = await page.evaluate(() => {
      return window.__testSegmentTypes.SEGMENT_TYPES.COOLDOWN;
    });

    expect(cooldown.defaultIntensity).toBe("light");
  });

  test("all default durations should be positive and reasonable", async ({page}) => {
    const durationCheck = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      const results = [];

      for (const [key, type] of Object.entries(SEGMENT_TYPES)) {
        results.push({
          key,
          duration: type.defaultDuration,
          isPositive: type.defaultDuration > 0,
          isReasonable: type.defaultDuration >= 5 && type.defaultDuration <= 600
        });
      }

      return results;
    });

    durationCheck.forEach(check => {
      expect(check.isPositive, `${check.key} duration should be positive`).toBe(true);
      expect(check.isReasonable, `${check.key} duration should be between 5-600s`).toBe(true);
    });
  });
});

test.describe("Segment Types Module - Integration", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const module = await import("/src/js/modules/plans/segment-types.js");
      window.__testSegmentTypes = module;
    });
  });

  test("should support creating segment from type definition", async ({page}) => {
    const segment = await page.evaluate(() => {
      const {SEGMENT_TYPES} = window.__testSegmentTypes;
      const warmup = SEGMENT_TYPES.WARMUP;

      // Create segment using type defaults
      return {
        type: warmup.id,
        duration: warmup.defaultDuration,
        intensity: warmup.defaultIntensity,
        name: warmup.name,
        soundCue: "none"
      };
    });

    expect(segment.type).toBe("warmup");
    expect(segment.duration).toBeGreaterThan(0);
    expect(segment.intensity).toBe("light");
    expect(segment.name).toBeDefined();
    expect(segment.soundCue).toBe("none");
  });

  test("should validate segment structure", async ({page}) => {
    const validation = await page.evaluate(() => {
      const {isValidSegmentType, INTENSITY_LEVELS, SOUND_CUES} = window.__testSegmentTypes;

      const testSegment = {
        type: "hiit-work",
        duration: 30,
        intensity: "hard",
        name: "Sprint",
        soundCue: "alert"
      };

      const intensityValues = Object.values(INTENSITY_LEVELS);
      const soundCueValues = Object.values(SOUND_CUES);

      return {
        validType: isValidSegmentType(testSegment.type),
        validIntensity: intensityValues.includes(testSegment.intensity),
        validSoundCue: soundCueValues.includes(testSegment.soundCue),
        validDuration: testSegment.duration > 0
      };
    });

    expect(validation.validType).toBe(true);
    expect(validation.validIntensity).toBe(true);
    expect(validation.validSoundCue).toBe(true);
    expect(validation.validDuration).toBe(true);
  });
});
