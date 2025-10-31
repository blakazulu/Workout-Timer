/**
 * Unit Tests for Plan Storage Module
 * Tests CRUD operations, validation, and presets for workout plans
 */

import {expect, test} from "@playwright/test";

test.describe("Plan Storage Module - Basic CRUD Operations", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import plan storage module and clear storage
    await page.evaluate(async () => {
      const {
        loadPlans,
        savePlan,
        deletePlan,
        getPlanById,
        loadActivePlan,
        setActivePlan,
        clearActivePlan
      } = await import("/src/js/modules/plans/storage.js");

      window.__testPlanStorage = {
        loadPlans,
        savePlan,
        deletePlan,
        getPlanById,
        loadActivePlan,
        setActivePlan,
        clearActivePlan
      };

      // Clear storage before each test
      localStorage.clear();
    });
  });

  test("should initialize with empty plans array", async ({page}) => {
    const plans = await page.evaluate(() => {
      return window.__testPlanStorage.loadPlans();
    });

    expect(plans).toEqual([]);
  });

  test("should save a new plan", async ({page}) => {
    const newPlan = {
      name: "Test Plan",
      description: "Test description",
      mode: "custom",
      segments: [
        {
          type: "warmup",
          duration: 60,
          intensity: "light",
          name: "Warm-up",
          soundCue: "none"
        },
        {
          type: "hiit-work",
          duration: 30,
          intensity: "very-hard",
          name: "Sprint",
          soundCue: "alert"
        }
      ]
    };

    const result = await page.evaluate((plan) => {
      return window.__testPlanStorage.savePlan(plan);
    }, newPlan);

    expect(result.success).toBe(true);
    expect(result.planId).toBeDefined();
    expect(result.errors).toBeUndefined();

    // Verify plan was saved to localStorage
    const saved = await page.evaluate(() => {
      return window.__testPlanStorage.loadPlans();
    });

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Test Plan");
    expect(saved[0].segments).toHaveLength(2);
  });

  test("should generate unique IDs for new plans", async ({page}) => {
    const plan1 = {
      name: "Plan 1",
      mode: "custom",
      segments: []
    };

    const plan2 = {
      name: "Plan 2",
      mode: "custom",
      segments: []
    };

    const ids = await page.evaluate((plans) => {
      const result1 = window.__testPlanStorage.savePlan(plans[0]);
      const result2 = window.__testPlanStorage.savePlan(plans[1]);
      return [result1.planId, result2.planId];
    }, [plan1, plan2]);

    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test("should update existing plan when ID provided", async ({page}) => {
    const result = await page.evaluate(() => {
      // Create initial plan
      const plan = {
        name: "Original Name",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);

      // Update the plan
      const updatedPlan = {
        id: saveResult.planId,
        name: "Updated Name",
        mode: "custom",
        segments: [{
          type: "warmup",
          duration: 60,
          intensity: "light",
          name: "New Warmup",
          soundCue: "none"
        }]
      };

      window.__testPlanStorage.savePlan(updatedPlan);

      // Load plans and verify
      const plans = window.__testPlanStorage.loadPlans();
      return {
        planCount: plans.length,
        planName: plans[0].name,
        segmentCount: plans[0].segments.length
      };
    });

    expect(result.planCount).toBe(1); // Should not create duplicate
    expect(result.planName).toBe("Updated Name");
    expect(result.segmentCount).toBe(1);
  });

  test("should get plan by ID", async ({page}) => {
    const plan = await page.evaluate(() => {
      const newPlan = {
        name: "Find Me",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(newPlan);
      return window.__testPlanStorage.getPlanById(saveResult.planId);
    });

    expect(plan).toBeDefined();
    expect(plan.name).toBe("Find Me");
  });

  test("should return null for non-existent plan ID", async ({page}) => {
    const plan = await page.evaluate(() => {
      return window.__testPlanStorage.getPlanById("non-existent-id");
    });

    expect(plan).toBeNull();
  });

  test("should delete plan by ID", async ({page}) => {
    const result = await page.evaluate(() => {
      // Create plan
      const plan = {
        name: "Delete Me",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);

      // Delete it
      const deleteSuccess = window.__testPlanStorage.deletePlan(saveResult.planId);

      // Verify deletion
      const plans = window.__testPlanStorage.loadPlans();

      return {
        deleteSuccess,
        planCount: plans.length
      };
    });

    expect(result.deleteSuccess).toBe(true);
    expect(result.planCount).toBe(0);
  });

  test("should return false when deleting non-existent plan", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.deletePlan("non-existent-id");
    });

    expect(result).toBe(false);
  });

  test("should include metadata in saved plans", async ({page}) => {
    const plan = await page.evaluate(() => {
      const newPlan = {
        name: "Metadata Test",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(newPlan);
      return window.__testPlanStorage.getPlanById(saveResult.planId);
    });

    expect(plan.id).toBeDefined();
    expect(plan.createdAt).toBeDefined();
    expect(plan.lastUsed).toBeNull();
    expect(plan.usageCount).toBe(0);
    expect(plan.isPreset).toBe(false);
  });
});

