/**
 * Settings Panel UI Module
 * Handles dynamic settings panel that changes based on selected plan type
 */

import {getPlanById, loadActivePlan} from "../modules/plans/index.js";
import {eventBus} from "../core/event-bus.js";
import {formatTime} from "../utils/time.js";

/**
 * Initialize settings panel
 */
export function initSettingsPanel() {
  console.log("[SettingsPanel] Initializing dynamic settings panel...");

  // Listen for plan selection events
  eventBus.on("plan:selected", ({plan}) => {
    console.log("[SettingsPanel] Plan selected, updating panel:", plan.mode);
    updateSettingsPanel(plan);
  });

  // Listen for plan updates
  eventBus.on("plan:saved", () => {
    console.log("[SettingsPanel] Plan saved, refreshing panel");
    refreshSettingsPanel();
  });

  // Setup view details button handler for preset plans
  const viewDetailsBtn = document.getElementById("viewPresetDetailsBtn");
  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener("click", () => {
      const activePlanId = loadActivePlan();
      if (activePlanId) {
        eventBus.emit("plan-builder:open", {planId: activePlanId, viewOnly: true});
      }
    });
  }

  // Setup edit button handler for custom plans
  const editBtn = document.getElementById("editCustomPlanBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const activePlanId = loadActivePlan();
      if (activePlanId) {
        eventBus.emit("plan-builder:open", {planId: activePlanId});
      }
    });
  }

  // Setup repetitions input change handlers
  const repetitionsPresetInput = document.getElementById("repetitionsPreset");
  const repetitionsCustomInput = document.getElementById("repetitionsCustom");

  if (repetitionsPresetInput) {
    repetitionsPresetInput.addEventListener("change", () => {
      console.log("[SettingsPanel] Preset repetitions changed, reloading plan");
      const activePlanId = loadActivePlan();
      const plan = getPlanById(activePlanId);
      if (plan) {
        eventBus.emit("plan:selected", {plan});
      }
    });
  }

  if (repetitionsCustomInput) {
    repetitionsCustomInput.addEventListener("change", () => {
      console.log("[SettingsPanel] Custom repetitions changed, reloading plan");
      const activePlanId = loadActivePlan();
      const plan = getPlanById(activePlanId);
      if (plan) {
        eventBus.emit("plan:selected", {plan});
      }
    });
  }

  // Setup smart repetition checkbox change handlers
  const smartRepetitionPresetCheckbox = document.getElementById("smartRepetitionPreset");
  const smartRepetitionCustomCheckbox = document.getElementById("smartRepetitionCustom");

  if (smartRepetitionPresetCheckbox) {
    smartRepetitionPresetCheckbox.addEventListener("change", () => {
      console.log("[SettingsPanel] Preset smart repetition changed, reloading plan");
      const activePlanId = loadActivePlan();
      const plan = getPlanById(activePlanId);
      if (plan) {
        eventBus.emit("plan:selected", {plan});
      }
    });
  }

  if (smartRepetitionCustomCheckbox) {
    smartRepetitionCustomCheckbox.addEventListener("change", () => {
      console.log("[SettingsPanel] Custom smart repetition changed, reloading plan");
      const activePlanId = loadActivePlan();
      const plan = getPlanById(activePlanId);
      if (plan) {
        eventBus.emit("plan:selected", {plan});
      }
    });
  }

  // Initialize with current active plan
  refreshSettingsPanel();

  console.log("[SettingsPanel] Initialized successfully");
}

/**
 * Refresh settings panel based on current active plan
 */
function refreshSettingsPanel() {
  const activePlanId = loadActivePlan();

  if (!activePlanId) {
    // Default to simple mode
    showSimpleSettings();
    return;
  }

  const plan = getPlanById(activePlanId);
  if (!plan) {
    showSimpleSettings();
    return;
  }

  updateSettingsPanel(plan);
}

/**
 * Update settings panel based on plan type
 * @param {Object} plan - Plan object
 */
