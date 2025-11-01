/**
 * Plan Builder UI Module - Simplified 2-Step Workflow
 * Clean, intuitive custom workout plan creation
 */

import {getPlanById, savePlan, validatePlan} from "../modules/plans/index.js";
import {eventBus} from "../core/event-bus.js";
import {analytics} from "../core/analytics.js";
import Sortable from "sortablejs";

// ========== CONSTANTS ==========

const SEGMENT_TYPE_DEFAULTS = {
  prepare: {duration: 120, name: "Prepare", soundCue: "none"},
  warmup: {duration: 300, name: "Warm-up", soundCue: "none"},
  work: {duration: 30, name: "Work", soundCue: "alert"},
  rest: {duration: 15, name: "Rest", soundCue: "rest-end"},
  cooldown: {duration: 300, name: "Cool-down", soundCue: "none"} // Will be overridden to "final-complete" if last segment
};

// ========== STATE MANAGEMENT ==========

const builderState = {
  currentStep: 1, // 1 or 2
  segments: [], // Array of {type, duration}
  isAddingSegment: false, // True when segment config is shown
  editingSegmentIndex: null, // Index when editing existing segment
  planDetails: {
    name: "",
    description: ""
  },
  isEditMode: false,
  isViewOnly: false, // Read-only mode for preset plans
  currentPlanId: null,
  listenersSetup: false // Track if listeners have been set up
};

let sortableInstance = null;

// ========== INITIALIZATION ==========

/**
 * Initialize plan builder
 */
export function initPlanBuilder() {
  console.log("[PlanBuilder] Initializing simplified 2-step plan builder...");

  // Listen for open builder event
  eventBus.on("plan-builder:open", (data = {}) => {
    openPlanBuilder(data);
  });

  // Note: Listeners are set up when popover is first opened (in openPlanBuilder)
  // This is because popover elements are not accessible until the popover is shown

  console.log("[PlanBuilder] Initialized successfully");
}

/**
 * Setup Step 1 event listeners
 */
function setupStep1Listeners() {
  console.log("[PlanBuilder] Setting up Step 1 listeners...");

  // Debug: Check what's in the popover
  const popover = document.getElementById("planBuilderPopover");
  console.log("[PlanBuilder] Popover element:", popover);
  console.log("[PlanBuilder] Popover innerHTML length:", popover?.innerHTML.length);
  console.log("[PlanBuilder] Looking for 'segmentForm' in HTML:", popover?.innerHTML.includes("id=\"segmentForm\""));

  const addSegmentBtn = document.getElementById("addSegmentBtn");
  const cancelSegmentBtn = document.getElementById("cancelSegmentBtn");
  const confirmSegmentBtn = document.getElementById("confirmSegmentBtn");
  const segmentTypeSelect = document.getElementById("segmentTypeSelect");
  const segmentDuration = document.getElementById("segmentDuration");
  const nextToStep2Btn = document.getElementById("nextToStep2Btn");
  const segmentForm = document.getElementById("segmentForm");

  console.log("[PlanBuilder] Elements found:", {
    addSegmentBtn: !!addSegmentBtn,
    cancelSegmentBtn: !!cancelSegmentBtn,
    confirmSegmentBtn: !!confirmSegmentBtn,
    segmentTypeSelect: !!segmentTypeSelect,
    segmentDuration: !!segmentDuration,
    nextToStep2Btn: !!nextToStep2Btn,
    segmentForm: !!segmentForm
  });

  if (addSegmentBtn) {
    console.log("[PlanBuilder] Adding click listener to addSegmentBtn");
    addSegmentBtn.addEventListener("click", showSegmentForm);
  } else {
    console.error("[PlanBuilder] addSegmentBtn not found!");
  }

  if (cancelSegmentBtn) {
    cancelSegmentBtn.addEventListener("click", hideSegmentForm);
  }

  if (confirmSegmentBtn) {
    confirmSegmentBtn.addEventListener("click", confirmSegment);
  }

  if (segmentTypeSelect) {
    segmentTypeSelect.addEventListener("change", handleSegmentTypeChange);
  }

  if (segmentDuration) {
    segmentDuration.addEventListener("input", handleDurationChange);
  }

  if (nextToStep2Btn) {
    nextToStep2Btn.addEventListener("click", goToStep2);
  }
}

