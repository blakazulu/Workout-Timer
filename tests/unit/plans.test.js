/**
 * Unit Tests for Workout Plans Module
 * Tests plan CRUD operations, validation, presets, and storage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Import plans module functions
import {
  loadPlans,
  getPlanById,
  validatePlan,
  savePlan,
  deletePlan,
  loadActivePlan,
  setActivePlan,
  clearActivePlan,
  incrementPlanUsage,
  getRecentPlans,
  getMostUsedPlans,
  clearAllPlans,
  createQuickStartPlan,
  PLANS_STORAGE_KEY,
  ACTIVE_PLAN_KEY
} from "../../src/js/modules/plans/storage.js";

import {
  getAllPresets,
  getPresetById,
  getPresetsByDuration,
  duplicatePreset,
  WORKOUT_PRESETS
} from "../../src/js/modules/plans/presets.js";

import {
  SEGMENT_TYPES,
  SEGMENT_CATEGORIES,
  INTENSITY_LEVELS,
  SOUND_CUES,
  getSegmentType,
  getSegmentTypesByCategory,
  isValidSegmentType,
  getIntensityDisplayName
} from "../../src/js/modules/plans/segment-types.js";

describe("Workout Plans - Segment Types", () => {
  it("should have all required segment type categories", () => {
    expect(SEGMENT_CATEGORIES).toBeDefined();
    expect(SEGMENT_CATEGORIES.PREPARATION).toBe("preparation");
    expect(SEGMENT_CATEGORIES.WORK).toBe("work");
    expect(SEGMENT_CATEGORIES.REST).toBe("rest");
    expect(SEGMENT_CATEGORIES.ROUNDS).toBe("rounds");
    expect(SEGMENT_CATEGORIES.TRAINING_SPECIFIC).toBe("training-specific");
    expect(SEGMENT_CATEGORIES.COMPLETION).toBe("completion");
  });

  it("should have intensity levels defined", () => {
    expect(INTENSITY_LEVELS.LIGHT).toBe("light");
    expect(INTENSITY_LEVELS.MODERATE).toBe("moderate");
    expect(INTENSITY_LEVELS.HARD).toBe("hard");
    expect(INTENSITY_LEVELS.VERY_HARD).toBe("very-hard");
    expect(INTENSITY_LEVELS.MAX).toBe("max");
  });

  it("should have sound cue types defined", () => {
    expect(SOUND_CUES.NONE).toBe("none");
    expect(SOUND_CUES.ALERT).toBe("alert");
    expect(SOUND_CUES.COMPLETE).toBe("complete");
    expect(SOUND_CUES.REST_END).toBe("rest-end");
    expect(SOUND_CUES.FINAL_COMPLETE).toBe("final-complete");
  });

  it("should retrieve segment type by ID", () => {
    const warmup = getSegmentType("warmup");
    expect(warmup).toBeDefined();
    expect(warmup.name).toBe("Warm-up");
    expect(warmup.category).toBe(SEGMENT_CATEGORIES.PREPARATION);
  });

  it("should return null for invalid segment type ID", () => {
    const invalid = getSegmentType("invalid-type");
    expect(invalid).toBeNull();
  });

  it("should filter segment types by category", () => {
    const workTypes = getSegmentTypesByCategory(SEGMENT_CATEGORIES.WORK);
    expect(workTypes.length).toBeGreaterThan(0);
    expect(workTypes.every(t => t.category === SEGMENT_CATEGORIES.WORK)).toBe(true);
  });

  it("should validate segment type IDs", () => {
    expect(isValidSegmentType("warmup")).toBe(true);
    expect(isValidSegmentType("hiit-work")).toBe(true);
    expect(isValidSegmentType("invalid-type")).toBe(false);
  });

  it("should return intensity display names", () => {
    expect(getIntensityDisplayName(INTENSITY_LEVELS.LIGHT)).toBe("Light");
    expect(getIntensityDisplayName(INTENSITY_LEVELS.MAX)).toBe("Maximum");
  });
});

describe("Workout Plans - Presets", () => {
  it("should have 12 workout presets", () => {
    const presets = getAllPresets();
    expect(presets).toBeDefined();
    expect(presets.length).toBe(12);
  });

  it("should have all preset plans properly structured", () => {
    const presets = getAllPresets();

    presets.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.mode).toBe("preset");
      expect(preset.segments).toBeInstanceOf(Array);
      expect(preset.segments.length).toBeGreaterThan(0);
      expect(preset.duration).toBeGreaterThan(0);
      expect(preset.isPreset).toBe(true);
    });
  });

  it("should retrieve preset by ID", () => {
    const presets = getAllPresets();
    const firstPreset = presets[0];
    const retrieved = getPresetById(firstPreset.id);

    expect(retrieved).toBeDefined();
    expect(retrieved.id).toBe(firstPreset.id);
    expect(retrieved.name).toBe(firstPreset.name);
  });

  it("should return null for invalid preset ID", () => {
    const retrieved = getPresetById("invalid-preset-id");
    expect(retrieved).toBeNull();
  });

  it("should filter presets by duration", () => {
    const shortWorkouts = getPresetsByDuration(0, 900); // 0-15 minutes
    expect(shortWorkouts.length).toBeGreaterThan(0);
    expect(shortWorkouts.every(p => p.duration <= 900)).toBe(true);
  });

  it("should have Beginner HIIT preset", () => {
    const presets = getAllPresets();
    const beginnerHIIT = presets.find(p => p.name === "Beginner HIIT");

    expect(beginnerHIIT).toBeDefined();
    expect(beginnerHIIT.segments.length).toBeGreaterThan(0);
    expect(beginnerHIIT.segments[0].type).toBe("warmup");
  });

  it("should have Tabata Protocol preset", () => {
    const presets = getAllPresets();
    const tabata = presets.find(p => p.name === "Tabata Protocol");

    expect(tabata).toBeDefined();
    expect(tabata.segments.some(s => s.type === "tabata-work")).toBe(true);
  });

  it("should duplicate preset as custom plan", () => {
    const presets = getAllPresets();
    const original = presets[0];
    const duplicate = duplicatePreset(original.id);

    expect(duplicate).toBeDefined();
    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.name).toContain("(Copy)");
    expect(duplicate.mode).toBe("custom");
    expect(duplicate.isPreset).toBe(false);
    expect(duplicate.segments.length).toBe(original.segments.length);
  });

  it("should return null when duplicating invalid preset", () => {
    const duplicate = duplicatePreset("invalid-id");
    expect(duplicate).toBeNull();
  });
});

describe("Workout Plans - Validation", () => {
  let validPlan;

  beforeEach(() => {
    validPlan = {
      name: "Test Plan",
      description: "Test description",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        },
        {
          type: "hiit-work",
          duration: 40,
          intensity: INTENSITY_LEVELS.VERY_HARD,
          name: "Work",
          soundCue: SOUND_CUES.ALERT
        }
      ]
    };
  });

  it("should validate correct plan structure", () => {
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should reject plan without name", () => {
    delete validPlan.name;
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("name"))).toBe(true);
  });

  it("should reject plan with invalid mode", () => {
    validPlan.mode = "invalid-mode";
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("mode"))).toBe(true);
  });

  it("should reject plan without segments", () => {
    validPlan.segments = [];
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("segment"))).toBe(true);
  });

  it("should reject plan with invalid segment type", () => {
    validPlan.segments[0].type = "invalid-type";
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("Invalid segment type"))).toBe(true);
  });

  it("should reject plan with negative segment duration", () => {
    validPlan.segments[0].duration = -10;
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("Duration"))).toBe(true);
  });

  it("should reject plan with too long name", () => {
    validPlan.name = "x".repeat(150);
    const result = validatePlan(validPlan);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes("characters"))).toBe(true);
  });
});

describe("Workout Plans - Storage CRUD", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return empty array when no plans stored", () => {
    const plans = loadPlans();
    expect(plans).toEqual([]);
  });

  it("should save new plan to storage", () => {
    const planData = {
      name: "Test Workout",
      description: "Test description",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);

    expect(result.success).toBe(true);
    expect(result.planId).toBeDefined();

    const plans = loadPlans();
    expect(plans.length).toBe(1);
    expect(plans[0].name).toBe("Test Workout");
  });

  it("should update existing plan", () => {
    const planData = {
      id: "test-id",
      name: "Original Name",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    savePlan(planData);

    // Update the plan
    planData.name = "Updated Name";
    const result = savePlan(planData);

    expect(result.success).toBe(true);

    const plans = loadPlans();
    expect(plans.length).toBe(1);
    expect(plans[0].name).toBe("Updated Name");
  });

  it("should retrieve plan by ID", () => {
    const planData = {
      name: "Test Plan",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);
    const retrieved = getPlanById(result.planId);

    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe("Test Plan");
  });

  it("should delete plan from storage", () => {
    const planData = {
      name: "Plan to Delete",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);
    expect(loadPlans().length).toBe(1);

    const deleted = deletePlan(result.planId);
    expect(deleted).toBe(true);
    expect(loadPlans().length).toBe(0);
  });

  it("should return false when deleting non-existent plan", () => {
    const deleted = deletePlan("non-existent-id");
    expect(deleted).toBe(false);
  });
});

describe("Workout Plans - Active Plan Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return null when no active plan set", () => {
    const activePlanId = loadActivePlan();
    expect(activePlanId).toBeNull();
  });

  it("should set active plan", () => {
    // First save a plan
    const planData = {
      name: "Active Plan",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);

    // Set as active
    const setResult = setActivePlan(result.planId);
    expect(setResult).toBe(true);

    const activePlanId = loadActivePlan();
    expect(activePlanId).toBe(result.planId);
  });

  it("should clear active plan", () => {
    localStorage.setItem(ACTIVE_PLAN_KEY, "some-plan-id");

    const cleared = clearActivePlan();
    expect(cleared).toBe(true);

    const activePlanId = loadActivePlan();
    expect(activePlanId).toBeNull();
  });

  it("should clear active plan when deleted plan was active", () => {
    const planData = {
      name: "Plan to Delete",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);
    setActivePlan(result.planId);

    expect(loadActivePlan()).toBe(result.planId);

    deletePlan(result.planId);

    expect(loadActivePlan()).toBeNull();
  });
});

describe("Workout Plans - Usage Tracking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should increment plan usage count", () => {
    const planData = {
      name: "Usage Test Plan",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 300,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Warm-up",
          soundCue: SOUND_CUES.NONE
        }
      ]
    };

    const result = savePlan(planData);

    incrementPlanUsage(result.planId);
    incrementPlanUsage(result.planId);

    const plan = getPlanById(result.planId);
    expect(plan.usageCount).toBe(2);
    expect(plan.lastUsed).toBeDefined();
  });

  it("should get most used plans", () => {
    // Create multiple plans
    const plan1 = savePlan({
      name: "Plan 1",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    const plan2 = savePlan({
      name: "Plan 2",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    // Use plan2 more than plan1
    incrementPlanUsage(plan1.planId);
    incrementPlanUsage(plan2.planId);
    incrementPlanUsage(plan2.planId);

    const mostUsed = getMostUsedPlans(5);
    expect(mostUsed.length).toBe(2);
    expect(mostUsed[0].id).toBe(plan2.planId);
  });

  it("should get recent plans", () => {
    const plan1 = savePlan({
      name: "Plan 1",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    const plan2 = savePlan({
      name: "Plan 2",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    incrementPlanUsage(plan1.planId);

    // Wait a bit
    setTimeout(() => {
      incrementPlanUsage(plan2.planId);

      const recent = getRecentPlans(5);
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe(plan2.planId); // Most recent first
    }, 10);
  });
});

describe("Workout Plans - Quick Start (Backward Compatibility)", () => {
  it("should create Quick Start plan from simple settings", () => {
    const settings = {
      duration: 30,
      restTime: 10,
      repetitions: 3,
      alertTime: 3
    };

    const quickStart = createQuickStartPlan(settings);

    expect(quickStart.id).toBe("quick-start");
    expect(quickStart.name).toBe("Quick Start");
    expect(quickStart.mode).toBe("simple");
    expect(quickStart.duration).toBe(30);
    expect(quickStart.restTime).toBe(10);
    expect(quickStart.repetitions).toBe(3);
    expect(quickStart.alertTime).toBe(3);
    expect(quickStart.segments.length).toBeGreaterThan(0);
  });

  it("should create Quick Start plan without rest when restTime is 0", () => {
    const settings = {
      duration: 30,
      restTime: 0,
      repetitions: 5,
      alertTime: 3
    };

    const quickStart = createQuickStartPlan(settings);

    expect(quickStart.segments.length).toBe(1); // Only work segment, no rest
    expect(quickStart.segments[0].type).toBe("hiit-work");
  });
});

describe("Workout Plans - Cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should clear all custom plans", () => {
    savePlan({
      name: "Plan 1",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    savePlan({
      name: "Plan 2",
      mode: "custom",
      segments: [{ type: "warmup", duration: 300, intensity: "light", name: "Test", soundCue: "none" }]
    });

    expect(loadPlans().length).toBe(2);

    const cleared = clearAllPlans();
    expect(cleared).toBe(true);
    expect(loadPlans().length).toBe(0);
    expect(loadActivePlan()).toBeNull();
  });
});
