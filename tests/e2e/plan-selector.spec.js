/**
 * E2E Tests for Plan Selector UI
 * Tests plan selection modal, mode switching, and plan activation
 */

import {expect, test} from "@playwright/test";
import {
  clearStorage,
  waitForAppReady,
  wait,
  disablePostHog
} from "../helpers/test-helpers.js";

test.describe("Plan Selector - Opening and Closing", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should open plan selector when clicking active plan button", async ({page}) => {
    const selectPlanBtn = page.locator("#selectPlanBtn");
    await selectPlanBtn.click();
    await wait(300);

    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(true);
  });

  test("should close plan selector when clicking close button", async ({page}) => {
    // Open selector
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    // Close it
    const closeBtn = page.locator(".plan-selector-close");
    await closeBtn.click();
    await wait(300);

    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(false);
  });

  test("should display plan selector header", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    const header = page.locator(".plan-selector-popover h3");
    const headerText = await header.textContent();

    expect(headerText).toContain("Select Workout Plan");
  });
});

test.describe("Plan Selector - Mode Tabs", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
    await page.locator("#selectPlanBtn").click();
    await wait(300);
  });

  test("should have three mode tabs", async ({page}) => {
    const tabs = page.locator(".plan-mode-tab");
    const count = await tabs.count();

    expect(count).toBe(3);
  });

  test("should show Simple, Built-in Plans, and My Plans tabs", async ({page}) => {
    const tabTexts = await page.locator(".plan-mode-tab").allTextContents();

    expect(tabTexts).toContain("Simple");
    expect(tabTexts).toContain("Built-in Plans");
    expect(tabTexts).toContain("My Plans");
  });

  test("Simple tab should be active by default", async ({page}) => {
    const simpleTab = page.locator(".plan-mode-tab[data-mode='simple']");
    const isActive = await simpleTab.evaluate(el => el.classList.contains("active"));

    expect(isActive).toBe(true);
  });

  test("should switch to Built-in Plans tab", async ({page}) => {
    const presetTab = page.locator(".plan-mode-tab[data-mode='preset']");
    await presetTab.click();
    await wait(300);

    const isActive = await presetTab.evaluate(el => el.classList.contains("active"));
    expect(isActive).toBe(true);

    // Simple tab should no longer be active
    const simpleTab = page.locator(".plan-mode-tab[data-mode='simple']");
    const simpleActive = await simpleTab.evaluate(el => el.classList.contains("active"));
    expect(simpleActive).toBe(false);
  });

  test("should switch to My Plans tab", async ({page}) => {
    const customTab = page.locator(".plan-mode-tab[data-mode='custom']");
    await customTab.click();
    await wait(300);

    const isActive = await customTab.evaluate(el => el.classList.contains("active"));
    expect(isActive).toBe(true);
  });

  test("should update plan list when switching tabs", async ({page}) => {
    // Get Simple mode content
    const simpleModeContent = await page.locator("#planList").textContent();

    // Switch to Built-in Plans
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);

    const presetModeContent = await page.locator("#planList").textContent();

    // Content should be different
    expect(presetModeContent).not.toBe(simpleModeContent);
  });
});

test.describe("Plan Selector - Simple Mode", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
    await page.locator("#selectPlanBtn").click();
    await wait(300);
  });

  test("should display Quick Start plan in Simple mode", async ({page}) => {
    const planList = page.locator("#planList");
    const content = await planList.textContent();

    expect(content).toContain("Quick Start");
  });

  test("should show current settings in Quick Start card", async ({page}) => {
    const planCard = page.locator(".plan-card").first();
    const cardText = await planCard.textContent();

    // Should show duration, rest, reps
    expect(cardText).toMatch(/\d+s work/);
    expect(cardText).toMatch(/\d+s rest/);
    expect(cardText).toMatch(/\d+ sets/);
  });

  test("should select Quick Start when clicked", async ({page}) => {
    const quickStartCard = page.locator(".plan-card").first();
    await quickStartCard.click();
    await wait(500);

    // Modal should close
    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));
    expect(isOpen).toBe(false);

    // Active plan display should update
    const activePlanName = page.locator("#currentPlanName");
    const name = await activePlanName.textContent();
    expect(name).toBe("Quick Start");
  });
});

