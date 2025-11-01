/**
 * Plan Selector UI Module
 * Handles workout plan selection interface with 3 modes: Simple, Preset, Custom
 */

import {$} from "../utils/dom.js";
import {formatTime} from "../utils/time.js";
import {
  createQuickStartPlan,
  deletePlan,
  getAllPresets,
  getPlanById,
  loadActivePlan,
  loadPlans,
  setActivePlan
} from "../modules/plans/index.js";
import {loadSettings} from "../modules/storage.js";
import {eventBus} from "../core/event-bus.js";
import {analytics} from "../core/analytics.js";

// Current mode state
let currentMode = "simple";

/**
 * Initialize plan selector
 * Sets up event listeners and renders initial plan list
 */
export function initPlanSelector() {
  console.log("[PlanSelector] Initializing plan selector...");

  // Mode tab click handlers
  const modeTabs = document.querySelectorAll(".plan-mode-tab");
  modeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.mode;
      switchMode(mode);
    });
  });

  // Create custom plan button
  const createBtn = $("#createCustomPlanBtn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      // Close selector, open builder
      const selectorPopover = $("#planSelectorPopover");
      if (selectorPopover) {
        selectorPopover.hidePopover();
      }

      // Emit event to open plan builder
      eventBus.emit("plan-builder:open");
    });
  }

  // Listen for plan updates to refresh list
  eventBus.on("plan:saved", () => {
    renderPlanList(currentMode);
    updateActivePlanDisplay();
  });

  eventBus.on("plan:deleted", () => {
    renderPlanList(currentMode);
    updateActivePlanDisplay();
  });

  // Listen for request to open selector in custom mode (after creating a plan)
  eventBus.on("plan-selector:open-custom-mode", () => {
    // Switch to custom mode
    switchMode("custom");

    // Open the plan selector popover
    const selectorPopover = $("#planSelectorPopover");
    if (selectorPopover) {
      selectorPopover.showPopover();
    }
  });

  // Render initial plan list for simple mode
  renderPlanList("simple");

  // Update active plan display on settings panel
  updateActivePlanDisplay();

  console.log("[PlanSelector] Initialized successfully");
}

/**
 * Switch between plan modes (simple, preset, custom)
 * @param {string} mode - Mode to switch to
 */
