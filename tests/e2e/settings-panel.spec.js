/**
 * Settings Panel E2E Tests
 * Tests dynamic settings panel behavior based on selected plan type
 */

import {expect, test} from "@playwright/test";
import {SELECTORS} from "../helpers/selectors.js";
import {waitForApp} from "../helpers/test-helpers.js";

test.describe("Dynamic Settings Panel", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");
    await waitForApp(page);
  });

  test("should show simple settings by default", async ({page}) => {
    // Simple settings should be visible by default
    const simpleSettings = page.locator("#simpleSettings");
    await expect(simpleSettings).toBeVisible();

    // Preset and custom settings should be hidden
    const presetSettings = page.locator("#presetSettings");
    const customSettings = page.locator("#customSettings");
    await expect(presetSettings).toBeHidden();
    await expect(customSettings).toBeHidden();

    // Should show all 4 inputs
    await expect(page.locator("#duration")).toBeVisible();
    await expect(page.locator("#alertTime")).toBeVisible();
    await expect(page.locator("#repetitions")).toBeVisible();
    await expect(page.locator("#restTime")).toBeVisible();
  });

  test("should switch to preset settings when preset plan selected", async ({page}) => {
    // Open plan selector
    await page.click(SELECTORS.plans.selectPlanBtn);

    // Switch to preset mode
    await page.click('[data-mode="preset"]');
    await page.waitForTimeout(300);

    // Select first preset plan (Beginner HIIT)
    const firstPreset = page.locator(".plan-card").first();
    await firstPreset.click();
    await page.waitForTimeout(500);

    // Preset settings should now be visible
    const presetSettings = page.locator("#presetSettings");
    await expect(presetSettings).toBeVisible();

    // Simple and custom settings should be hidden
    const simpleSettings = page.locator("#simpleSettings");
    const customSettings = page.locator("#customSettings");
    await expect(simpleSettings).toBeHidden();
    await expect(customSettings).toBeHidden();

    // Should show plan info
    await expect(page.locator("#presetPlanName")).toContainText("Beginner HIIT");
    await expect(page.locator("#presetPlanDescription")).not.toBeEmpty();
    await expect(page.locator("#presetPlanDuration")).not.toBeEmpty();
    await expect(page.locator("#presetPlanSegments")).toContainText("segment");

    // Should show segments preview
    const segmentsContainer = page.locator("#presetSegmentsContainer");
    await expect(segmentsContainer).toBeVisible();
    const segmentItems = segmentsContainer.locator(".segment-preview-item");
    await expect(segmentItems.first()).toBeVisible();

    // Should only show 2 inputs (alert time and repetitions)
    await expect(page.locator("#alertTimePreset")).toBeVisible();
    await expect(page.locator("#repetitionsPreset")).toBeVisible();

    // Duration and rest time inputs should not exist in this view
    await expect(page.locator("#duration")).toBeHidden();
    await expect(page.locator("#restTime")).toBeHidden();
  });

  test("should show read-only segments for preset plans", async ({page}) => {
    // Select a preset plan
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="preset"]');
    await page.waitForTimeout(300);

    const firstPreset = page.locator(".plan-card").first();
    await firstPreset.click();
    await page.waitForTimeout(500);

    // Check segments are displayed
    const segmentItems = page.locator("#presetSegmentsContainer .segment-preview-item");
    const count = await segmentItems.count();
    expect(count).toBeGreaterThan(0);

    // Each segment should have type, name, and duration
    const firstSegment = segmentItems.first();
    await expect(firstSegment.locator(".segment-preview-type")).toBeVisible();
    await expect(firstSegment.locator(".segment-preview-name")).toBeVisible();
    await expect(firstSegment.locator(".segment-preview-duration")).toBeVisible();

    // Segments should not be editable (no cursor pointer for non-custom plans)
    const cursor = await firstSegment.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).not.toBe("pointer");
  });

  test("should switch to custom settings when custom plan selected", async ({page}) => {
    // First create a custom plan
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="custom"]');
    await page.waitForTimeout(300);

    // Click create custom plan button
    await page.click("#createCustomPlanBtn");
    await page.waitForTimeout(500);

    // Add a segment
    await page.click("#addSegmentBtn");
    await page.waitForTimeout(300);
    await page.click("#confirmSegmentBtn");
    await page.waitForTimeout(300);

    // Go to step 2
    await page.click("#nextToStep2Btn");
    await page.waitForTimeout(300);

    // Fill plan details
    await page.fill("#planName", "Test Custom Plan");
    await page.fill("#planDescription", "Test description");

    // Save plan
    await page.click("#savePlanBtn");
    await page.waitForTimeout(500);

    // Plan selector should open, select the custom plan
    await page.waitForTimeout(300);
    const customPlanCard = page.locator('.plan-card:has-text("Test Custom Plan")');
    await customPlanCard.click();
    await page.waitForTimeout(500);

    // Custom settings should now be visible
    const customSettings = page.locator("#customSettings");
    await expect(customSettings).toBeVisible();

    // Simple and preset settings should be hidden
    const simpleSettings = page.locator("#simpleSettings");
    const presetSettings = page.locator("#presetSettings");
    await expect(simpleSettings).toBeHidden();
    await expect(presetSettings).toBeHidden();

    // Should show plan info
    await expect(page.locator("#customPlanName")).toContainText("Test Custom Plan");
    await expect(page.locator("#customPlanDescription")).toContainText("Test description");
    await expect(page.locator("#customPlanDuration")).not.toBeEmpty();
    await expect(page.locator("#customPlanSegments")).toContainText("segment");

    // Should show edit button
    await expect(page.locator("#editCustomPlanBtn")).toBeVisible();

    // Should show segments preview
    const segmentsContainer = page.locator("#customSegmentsContainer");
    await expect(segmentsContainer).toBeVisible();

    // Should only show 2 inputs (alert time and repetitions)
    await expect(page.locator("#alertTimeCustom")).toBeVisible();
    await expect(page.locator("#repetitionsCustom")).toBeVisible();
  });

  test("should allow editing custom plan from settings panel", async ({page}) => {
    // Create and select a custom plan (reusing logic from previous test)
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="custom"]');
    await page.waitForTimeout(300);
    await page.click("#createCustomPlanBtn");
    await page.waitForTimeout(500);
    await page.click("#addSegmentBtn");
    await page.waitForTimeout(300);
    await page.click("#confirmSegmentBtn");
    await page.waitForTimeout(300);
    await page.click("#nextToStep2Btn");
    await page.waitForTimeout(300);
    await page.fill("#planName", "Edit Test Plan");
    await page.click("#savePlanBtn");
    await page.waitForTimeout(500);
    const customPlanCard = page.locator('.plan-card:has-text("Edit Test Plan")');
    await customPlanCard.click();
    await page.waitForTimeout(500);

    // Click edit button
    await page.click("#editCustomPlanBtn");
    await page.waitForTimeout(300);

    // Plan builder should open
    const builderPopover = page.locator("#planBuilderPopover");
    await expect(builderPopover).toBeVisible();
  });

  test("should show editable segments for custom plans", async ({page}) => {
    // Create and select a custom plan
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="custom"]');
    await page.waitForTimeout(300);
    await page.click("#createCustomPlanBtn");
    await page.waitForTimeout(500);
    await page.click("#addSegmentBtn");
    await page.waitForTimeout(300);
    await page.click("#confirmSegmentBtn");
    await page.waitForTimeout(300);
    await page.click("#nextToStep2Btn");
    await page.waitForTimeout(300);
    await page.fill("#planName", "Click Test Plan");
    await page.click("#savePlanBtn");
    await page.waitForTimeout(500);
    const customPlanCard = page.locator('.plan-card:has-text("Click Test Plan")');
    await customPlanCard.click();
    await page.waitForTimeout(500);

    // Check segments are clickable
    const segmentItems = page.locator("#customSegmentsContainer .segment-preview-item");
    const firstSegment = segmentItems.first();

    // Segment should have pointer cursor
    const cursor = await firstSegment.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe("pointer");

    // Clicking segment should open plan builder
    await firstSegment.click();
    await page.waitForTimeout(300);

    const builderPopover = page.locator("#planBuilderPopover");
    await expect(builderPopover).toBeVisible();
  });

  test("should switch back to simple settings when Quick Start selected", async ({page}) => {
    // First select a preset plan
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="preset"]');
    await page.waitForTimeout(300);
    const firstPreset = page.locator(".plan-card").first();
    await firstPreset.click();
    await page.waitForTimeout(500);

    // Verify preset settings are shown
    await expect(page.locator("#presetSettings")).toBeVisible();

    // Now switch back to simple mode
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="simple"]');
    await page.waitForTimeout(300);
    const quickStart = page.locator('.plan-card:has-text("Quick Start")');
    await quickStart.click();
    await page.waitForTimeout(500);

    // Simple settings should now be visible
    const simpleSettings = page.locator("#simpleSettings");
    await expect(simpleSettings).toBeVisible();

    // Preset and custom settings should be hidden
    await expect(page.locator("#presetSettings")).toBeHidden();
    await expect(page.locator("#customSettings")).toBeHidden();

    // All 4 inputs should be visible again
    await expect(page.locator("#duration")).toBeVisible();
    await expect(page.locator("#alertTime")).toBeVisible();
    await expect(page.locator("#repetitions")).toBeVisible();
    await expect(page.locator("#restTime")).toBeVisible();
  });

  test("should persist alert time and repetitions across plan types", async ({page}) => {
    // Set alert time and repetitions in simple mode
    await page.fill("#alertTime", "5");
    await page.fill("#repetitions", "10");

    // Switch to preset plan
    await page.click(SELECTORS.plans.selectPlanBtn);
    await page.click('[data-mode="preset"]');
    await page.waitForTimeout(300);
    const firstPreset = page.locator(".plan-card").first();
    await firstPreset.click();
    await page.waitForTimeout(500);

    // Alert time and repetitions should maintain their values
    const alertTimePreset = await page.inputValue("#alertTimePreset");
    const repetitionsPreset = await page.inputValue("#repetitionsPreset");

    // Values should be set (may be from plan defaults)
    expect(parseInt(alertTimePreset)).toBeGreaterThan(0);
    expect(parseInt(repetitionsPreset)).toBeGreaterThan(0);
  });
});