test.describe("Plan Storage Module - Active Plan Management", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {
        savePlan,
        loadActivePlan,
        setActivePlan,
        clearActivePlan
      } = await import("/src/js/modules/plans/storage.js");

      window.__testPlanStorage = {
        savePlan,
        loadActivePlan,
        setActivePlan,
        clearActivePlan
      };

      localStorage.clear();
    });
  });

  test("should return null when no active plan set", async ({page}) => {
    const activePlanId = await page.evaluate(() => {
      return window.__testPlanStorage.loadActivePlan();
    });

    expect(activePlanId).toBeNull();
  });

  test("should set active plan", async ({page}) => {
    const result = await page.evaluate(() => {
      // Create a plan
      const plan = {
        name: "Active Plan",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);

      // Set as active
      window.__testPlanStorage.setActivePlan(saveResult.planId);

      // Load active plan ID
      return window.__testPlanStorage.loadActivePlan();
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  test("should persist active plan across page reloads", async ({page}) => {
    // Set active plan
    await page.evaluate(() => {
      const plan = {
        name: "Persistent Plan",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);
      window.__testPlanStorage.setActivePlan(saveResult.planId);
    });

    // Reload page
    await page.reload();

    // Re-import module and check
    const activePlanId = await page.evaluate(async () => {
      const {loadActivePlan} = await import("/src/js/modules/plans/storage.js");
      return loadActivePlan();
    });

    expect(activePlanId).toBeDefined();
  });

  test("should clear active plan", async ({page}) => {
    const result = await page.evaluate(() => {
      // Create and set active plan
      const plan = {
        name: "Clear Me",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);
      window.__testPlanStorage.setActivePlan(saveResult.planId);

      // Clear it
      window.__testPlanStorage.clearActivePlan();

      // Check
      return window.__testPlanStorage.loadActivePlan();
    });

    expect(result).toBeNull();
  });
});

test.describe("Plan Storage Module - Validation", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {savePlan} = await import("/src/js/modules/plans/storage.js");
      window.__testPlanStorage = {savePlan};
      localStorage.clear();
    });
  });

  test("should reject plan without name", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        mode: "custom",
        segments: []
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Plan name is required");
  });

  test("should reject plan with empty name", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "",
        mode: "custom",
        segments: []
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Plan name is required");
  });

  test("should reject plan with name too long", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "A".repeat(101),
        mode: "custom",
        segments: []
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Plan name must be 100 characters or less");
  });

  test("should reject plan without mode", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "No Mode Plan",
        segments: []
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Plan mode is required");
  });

  test("should reject plan with invalid mode", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "Invalid Mode",
        mode: "invalid",
        segments: []
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Plan mode must be 'simple', 'preset', or 'custom'");
  });

  test("should reject custom plan without segments", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "No Segments",
        mode: "custom"
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Custom plans must have at least one segment");
  });

  test("should reject plan with invalid segment structure", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "Bad Segment",
        mode: "custom",
        segments: [
          {
            // Missing required fields
            duration: 30
          }
        ]
      });
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("should accept valid plan with all required fields", async ({page}) => {
    const result = await page.evaluate(() => {
      return window.__testPlanStorage.savePlan({
        name: "Valid Plan",
        description: "A valid plan",
        mode: "custom",
        segments: [
          {
            type: "warmup",
            duration: 60,
            intensity: "light",
            name: "Warm-up",
            soundCue: "none"
          }
        ]
      });
    });

    expect(result.success).toBe(true);
    expect(result.planId).toBeDefined();
  });
});