/**
 * Setup Step 2 event listeners
 */
function setupStep2Listeners() {
  const backToStep1Btn = document.getElementById("backToStep1Btn");
  const savePlanBtn = document.getElementById("savePlanBtn");
  const planName = document.getElementById("planName");

  if (backToStep1Btn) {
    backToStep1Btn.addEventListener("click", backToStep1);
  }

  if (savePlanBtn) {
    savePlanBtn.addEventListener("click", handleSavePlan);
  }

  if (planName) {
    planName.addEventListener("input", () => {
      const errorEl = document.getElementById("nameError");
      if (errorEl) errorEl.textContent = "";
    });
  }
}

// ========== BUILDER MANAGEMENT ==========

/**
 * Open plan builder
 * @param {Object} options - Options object
 * @param {string|null} options.planId - Plan ID to edit (null for new plan)
 * @param {boolean} options.viewOnly - Read-only mode for viewing preset plans
 */
export function openPlanBuilder({planId = null, viewOnly = false} = {}) {
  console.log(`[PlanBuilder] Opening${planId ? ` for plan: ${planId}` : " (new plan)"}${viewOnly ? " (view only)" : ""}`);

  // Reset state
  builderState.currentStep = 1;
  builderState.segments = [];
  builderState.isAddingSegment = false;
  builderState.editingSegmentIndex = null;
  builderState.isEditMode = !!planId && !viewOnly;
  builderState.isViewOnly = viewOnly;
  builderState.currentPlanId = planId;
  builderState.planDetails = {
    name: "",
    description: ""
  };

  // Update title
  const titleEl = document.getElementById("planBuilderTitle");
  if (titleEl) {
    titleEl.textContent = viewOnly ? "Plan Details" : (builderState.isEditMode ? "Edit Custom Plan" : "Create Custom Plan");
  }

  // Load existing plan if editing or viewing
  if ((builderState.isEditMode || viewOnly) && planId) {
    const plan = getPlanById(planId);
    if (plan) {
      builderState.segments = plan.segments.map(seg => ({...seg}));
      builderState.planDetails.name = plan.name;
      builderState.planDetails.description = plan.description || "";
    } else {
      console.error(`[PlanBuilder] Plan not found: ${planId}`);
      return;
    }
  }

  // Show popover
  const builderPopover = document.getElementById("planBuilderPopover");
  if (builderPopover) {
    // Set view-only attribute for CSS
    if (viewOnly) {
      builderPopover.setAttribute("data-view-only", "true");
    } else {
      builderPopover.removeAttribute("data-view-only");
    }

    builderPopover.showPopover();

    // Setup listeners after popover is shown (elements now accessible)
    // Only setup once to avoid duplicate listeners
    if (!builderState.listenersSetup) {
      console.log("[PlanBuilder] Popover shown, setting up listeners for first time...");
      setupStep1Listeners();
      setupStep2Listeners();
      builderState.listenersSetup = true;
    }

    // Update UI for view-only mode
    if (viewOnly) {
      // Update step header with plan name and description
      const stepHeaderTitle = document.querySelector("#stepSegments .step-header h3");
      const stepHeaderDesc = document.querySelector("#stepSegments .step-header p");
      if (stepHeaderTitle) {
        stepHeaderTitle.textContent = builderState.planDetails.name;
      }
      if (stepHeaderDesc) {
        stepHeaderDesc.textContent = builderState.planDetails.description || "View plan segments and details";
      }

      // Change Cancel button to Back
      const cancelBtn = document.getElementById("cancelStep1Btn");
      if (cancelBtn) {
        cancelBtn.textContent = "Back";
      }

      // Render segments
      renderSegmentsList();
      calculateTotalDuration();
    }
  }

  // Show step 1
  showStep(1);

  // Track analytics
  analytics.track("plan_builder:opened", {
    isEditMode: builderState.isEditMode
  });
}

/**
 * Close plan builder
 */
export function closePlanBuilder() {
  const builderPopover = document.getElementById("planBuilderPopover");
  if (builderPopover) {
    builderPopover.hidePopover();
  }

  // Reset state
  builderState.currentStep = 1;
  builderState.segments = [];
  builderState.isAddingSegment = false;
  builderState.editingSegmentIndex = null;
  builderState.isEditMode = false;
  builderState.currentPlanId = null;
}

