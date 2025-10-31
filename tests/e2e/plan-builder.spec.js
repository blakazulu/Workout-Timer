/**
 * E2E Tests for Simplified 2-Step Plan Builder
 * Tests custom plan creation with simplified workflow
 */

import {expect, test} from "@playwright/test";
import {
  clearStorage,
  waitForAppReady,
  wait,
  disablePostHog
} from "../helpers/test-helpers.js";

test.describe("Plan Builder - Opening and Closing", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should open plan builder from My Plans tab", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);

    const createBtn = page.locator("#createCustomPlanBtn");
    await createBtn.click();
    await wait(500);

    const builderPopover = page.locator("#planBuilderPopover");
    const isOpen = await builderPopover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(true);
  });

  test("should close plan builder when clicking close button", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);

    const closeBtn = page.locator(".plan-builder-close");
    await closeBtn.click();
    await wait(300);

    const builderPopover = page.locator("#planBuilderPopover");
    const isOpen = await builderPopover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(false);
  });

  test("should show 'Create Custom Plan' title for new plans", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);

    const title = await page.locator("#planBuilderTitle").textContent();

    expect(title).toContain("Create Custom Plan");
  });

  test("should start on Step 1 (Segments)", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);

    const step1 = page.locator("#stepSegments");
    const step2 = page.locator("#stepDetails");

    const step1Hidden = await step1.isHidden();
    const step2Hidden = await step2.isHidden();

    expect(step1Hidden).toBe(false);
    expect(step2Hidden).toBe(true);
  });
});

test.describe("Plan Builder - Step 1: Add Segments", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    // Open plan builder
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);
  });

  test("should show 'Add Segment' button", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await expect(addBtn).toBeVisible();
  });

  test("should show empty state initially", async ({page}) => {
    const emptyState = page.locator("#segmentsEmpty");
    await expect(emptyState).toBeVisible();
  });

  test("should show segment config when clicking 'Add Segment'", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const segmentConfig = page.locator("#segmentConfig");
    const isHidden = await segmentConfig.isHidden();

    expect(isHidden).toBe(false);
  });

  test("should disable 'Add Segment' button when config is open", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const isDisabled = await addBtn.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should hide segment config when clicking 'Cancel'", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const cancelBtn = page.locator("#cancelSegmentBtn");
    await cancelBtn.click();
    await wait(200);

    const segmentConfig = page.locator("#segmentConfig");
    const isHidden = await segmentConfig.isHidden();

    expect(isHidden).toBe(true);
  });

  test("should populate duration input when selecting segment type", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("warmup");
    await wait(200);

    const durationInput = page.locator("#segmentDuration");
    const value = await durationInput.inputValue();

    expect(parseInt(value)).toBe(300); // Default warmup duration
  });

  test("should enable 'Add to Plan' button when type and duration are set", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    const durationInput = page.locator("#segmentDuration");
    const confirmBtn = page.locator("#confirmSegmentBtn");

    // Initially disabled
    let isDisabled = await confirmBtn.isDisabled();
    expect(isDisabled).toBe(true);

    // Select type
    await typeSelect.selectOption("work");
    await wait(200);

    // Should be enabled after both are set
    isDisabled = await confirmBtn.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test("should add segment to list when confirmed", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    const confirmBtn = page.locator("#confirmSegmentBtn");

    await typeSelect.selectOption("work");
    await wait(200);

    await confirmBtn.click();
    await wait(300);

    const segmentCards = page.locator(".segment-card");
    const count = await segmentCards.count();

    expect(count).toBe(1);
  });

  test("should hide empty state after adding segment", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    const emptyState = page.locator("#segmentsEmpty");
    const isVisible = await emptyState.isVisible();

    expect(isVisible).toBe(false);
  });

  test("should update total duration when adding segment", async ({page}) => {
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    const totalDuration = page.locator("#totalDuration");
    const text = await totalDuration.textContent();

    expect(text).toContain("30 sec"); // Default work duration
  });

  test("should enable 'Next' button after adding segment", async ({page}) => {
    const nextBtn = page.locator("#nextToStep2Btn");

    // Initially disabled
    let isDisabled = await nextBtn.isDisabled();
    expect(isDisabled).toBe(true);

    // Add segment
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Should be enabled now
    isDisabled = await nextBtn.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test("should allow editing existing segment", async ({page}) => {
    // Add segment first
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Edit segment
    const editBtn = page.locator(".segment-edit-btn").first();
    await editBtn.click();
    await wait(200);

    // Config should be shown with existing values
    const segmentConfig = page.locator("#segmentConfig");
    const isHidden = await segmentConfig.isHidden();
    expect(isHidden).toBe(false);

    const durationInput = page.locator("#segmentDuration");
    const value = await durationInput.inputValue();
    expect(parseInt(value)).toBe(30); // Work default
  });

  test("should allow deleting segment", async ({page}) => {
    // Add segment first
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Delete segment
    const deleteBtn = page.locator(".segment-delete-btn").first();
    await deleteBtn.click();
    await wait(300);

    // Should show empty state again
    const emptyState = page.locator("#segmentsEmpty");
    const isVisible = await emptyState.isVisible();
    expect(isVisible).toBe(true);
  });
});