test.describe("Plan Selector - Built-in Plans Mode", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    // Switch to Built-in Plans tab
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);
  });

  test("should display 12 preset plans", async ({page}) => {
    const planCards = page.locator(".plan-card");
    const count = await planCards.count();

    expect(count).toBe(12);
  });

  test("should show plan names and descriptions", async ({page}) => {
    const firstCard = page.locator(".plan-card").first();
    const hasName = await firstCard.locator(".plan-card-title").count();
    const hasDescription = await firstCard.locator(".plan-card-description").count();

    expect(hasName).toBeGreaterThan(0);
    expect(hasDescription).toBeGreaterThan(0);
  });

  test("should show duration for each preset", async ({page}) => {
    const firstCard = page.locator(".plan-card").first();
    const cardText = await firstCard.textContent();

    // Should contain duration info (minutes)
    expect(cardText).toMatch(/\d+ min/);
  });

  test("should show segment count for each preset", async ({page}) => {
    const firstCard = page.locator(".plan-card").first();
    const cardText = await firstCard.textContent();

    // Should contain segment count
    expect(cardText).toMatch(/\d+ segments?/);
  });

  test("should select preset plan when clicked", async ({page}) => {
    const firstPreset = page.locator(".plan-card").first();
    const presetName = await firstPreset.locator(".plan-card-title").textContent();

    await firstPreset.click();
    await wait(500);

    // Modal should close
    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));
    expect(isOpen).toBe(false);

    // Active plan display should update
    const activePlanName = page.locator("#currentPlanName");
    const name = await activePlanName.textContent();
    expect(name).toBe(presetName);
  });

  test("should show active badge on selected plan", async ({page}) => {
    // Select first preset
    const firstPreset = page.locator(".plan-card").first();
    await firstPreset.click();
    await wait(500);

    // Reopen selector
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);

    // First card should have active badge
    const activeBadge = page.locator(".plan-card.active-plan .active-badge");
    const isVisible = await activeBadge.isVisible();

    expect(isVisible).toBe(true);
  });

  test("should have Beginner HIIT preset", async ({page}) => {
    const cards = page.locator(".plan-card");
    const allTexts = await cards.allTextContents();
    const hasBeginner = allTexts.some(text => text.includes("Beginner HIIT"));

    expect(hasBeginner).toBe(true);
  });

  test("should have Tabata Protocol preset", async ({page}) => {
    const cards = page.locator(".plan-card");
    const allTexts = await cards.allTextContents();
    const hasTabata = allTexts.some(text => text.includes("Tabata"));

    expect(hasTabata).toBe(true);
  });
});

test.describe("Plan Selector - My Plans Mode", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    // Switch to My Plans tab
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);
  });

  test("should show empty state when no custom plans exist", async ({page}) => {
    const planList = page.locator("#planList");
    const content = await planList.textContent();

    expect(content).toContain("No custom plans yet");
  });

  test("should show Create Custom Plan button", async ({page}) => {
    const createBtn = page.locator("#createCustomPlanBtn");
    const isVisible = await createBtn.isVisible();

    expect(isVisible).toBe(true);
  });

  test("should open plan builder when clicking Create button", async ({page}) => {
    const createBtn = page.locator("#createCustomPlanBtn");
    await createBtn.click();
    await wait(500);

    const builderPopover = page.locator("#planBuilderPopover");
    const isOpen = await builderPopover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(true);
  });

  test("should display custom plan after creating one", async ({page}) => {
    // Create a custom plan
    await page.evaluate(async () => {
      const {savePlan} = await import("/src/js/modules/plans/storage.js");
      savePlan({
        name: "My Test Plan",
        description: "Test description",
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

    // Reload the plan list
    await page.locator(".plan-mode-tab[data-mode='simple']").click();
    await wait(100);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);

    const planList = page.locator("#planList");
    const content = await planList.textContent();

    expect(content).toContain("My Test Plan");
  });

  test("should show edit and delete buttons on custom plans", async ({page}) => {
    // Create a custom plan
    await page.evaluate(async () => {
      const {savePlan} = await import("/src/js/modules/plans/storage.js");
      savePlan({
        name: "Editable Plan",
        mode: "custom",
        segments: []
      });
    });

    // Reload list
    await page.locator(".plan-mode-tab[data-mode='simple']").click();
    await wait(100);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);

    const editBtn = page.locator(".edit-plan-btn").first();
    const deleteBtn = page.locator(".delete-plan-btn").first();

    const editVisible = await editBtn.isVisible();
    const deleteVisible = await deleteBtn.isVisible();

    expect(editVisible).toBe(true);
    expect(deleteVisible).toBe(true);
  });

  test("should open plan builder in edit mode when clicking edit", async ({page}) => {
    // Create a custom plan
    await page.evaluate(async () => {
      const {savePlan} = await import("/src/js/modules/plans/storage.js");
      savePlan({
        name: "Edit Me",
        mode: "custom",
        segments: []
      });
    });

    // Reload list
    await page.locator(".plan-mode-tab[data-mode='simple']").click();
    await wait(100);
    await page.locator(".plan-mode-tab[data-mode='custom']").click();
    await wait(300);

    // Click edit button
    const editBtn = page.locator(".edit-plan-btn").first();
    await editBtn.click();
    await wait(500);

    const builderPopover = page.locator("#planBuilderPopover");
    const isOpen = await builderPopover.evaluate(el => el.matches(":popover-open"));
    expect(isOpen).toBe(true);

    // Title should indicate edit mode
    const title = await page.locator("#planBuilderTitle").textContent();
    expect(title).toContain("Edit");
  });
});