/**
 * Show specific step
 * @param {number} stepNumber - Step number (1 or 2)
 */
function showStep(stepNumber) {
  const step1 = document.getElementById("stepSegments");
  const step2 = document.getElementById("stepDetails");

  if (stepNumber === 1) {
    if (step1) step1.hidden = false;
    if (step2) step2.hidden = true;
    renderSegmentsList();
    calculateTotalDuration();
    enableNextButton();
  } else if (stepNumber === 2) {
    if (step1) step1.hidden = true;
    if (step2) step2.hidden = false;
    populateStep2Form();
  }

  builderState.currentStep = stepNumber;
}

// ========== STEP 1: SEGMENTS SETUP ==========

/**
 * Show segment configuration form
 */
function showSegmentForm() {
  console.log("[PlanBuilder] showSegmentForm called");
  const formEl = document.getElementById("segmentForm");
  const addBtn = document.getElementById("addSegmentBtn");

  console.log("[PlanBuilder] formEl:", formEl);
  console.log("[PlanBuilder] addBtn:", addBtn);

  if (!formEl || !addBtn) {
    console.error("[PlanBuilder] Missing elements - formEl:", formEl, "addBtn:", addBtn);
    return;
  }

  // Show form
  console.log("[PlanBuilder] Setting formEl.hidden = false");
  formEl.hidden = false;

  // Disable add button
  addBtn.disabled = true;
  addBtn.style.opacity = "0.5";

  builderState.isAddingSegment = true;

  // Reset form
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");
  const confirmBtn = document.getElementById("confirmSegmentBtn");

  if (typeSelect) typeSelect.value = "";
  if (durationInput) durationInput.value = "";
  if (confirmBtn) confirmBtn.disabled = true;

  // Focus type select
  setTimeout(() => typeSelect?.focus(), 100);

  // Track analytics
  analytics.track("plan_builder:add_segment_clicked");
}

/**
 * Hide segment configuration form
 */
function hideSegmentForm() {
  const formEl = document.getElementById("segmentForm");
  const addBtn = document.getElementById("addSegmentBtn");

  if (!formEl || !addBtn) return;

  // Hide form
  formEl.hidden = true;

  // Enable add button
  addBtn.disabled = false;
  addBtn.style.opacity = "1";

  builderState.isAddingSegment = false;
  builderState.editingSegmentIndex = null;

  // Reset form
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");
  const confirmBtn = document.getElementById("confirmSegmentBtn");

  if (typeSelect) typeSelect.value = "";
  if (durationInput) durationInput.value = "";
  if (confirmBtn) confirmBtn.disabled = true;
}

/**
 * Handle segment type change
 */
function handleSegmentTypeChange() {
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");
  const hintEl = document.getElementById("durationHint");

  if (!typeSelect || !durationInput) return;

  const selectedType = typeSelect.value;

  if (selectedType && SEGMENT_TYPE_DEFAULTS[selectedType]) {
    // If editing, keep existing duration, otherwise use default
    if (builderState.editingSegmentIndex === null) {
      const defaultDuration = SEGMENT_TYPE_DEFAULTS[selectedType].duration;
      durationInput.value = defaultDuration;

      // Show hint
      if (hintEl) {
        hintEl.textContent = `Default: ${formatDuration(defaultDuration)}`;
      }
    }
  }

  validateSegmentConfig();
}

/**
 * Handle duration input change
 */
function handleDurationChange() {
  validateSegmentConfig();
}

/**
 * Validate segment configuration
 */
function validateSegmentConfig() {
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");
  const confirmBtn = document.getElementById("confirmSegmentBtn");

  if (!typeSelect || !durationInput || !confirmBtn) return;

  const hasType = typeSelect.value !== "";
  const hasDuration = durationInput.value && parseInt(durationInput.value) > 0;

  confirmBtn.disabled = !(hasType && hasDuration);
}

/**
 * Confirm and add segment
 */