function switchMode(mode) {
  if (currentMode === mode) return;

  currentMode = mode;

  // Update tab active states
  const modeTabs = document.querySelectorAll(".plan-mode-tab");
  modeTabs.forEach(tab => {
    if (tab.dataset.mode === mode) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Render plan list for selected mode
  renderPlanList(mode);

  // Track analytics
  analytics.track("plan_selector:mode_switched", {mode});
}

/**
 * Render plan list for selected mode
 * @param {string} mode - Mode to render (simple, preset, custom)
 */
export function renderPlanList(mode) {
  const planListContainer = $("#planList");
  if (!planListContainer) return;

  // Clear existing plans
  planListContainer.innerHTML = "";

  if (mode === "simple") {
    renderSimpleMode(planListContainer);
  } else if (mode === "preset") {
    renderPresetMode(planListContainer);
  } else if (mode === "custom") {
    renderCustomMode(planListContainer);
  }
}

/**
 * Render simple mode (just Quick Start option)
 * @param {HTMLElement} container - Container element
 */
function renderSimpleMode(container) {
  const settings = loadSettings();
  const quickStartPlan = createQuickStartPlan(settings);

  const planCard = createPlanCard(quickStartPlan, "simple");
  container.appendChild(planCard);
}

/**
 * Render preset mode (12 built-in plans)
 * @param {HTMLElement} container - Container element
 */
function renderPresetMode(container) {
  const presets = getAllPresets();

  if (presets.length === 0) {
    container.innerHTML = `
      <div class="no-plans-message">
        <img alt="No plans" class="svg-icon" src="/svg-icons/alert-notification/information-circle.svg"/>
        <p>No preset plans available</p>
      </div>
    `;
    return;
  }

  presets.forEach(preset => {
    const planCard = createPlanCard(preset, "preset");
    container.appendChild(planCard);
  });
}

/**
 * Render custom mode (user-created plans)
 * @param {HTMLElement} container - Container element
 */
function renderCustomMode(container) {
  const customPlans = loadPlans();

  if (customPlans.length === 0) {
    container.innerHTML = `
      <div class="no-plans-message">
        <img alt="No plans" class="svg-icon" src="/svg-icons/alert-notification/information-circle.svg"/>
        <p>No custom plans yet</p>
      </div>
    `;

    // Add event listener to create first plan button
    const createFirstBtn = $("#createFirstPlanBtn");
    if (createFirstBtn) {
      createFirstBtn.addEventListener("click", () => {
        const selectorPopover = $("#planSelectorPopover");
        if (selectorPopover) {
          selectorPopover.hidePopover();
        }
        eventBus.emit("plan-builder:open");
      });
    }
    return;
  }

  customPlans.forEach(plan => {
    const planCard = createPlanCard(plan, "custom");
    container.appendChild(planCard);
  });
}

/**
 * Create plan card element
 * @param {Object} plan - Plan data
 * @param {string} mode - Plan mode (simple, preset, custom)
 * @returns {HTMLElement} Plan card element
 */
function createPlanCard(plan, mode) {
  const card = document.createElement("div");
  card.className = "plan-card";
  card.dataset.planId = plan.id;

  // Check if this is the active plan
  const activePlanId = loadActivePlan();
  const isActive = activePlanId === plan.id;
  if (isActive) {
    card.classList.add("active-plan");
  }

  // Calculate total duration
  const totalDuration = plan.duration || calculateTotalDuration(plan.segments);
  const durationDisplay = formatTime(totalDuration);

  // Usage stats (for custom plans)
  const usageDisplay = mode === "custom" && plan.usageCount > 0
    ? `<span class="plan-usage">${plan.usageCount} ${plan.usageCount === 1 ? "use" : "uses"}</span>`
    : "";

  card.innerHTML = `
    <div class="plan-card-header">
      <h4 class="plan-name">${escapeHtml(plan.name)}</h4>
      ${isActive ? "<span class=\"active-badge\">Active</span>" : ""}
    </div>
    <p class="plan-description">${escapeHtml(plan.description || "")}</p>
    <div class="plan-card-footer">
      <div class="plan-meta">
        <span class="plan-duration">
          <img alt="Duration" class="svg-icon" src="/svg-icons/date-and-time/clock-01.svg"/>
          ${durationDisplay}
        </span>
        <span class="plan-segments">
          <img alt="Segments" class="svg-icon" src="/svg-icons/bookmark-favorite/tag-01.svg"/>
          ${plan.segments.length} ${plan.segments.length === 1 ? "segment" : "segments"}
        </span>
        ${usageDisplay}
      </div>
      <div class="plan-card-actions">
        ${mode === "custom" ? `
          <button class="plan-edit-btn" data-plan-id="${plan.id}" aria-label="Edit plan" title="Edit plan">
            <img alt="Edit" class="svg-icon" src="/svg-icons/edit-formatting/edit-01.svg"/>
          </button>
          <button class="plan-delete-btn" data-plan-id="${plan.id}" aria-label="Delete plan" title="Delete plan">
            <img alt="Delete" class="svg-icon" src="/svg-icons/add-remove-delete/delete-01.svg"/>
          </button>
        ` : mode === "preset" ? `
          <button class="plan-info-btn" data-plan-id="${plan.id}" aria-label="View plan details" title="View plan details">
            <img alt="Info" class="svg-icon" src="/svg-icons/alert-notification/information-circle.svg"/>
            <span>View Details</span>
          </button>
        ` : ""}
      </div>
    </div>
  `;

  // Click handler to select plan
  card.addEventListener("click", (e) => {
    // Don't select if clicking on action buttons
    if (e.target.closest(".plan-edit-btn") || e.target.closest(".plan-delete-btn") || e.target.closest(".plan-info-btn")) {
      return;
    }
    selectPlan(plan.id);
  });

  // Edit button handler (custom plans only)
  if (mode === "custom") {
    const editBtn = card.querySelector(".plan-edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editPlan(plan.id);
      });
    }

    const deleteBtn = card.querySelector(".plan-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deletePlanWithConfirmation(plan.id);
      });
    }
  }

  // Info button handler (preset plans only)
  if (mode === "preset") {
    const infoBtn = card.querySelector(".plan-info-btn");
    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        viewPlanDetails(plan.id);
      });
    }
  }

  return card;
}

/**
 * Select a plan and apply it to settings
 * @param {string} planId - Plan ID to select
 */
export function selectPlan(planId) {
  console.log(`[PlanSelector] Selecting plan: ${planId}`);

  const plan = getPlanById(planId);
  if (!plan) {
    console.error(`[PlanSelector] Plan not found: ${planId}`);
    return;
  }

  // Set as active plan
  const success = setActivePlan(planId);
  if (!success) {
    console.error(`[PlanSelector] Failed to set active plan: ${planId}`);
    return;
  }

  // Update active plan display
  updateActivePlanDisplay();

  // Close plan selector
  const selectorPopover = $("#planSelectorPopover");
  if (selectorPopover) {
    selectorPopover.hidePopover();
  }

  // Apply plan settings to timer inputs (for simple mode backward compatibility)
  if (plan.mode === "simple" || plan.duration !== undefined) {
    const durationInput = $("#duration");
    const alertTimeInput = $("#alertTime");
    const repetitionsInput = $("#repetitions");
    const restTimeInput = $("#restTime");

    if (durationInput) durationInput.value = plan.duration || 30;
    if (alertTimeInput) alertTimeInput.value = plan.alertTime || 3;
    if (repetitionsInput) repetitionsInput.value = plan.repetitions || 3;
    if (restTimeInput) restTimeInput.value = plan.restTime || 10;
  }

  // Emit event for timer to load plan segments
  eventBus.emit("plan:selected", {plan});

  // Track analytics
  analytics.track("plan:selected", {
    planId: plan.id,
    planName: plan.name,
    mode: plan.mode
  });

  console.log(`[PlanSelector] Plan selected: ${plan.name}`);
}