test.describe("Plan Selector - Active Plan Display", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should show 'Quick Start' by default", async ({page}) => {
    const activePlanName = page.locator("#currentPlanName");
    const name = await activePlanName.textContent();

    expect(name).toBe("Quick Start");
  });

  test("should update display when selecting different plan", async ({page}) => {
    // Open selector and select preset
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);

    const firstPreset = page.locator(".plan-card").first();
    const presetName = await firstPreset.locator(".plan-card-title").textContent();
    await firstPreset.click();
    await wait(500);

    // Check updated display
    const activePlanName = page.locator("#currentPlanName");
    const name = await activePlanName.textContent();

    expect(name).toBe(presetName);
  });

  test("should persist active plan selection", async ({page}) => {
    // Select a preset plan
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);
    await page.locator(".plan-card").first().click();
    await wait(500);

    const selectedName = await page.locator("#currentPlanName").textContent();

    // Reload page
    await page.reload();
    await waitForAppReady(page);

    // Active plan should still be set
    const activePlanName = page.locator("#currentPlanName");
    const name = await activePlanName.textContent();

    expect(name).toBe(selectedName);
  });
});

test.describe("Plan Selector - Accessibility", () => {
  test.beforeEach(async ({page}) => {
    await disablePostHog(page);
    await page.goto("/");
    await waitForAppReady(page);
    await clearStorage(page);
  });

  test("should be keyboard accessible - open with Enter", async ({page}) => {
    const selectPlanBtn = page.locator("#selectPlanBtn");
    await selectPlanBtn.focus();
    await page.keyboard.press("Enter");
    await wait(300);

    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(true);
  });

  test("should be keyboard accessible - close with Escape", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    await page.keyboard.press("Escape");
    await wait(300);

    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(false);
  });

  test("should be keyboard accessible - navigate tabs with Tab key", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);

    // Focus first tab
    await page.locator(".plan-mode-tab").first().focus();

    // Tab to next element
    await page.keyboard.press("Tab");

    const focusedElement = await page.evaluate(() => document.activeElement.className);
    expect(focusedElement).toContain("plan-mode-tab");
  });

  test("plan cards should be clickable with Enter key", async ({page}) => {
    await page.locator("#selectPlanBtn").click();
    await wait(300);
    await page.locator(".plan-mode-tab[data-mode='preset']").click();
    await wait(300);

    const firstCard = page.locator(".plan-card").first();
    await firstCard.focus();
    await page.keyboard.press("Enter");
    await wait(500);

    // Modal should close (plan selected)
    const popover = page.locator("#planSelectorPopover");
    const isOpen = await popover.evaluate(el => el.matches(":popover-open"));

    expect(isOpen).toBe(false);
  });
});