function confirmSegment() {
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");

  if (!typeSelect || !durationInput) return;

  const type = typeSelect.value;
  const duration = parseInt(durationInput.value);

  if (!type || !duration || duration < 1) {
    return;
  }

  // Create segment with required fields including soundCue
  const typeDefaults = SEGMENT_TYPE_DEFAULTS[type];
  const segment = {
    type,
    duration,
    name: typeDefaults?.name || type,
    soundCue: typeDefaults?.soundCue || "alert" // Default to alert if no default found
  };

  // Add or update segment
  if (builderState.editingSegmentIndex !== null) {
    // Update existing segment
    builderState.segments[builderState.editingSegmentIndex] = segment;
    analytics.track("plan_builder:segment_edited", {type, duration});
  } else {
    // Add new segment
    builderState.segments.push(segment);
    analytics.track("plan_builder:segment_added", {type, duration});
  }

  // Hide form
  hideSegmentForm();

  // Re-render
  renderSegmentsList();
  calculateTotalDuration();
  enableNextButton();

  // Show success feedback
  showNotification(`${SEGMENT_TYPE_DEFAULTS[type]?.name || type} added!`, "success");
}

/**
 * Render segments list
 */
function renderSegmentsList() {
  const listEl = document.getElementById("segmentsList");
  const emptyEl = document.getElementById("segmentsEmpty");
  const countEl = document.getElementById("segmentCount");

  if (!listEl) return;

  // Update segment count
  const count = builderState.segments.length;
  if (countEl) {
    countEl.textContent = count === 1 ? "1 segment" : `${count} segments`;
  }

  if (builderState.segments.length === 0) {
    // Show empty state
    if (emptyEl) emptyEl.style.display = "flex";

    // Clear any existing segment cards
    const cards = listEl.querySelectorAll(".segment-card");
    cards.forEach(card => card.remove());

    // Destroy sortable instance
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }

    return;
  }

  // Hide empty state
  if (emptyEl) emptyEl.style.display = "none";

  // Clear existing cards
  const cards = listEl.querySelectorAll(".segment-card");
  cards.forEach(card => card.remove());

  // Render segment cards
  builderState.segments.forEach((segment, index) => {
    const card = createSegmentCard(segment, index);
    listEl.appendChild(card);
  });

  // Initialize or reinitialize SortableJS
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = new Sortable(listEl, {
    animation: 150,
    handle: ".segment-drag-handle",
    ghostClass: "segment-ghost",
    dragClass: "segment-dragging",
    chosenClass: "segment-chosen",
    filter: ".segments-empty",
    onEnd: (evt) => {
      if (evt.oldIndex !== evt.newIndex) {
        // Reorder segments array to match new DOM order
        const movedSegment = builderState.segments.splice(evt.oldIndex, 1)[0];
        builderState.segments.splice(evt.newIndex, 0, movedSegment);

        // Update data-index attributes without re-rendering
        const cards = listEl.querySelectorAll(".segment-card");
        cards.forEach((card, index) => {
          card.dataset.index = index;

          // Update button indices
          const editBtn = card.querySelector(".segment-edit-btn");
          const deleteBtn = card.querySelector(".segment-delete-btn");
          if (editBtn) editBtn.dataset.index = index;
          if (deleteBtn) deleteBtn.dataset.index = index;
        });

        // Update total duration
        calculateTotalDuration();

        // Track analytics
        analytics.track("plan_builder:segments_reordered", {
          fromIndex: evt.oldIndex,
          toIndex: evt.newIndex
        });
      }
    }
  });
}

/**
 * Create segment card element
 * @param {Object} segment - Segment data
 * @param {number} index - Segment index
 * @returns {HTMLElement} Segment card element
 */