function updateSettingsPanel(plan) {
  if (!plan) {
    showSimpleSettings();
    return;
  }

  // Determine plan mode
  if (plan.mode === "simple" || !plan.mode) {
    showSimpleSettings();
  } else if (plan.mode === "preset" || plan.isPreset) {
    showPresetSettings(plan);
  } else if (plan.mode === "custom") {
    showCustomSettings(plan);
  } else {
    showSimpleSettings();
  }
}

/**
 * Show simple settings (4 inputs)
 */
function showSimpleSettings() {
  console.log("[SettingsPanel] Showing simple settings");

  const simpleSettings = document.getElementById("simpleSettings");
  const presetSettings = document.getElementById("presetSettings");
  const customSettings = document.getElementById("customSettings");

  if (simpleSettings) simpleSettings.hidden = false;
  if (presetSettings) presetSettings.hidden = true;
  if (customSettings) customSettings.hidden = true;
}

/**
 * Show preset settings (read-only plan info + 2 inputs)
 * @param {Object} plan - Preset plan
 */
function showPresetSettings(plan) {
  console.log("[SettingsPanel] Showing preset settings for:", plan.name);

  const simpleSettings = document.getElementById("simpleSettings");
  const presetSettings = document.getElementById("presetSettings");
  const customSettings = document.getElementById("customSettings");

  if (simpleSettings) simpleSettings.hidden = true;
  if (presetSettings) presetSettings.hidden = false;
  if (customSettings) customSettings.hidden = true;

  // Update plan card content
  const nameEl = document.getElementById("presetPlanName");
  const descEl = document.getElementById("presetPlanDescription");
  const durationEl = document.getElementById("presetPlanDuration");
  const segmentsEl = document.getElementById("presetPlanSegments");

  if (nameEl) nameEl.textContent = plan.name;
  if (descEl) descEl.textContent = plan.description || "";

  const totalDuration = calculateTotalDuration(plan.segments);
  if (durationEl) durationEl.textContent = `Total Duration - ${formatTime(totalDuration)}`;
  if (segmentsEl) segmentsEl.textContent = `total - ${plan.segments.length} ${plan.segments.length === 1 ? "segment" : "segments"}`;

  // Set alert time and repetitions from plan or defaults
  const alertTimeInput = document.getElementById("alertTimePreset");
  const repetitionsInput = document.getElementById("repetitionsPreset");

  if (alertTimeInput) alertTimeInput.value = plan.alertTime || 3;
  if (repetitionsInput) repetitionsInput.value = plan.repetitions || 3;
}

/**
 * Show custom settings (editable plan info + 2 inputs)
 * @param {Object} plan - Custom plan
 */
function showCustomSettings(plan) {
  console.log("[SettingsPanel] Showing custom settings for:", plan.name);

  const simpleSettings = document.getElementById("simpleSettings");
  const presetSettings = document.getElementById("presetSettings");
  const customSettings = document.getElementById("customSettings");

  if (simpleSettings) simpleSettings.hidden = true;
  if (presetSettings) presetSettings.hidden = true;
  if (customSettings) customSettings.hidden = false;

  // Update plan card content
  const nameEl = document.getElementById("customPlanName");
  const descEl = document.getElementById("customPlanDescription");
  const durationEl = document.getElementById("customPlanDuration");
  const segmentsEl = document.getElementById("customPlanSegments");

  if (nameEl) nameEl.textContent = plan.name;
  if (descEl) descEl.textContent = plan.description || "";

  const totalDuration = calculateTotalDuration(plan.segments);
  if (durationEl) durationEl.textContent = `Total Duration - ${formatTime(totalDuration)}`;
  if (segmentsEl) segmentsEl.textContent = `total - ${plan.segments.length} ${plan.segments.length === 1 ? "segment" : "segments"}`;

  // Set alert time and repetitions from plan or defaults
  const alertTimeInput = document.getElementById("alertTimeCustom");
  const repetitionsInput = document.getElementById("repetitionsCustom");

  if (alertTimeInput) alertTimeInput.value = plan.alertTime || 3;
  if (repetitionsInput) repetitionsInput.value = plan.repetitions || 3;
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