/**
 * Edit a custom plan
 * @param {string} planId - Plan ID to edit
 */
function editPlan(planId) {
  console.log(`[PlanSelector] Editing plan: ${planId}`);

  // Close selector
  const selectorPopover = $("#planSelectorPopover");
  if (selectorPopover) {
    selectorPopover.hidePopover();
  }

  // Open builder in edit mode
  eventBus.emit("plan-builder:open", {planId});

  // Track analytics
  analytics.track("plan:edit_started", {planId});
}

/**
 * View plan details (read-only for preset plans)
 * @param {string} planId - Plan ID to view
 */
function viewPlanDetails(planId) {
  console.log(`[PlanSelector] Viewing plan details: ${planId}`);

  // Close selector
  const selectorPopover = $("#planSelectorPopover");
  if (selectorPopover) {
    selectorPopover.hidePopover();
  }

  // Open builder in view mode (read-only)
  eventBus.emit("plan-builder:open", {planId, viewOnly: true});

  // Track analytics
  analytics.track("plan:view_details", {planId});
}

/**
 * Delete a custom plan with confirmation
 * @param {string} planId - Plan ID to delete
 */
function deletePlanWithConfirmation(planId) {
  console.log(`[PlanSelector] Delete requested for plan: ${planId}`);

  const plan = getPlanById(planId);
  if (!plan) {
    console.error(`[PlanSelector] Plan not found: ${planId}`);
    return;
  }

  // Show custom confirmation modal
  const modal = document.getElementById("deleteConfirmationModal");
  const planNameEl = document.getElementById("planNameToDelete");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const selectorPopover = document.getElementById("planSelectorPopover");

  if (!modal || !planNameEl || !confirmBtn || !cancelBtn) {
    console.error("[PlanSelector] Delete modal elements not found", {
      modal: !!modal,
      planNameEl: !!planNameEl,
      confirmBtn: !!confirmBtn,
      cancelBtn: !!cancelBtn
    });
    return;
  }

  console.log("[PlanSelector] Modal elements found, setting up handlers");

  // Set plan name in modal
  planNameEl.textContent = `"${plan.name}"`;

  // Remove any existing listeners by cloning
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  // Helper to reopen plan selector after modal closes
  const reopenSelector = () => {
    if (selectorPopover) {
      // Small delay to allow modal to fully close first
      setTimeout(() => {
        selectorPopover.showPopover();
        console.log("[PlanSelector] Reopened plan selector");
      }, 100);
    }
  };

  // Add click handler for confirmation
  newConfirmBtn.addEventListener("click", () => {
    console.log(`[PlanSelector] Confirm delete clicked for: ${planId}`);
    const success = deletePlan(planId);

    if (success) {
      console.log(`[PlanSelector] Plan deleted successfully: ${planId}`);

      // Close modal
      modal.hidePopover();

      // Reopen plan selector
      reopenSelector();

      // Re-render plan list after selector reopens
      setTimeout(() => {
        renderPlanList(currentMode);
        updateActivePlanDisplay();
      }, 150);

      // Track analytics
      analytics.track("plan:deleted", {planId, planName: plan.name});
    } else {
      console.error(`[PlanSelector] Failed to delete plan: ${planId}`);
      // Close modal and reopen selector
      modal.hidePopover();
      reopenSelector();
    }
  });

  // Handle cancel button - close modal and reopen selector
  newCancelBtn.addEventListener("click", () => {
    console.log("[PlanSelector] Cancel delete clicked");
    modal.hidePopover();
    reopenSelector();
  });

  // Show modal (this will close the plan selector due to auto popover behavior)
  console.log("[PlanSelector] Showing delete confirmation modal");
  try {
    modal.showPopover();
    console.log("[PlanSelector] Modal shown successfully");
  } catch (error) {
    console.error("[PlanSelector] Error showing modal:", error);
  }
}

/**
 * Update active plan display on settings panel
 */
export function updateActivePlanDisplay() {
  const activePlanNameEl = $("#currentPlanName");
  if (!activePlanNameEl) return;

  const activePlanId = loadActivePlan();

  if (!activePlanId) {
    // Default to Quick Start
    activePlanNameEl.textContent = "Quick Start";
    return;
  }

  const activePlan = getPlanById(activePlanId);
  if (activePlan) {
    activePlanNameEl.textContent = activePlan.name;
  } else {
    activePlanNameEl.textContent = "Quick Start";
  }
}

/**
 * Calculate total duration of segments
 * @param {Array} segments - Array of segment objects
 * @returns {number} Total duration in seconds
 */
function calculateTotalDuration(segments) {
  if (!Array.isArray(segments)) return 0;
  return segments.reduce((total, segment) => total + (segment.duration || 0), 0);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