function createSegmentCard(segment, index) {
  const card = document.createElement("div");
  card.className = "segment-card";
  card.dataset.type = segment.type;
  card.dataset.index = index;

  const typeName = SEGMENT_TYPE_DEFAULTS[segment.type]?.name || segment.type;
  const formattedDuration = formatDuration(segment.duration);

  card.innerHTML = `
    <div class="segment-drag-handle">
      <img alt="Drag" class="svg-icon" src="/svg-icons/more-menu/menu-01.svg"/>
    </div>
    <div class="segment-info">
      <span class="segment-type-badge segment-type-${segment.type}">${typeName}</span>
      <span class="segment-duration">${formattedDuration}</span>
    </div>
    <div class="segment-actions">
      <button type="button" class="segment-edit-btn" data-index="${index}" aria-label="Edit segment">
        <img alt="Edit" class="svg-icon" src="/svg-icons/edit-formatting/edit-01.svg"/>
      </button>
      <button type="button" class="segment-delete-btn" data-index="${index}" aria-label="Delete segment">
        <img alt="Delete" class="svg-icon" src="/svg-icons/add-remove-delete/delete-01.svg"/>
      </button>
    </div>
  `;

  // Add event listeners for edit/delete
  const editBtn = card.querySelector(".segment-edit-btn");
  const deleteBtn = card.querySelector(".segment-delete-btn");

  if (editBtn) {
    editBtn.addEventListener("click", () => editSegment(index));
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => deleteSegment(index));
  }

  return card;
}

/**
 * Edit segment
 * @param {number} index - Segment index
 */
function editSegment(index) {
  const segment = builderState.segments[index];
  if (!segment) return;

  builderState.editingSegmentIndex = index;

  // Show form with existing values
  const formEl = document.getElementById("segmentForm");
  const addBtn = document.getElementById("addSegmentBtn");
  const typeSelect = document.getElementById("segmentTypeSelect");
  const durationInput = document.getElementById("segmentDuration");
  const confirmBtn = document.getElementById("confirmSegmentBtn");

  if (!formEl) return;

  // Show form
  formEl.hidden = false;

  // Disable add button
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.style.opacity = "0.5";
  }

  builderState.isAddingSegment = true;

  // Populate form
  if (typeSelect) typeSelect.value = segment.type;
  if (durationInput) durationInput.value = segment.duration;
  if (confirmBtn) confirmBtn.disabled = false;

  // Update confirm button text
  if (confirmBtn) {
    confirmBtn.textContent = "Update";
  }

  // Focus duration input
  setTimeout(() => durationInput?.focus(), 100);

  // Track analytics
  analytics.track("plan_builder:segment_edit_started", {index});
}

/**
 * Delete segment
 * @param {number} index - Segment index
 */
function deleteSegment(index) {
  if (index < 0 || index >= builderState.segments.length) return;

  const segment = builderState.segments[index];

  // Remove segment
  builderState.segments.splice(index, 1);

  // Re-render
  renderSegmentsList();
  calculateTotalDuration();
  enableNextButton();

  // Track analytics
  analytics.track("plan_builder:segment_deleted", {
    type: segment.type,
    segmentCount: builderState.segments.length
  });

  // Show notification
  showNotification("Segment removed", "info");
}

/**
 * Calculate and display total duration
 */
function calculateTotalDuration() {
  const totalDurationEl = document.getElementById("totalDuration");
  if (!totalDurationEl) return;

  const totalSeconds = builderState.segments.reduce((sum, seg) => sum + seg.duration, 0);
  totalDurationEl.textContent = formatDuration(totalSeconds);
}

/**
 * Enable/disable next button based on segments
 */
function enableNextButton() {
  const nextBtn = document.getElementById("nextToStep2Btn");
  if (!nextBtn) return;

  const hasSegments = builderState.segments.length > 0;
  nextBtn.disabled = !hasSegments;
}

/**
 * Go to step 2
 */
function goToStep2() {
  // Validate at least 1 segment
  if (builderState.segments.length === 0) {
    showNotification("Add at least one segment to continue", "error");
    return;
  }

  // Track analytics
  analytics.track("plan_builder:step_completed", {step: 1});

  // Show step 2
  showStep(2);
}

// ========== STEP 2: PLAN DETAILS ==========

/**
 * Populate step 2 form
 */
function populateStep2Form() {
  const planName = document.getElementById("planName");
  const planDescription = document.getElementById("planDescription");

  if (planName) planName.value = builderState.planDetails.name;
  if (planDescription) planDescription.value = builderState.planDetails.description;

  // Focus plan name
  setTimeout(() => planName?.focus(), 100);
}

/**
 * Back to step 1
 */