test.describe("Plan Builder - Step 2: Plan Details", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);

    // Open plan builder and add a segment
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);

    // Add segment
    const addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    const typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    const confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Go to step 2
    const nextBtn = page.locator("#nextToStep2Btn");
    await nextBtn.click();
    await wait(300);
  });

  test("should show Step 2 form fields", async ({page}) => {
    const planName = page.locator("#planName");
    const planDescription = page.locator("#planDescription");
    const planRepetitions = page.locator("#planRepetitions");
    const planAlertTime = page.locator("#planAlertTime");

    await expect(planName).toBeVisible();
    await expect(planDescription).toBeVisible();
    await expect(planRepetitions).toBeVisible();
    await expect(planAlertTime).toBeVisible();
  });

  test("should have default values for repetitions and alert time", async ({page}) => {
    const planRepetitions = page.locator("#planRepetitions");
    const planAlertTime = page.locator("#planAlertTime");

    const repValue = await planRepetitions.inputValue();
    const alertValue = await planAlertTime.inputValue();

    expect(repValue).toBe("1");
    expect(alertValue).toBe("3");
  });

  test("should allow going back to Step 1", async ({page}) => {
    const backBtn = page.locator("#backToStep1Btn");
    await backBtn.click();
    await wait(300);

    const step1 = page.locator("#stepSegments");
    const step2 = page.locator("#stepDetails");

    const step1Hidden = await step1.isHidden();
    const step2Hidden = await step2.isHidden();

    expect(step1Hidden).toBe(false);
    expect(step2Hidden).toBe(true);
  });

  test("should validate plan name is required", async ({page}) => {
    const saveBtn = page.locator("#savePlanBtn");
    await saveBtn.click();
    await wait(300);

    const errorMessage = page.locator("#nameError");
    const isVisible = await errorMessage.isVisible();

    expect(isVisible).toBe(true);
  });

  test("should save plan with valid data", async ({page}) => {
    const planName = page.locator("#planName");
    await planName.fill("My Test Workout");

    const saveBtn = page.locator("#savePlanBtn");
    await saveBtn.click();
    await wait(600);

    // Builder should close
    const builderPopover = page.locator("#planBuilderPopover");
    const isOpen = await builderPopover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(false);

    // Plan should be saved
    const savedPlans = await page.evaluate(async () => {
      const {getAllCustomPlans} = await import("/src/js/modules/plans/storage.js");
      return getAllCustomPlans();
    });

    expect(savedPlans.length).toBeGreaterThan(0);
    expect(savedPlans[0].name).toBe("My Test Workout");
  });
});

test.describe("Plan Builder - Complete Workflow", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should create a complete plan with multiple segments", async ({page}) => {
    // Open plan builder
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
    await page.locator("#createCustomPlanBtn").click();
    await wait(500);

    // Add Warm-up segment
    let addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    let typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("warmup");
    await wait(200);

    let confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Add Work segment
    addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("work");
    await wait(200);

    confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Add Rest segment
    addBtn = page.locator("#addSegmentBtn");
    await addBtn.click();
    await wait(200);

    typeSelect = page.locator("#segmentTypeSelect");
    await typeSelect.selectOption("rest");
    await wait(200);

    confirmBtn = page.locator("#confirmSegmentBtn");
    await confirmBtn.click();
    await wait(300);

    // Verify 3 segments
    const segmentCards = page.locator(".segment-card");
    const count = await segmentCards.count();
    expect(count).toBe(3);

    // Go to Step 2
    const nextBtn = page.locator("#nextToStep2Btn");
    await nextBtn.click();
    await wait(300);

    // Fill plan details
    const planName = page.locator("#planName");
    await planName.fill("Complete HIIT Workout");

    const planDescription = page.locator("#planDescription");
    await planDescription.fill("High intensity interval training with rest periods");

    const planRepetitions = page.locator("#planRepetitions");
    await planRepetitions.fill("3");

    // Save plan
    const saveBtn = page.locator("#savePlanBtn");
    await saveBtn.click();
    await wait(600);

    // Verify plan saved
    const savedPlans = await page.evaluate(async () => {
      const {getAllCustomPlans} = await import("/src/js/modules/plans/storage.js");
      return getAllCustomPlans();
    });

    expect(savedPlans.length).toBe(1);
    expect(savedPlans[0].name).toBe("Complete HIIT Workout");
    expect(savedPlans[0].segments.length).toBe(3);
    expect(savedPlans[0].repetitions).toBe(3);
  });
});