test.describe("Plan Storage Module - Usage Tracking", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {savePlan, incrementPlanUsage, getPlanById} =
        await import("/src/js/modules/plans/storage.js");

      window.__testPlanStorage = {
        savePlan,
        incrementPlanUsage,
        getPlanById
      };

      localStorage.clear();
    });
  });

  test("should increment usage count", async ({page}) => {
    const result = await page.evaluate(() => {
      // Create plan
      const plan = {
        name: "Track Usage",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);

      // Use it multiple times
      window.__testPlanStorage.incrementPlanUsage(saveResult.planId);
      window.__testPlanStorage.incrementPlanUsage(saveResult.planId);
      window.__testPlanStorage.incrementPlanUsage(saveResult.planId);

      // Get updated plan
      const updated = window.__testPlanStorage.getPlanById(saveResult.planId);
      return {
        usageCount: updated.usageCount,
        lastUsed: updated.lastUsed
      };
    });

    expect(result.usageCount).toBe(3);
    expect(result.lastUsed).toBeDefined();
    expect(new Date(result.lastUsed).getTime()).toBeGreaterThan(0);
  });

  test("should update lastUsed timestamp on increment", async ({page}) => {
    const timestamps = await page.evaluate(async () => {
      // Create plan
      const plan = {
        name: "Timestamp Test",
        mode: "custom",
        segments: []
      };
      const saveResult = window.__testPlanStorage.savePlan(plan);

      // First use
      window.__testPlanStorage.incrementPlanUsage(saveResult.planId);
      const plan1 = window.__testPlanStorage.getPlanById(saveResult.planId);
      const timestamp1 = plan1.lastUsed;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second use
      window.__testPlanStorage.incrementPlanUsage(saveResult.planId);
      const plan2 = window.__testPlanStorage.getPlanById(saveResult.planId);
      const timestamp2 = plan2.lastUsed;

      return {timestamp1, timestamp2};
    });

    expect(new Date(timestamps.timestamp2).getTime())
      .toBeGreaterThan(new Date(timestamps.timestamp1).getTime());
  });
});

test.describe("Plan Storage Module - Simple Mode Compatibility", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {createQuickStartPlan} =
        await import("/src/js/modules/plans/index.js");

      window.__testPlanStorage = {
        createQuickStartPlan
      };

      localStorage.clear();
    });
  });

  test("should create Quick Start plan from settings", async ({page}) => {
    const plan = await page.evaluate(() => {
      return window.__testPlanStorage.createQuickStartPlan({
        duration: 30,
        restTime: 10,
        repetitions: 3,
        alertTime: 3
      });
    });

    expect(plan.name).toBe("Quick Start");
    expect(plan.mode).toBe("simple");
    expect(plan.duration).toBe(30);
    expect(plan.restTime).toBe(10);
    expect(plan.repetitions).toBe(3);
    expect(plan.alertTime).toBe(3);
  });

  test("Quick Start plan should have empty segments for backward compatibility", async ({page}) => {
    const plan = await page.evaluate(() => {
      return window.__testPlanStorage.createQuickStartPlan({
        duration: 30,
        restTime: 10,
        repetitions: 3,
        alertTime: 3
      });
    });

    expect(plan.segments).toEqual([]);
  });
});