function backToStep1() {
  // Save current form values
  const planName = document.getElementById("planName");
  const planDescription = document.getElementById("planDescription");

  if (planName) builderState.planDetails.name = planName.value.trim();
  if (planDescription) builderState.planDetails.description = planDescription.value.trim();

  // Track analytics
  analytics.track("plan_builder:step_back", {from: 2, to: 1});

  // Show step 1
  showStep(1);
}

/**
 * Validate plan details
 * @returns {Object} Validation result
 */
function validatePlanDetails() {
  const planName = document.getElementById("planName");

  const name = planName?.value.trim() || "";

  // Validate name
  if (!name) {
    return {isValid: false, field: "name", message: "Plan name is required"};
  }

  if (name.length < 3) {
    return {isValid: false, field: "name", message: "Plan name must be at least 3 characters"};
  }

  return {isValid: true};
}

/**
 * Handle save plan
 */
function handleSavePlan() {
  console.log("[PlanBuilder] Saving plan...");

  // Get form values
  const planName = document.getElementById("planName");
  const planDescription = document.getElementById("planDescription");

  const name = planName?.value.trim() || "";
  const description = planDescription?.value.trim() || "";

  // Validate
  const validation = validatePlanDetails();
  if (!validation.isValid) {
    showValidationError(validation);
    return;
  }

  // Build plan object
  const planData = {
    name,
    description,
    mode: "custom",
    segments: builderState.segments
  };

  // If editing, preserve ID and metadata
  if (builderState.isEditMode && builderState.currentPlanId) {
    const existingPlan = getPlanById(builderState.currentPlanId);
    if (existingPlan) {
      planData.id = existingPlan.id;
      planData.createdAt = existingPlan.createdAt;
      planData.usageCount = existingPlan.usageCount;
      planData.lastUsed = existingPlan.lastUsed;
    }
  }

  // Validate plan structure
  const planValidation = validatePlan(planData);
  if (!planValidation.isValid) {
    const errorMessage = planValidation.errors.join("\n");
    showNotification(`Validation failed: ${errorMessage}`, "error");
    console.error("[PlanBuilder] Validation errors:", planValidation.errors);
    return;
  }

  // Save
  const result = savePlan(planData);

  if (result.success) {
    console.log(`[PlanBuilder] Plan saved: ${planData.name} (ID: ${result.planId})`);

    // Success animation
    const saveBtn = document.getElementById("savePlanBtn");
    if (saveBtn) {
      saveBtn.classList.add("save-success");
      setTimeout(() => saveBtn.classList.remove("save-success"), 600);
    }

    // Close builder and reopen selector in My Plans mode
    setTimeout(() => {
      closePlanBuilder();

      // Emit event to reopen plan selector in custom mode
      eventBus.emit("plan-selector:open-custom-mode");
    }, 600);

    // Emit event to refresh plan selector
    eventBus.emit("plan:saved", {planId: result.planId});

    // Show success notification
    showNotification("Plan saved successfully!", "success");

    // Track analytics
    const totalDuration = builderState.segments.reduce((sum, seg) => sum + seg.duration, 0);
    analytics.track("plan_builder:saved", {
      planId: result.planId,
      planName: planData.name,
      segmentCount: builderState.segments.length,
      totalDuration
    });
  } else {
    const errorMessage = result.errors?.join("\n") || "Unknown error";
    showNotification(`Failed to save plan: ${errorMessage}`, "error");
    console.error("[PlanBuilder] Save failed:", result.errors);
  }
}

/**
 * Show validation error
 * @param {Object} validation - Validation result
 */
function showValidationError(validation) {
  if (validation.field === "name") {
    const errorEl = document.getElementById("nameError");
    const nameInput = document.getElementById("planName");

    if (errorEl) {
      errorEl.textContent = validation.message;
      errorEl.style.display = "block";
    }

    if (nameInput) {
      nameInput.classList.add("input-error");
      nameInput.focus();

      // Shake animation
      nameInput.style.animation = "shake 0.5s ease";
      setTimeout(() => {
        nameInput.style.animation = "";
        nameInput.classList.remove("input-error");
      }, 500);
    }
  }

  showNotification(validation.message, "error");
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds} sec`;
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = "info") {
  // Use existing notification system if available
  if (window.showNotification) {
    window.showNotification(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// SortableJS handles all drag and drop functionality
// No manual handlers needed - configured in renderSegmentsList()
