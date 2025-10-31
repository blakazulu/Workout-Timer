/**
 * Workout Plans Storage Module - Plan CRUD operations
 * Manages localStorage operations for workout plans
 */

import {eventBus} from "../../core/event-bus.js";
import {getAllPresets} from "./presets.js";
import {isValidSegmentType} from "./segment-types.js";

// Storage keys
export const PLANS_STORAGE_KEY = "workout-timer-plans";
export const ACTIVE_PLAN_KEY = "workout-timer-active-plan";

// Constraints
const MAX_CUSTOM_PLANS = 50; // Prevent localStorage overflow
const MAX_PLAN_NAME_LENGTH = 100;
const MAX_PLAN_DESCRIPTION_LENGTH = 500;
const MAX_SEGMENTS_PER_PLAN = 100;

/**
 * Load all saved plans from localStorage
 * @returns {Array} Array of plan objects
 */
export function loadPlans() {
  try {
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const plans = JSON.parse(stored);

    // Validate array
    if (!Array.isArray(plans)) {
      console.error("Invalid plans data structure, resetting");
      return [];
    }

    return plans;
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
}

/**
 * Get plan by ID (checks both custom plans and presets)
 * @param {string} planId - Plan ID
 * @returns {Object|null} Plan object or null if not found
 */
export function getPlanById(planId) {
  if (!planId) return null;

  try {
    // Check custom plans first
    const customPlans = loadPlans();
    const customPlan = customPlans.find(p => p.id === planId);
    if (customPlan) {
      return {...customPlan};
    }

    // Check presets
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === planId);
    if (preset) {
      return {...preset};
    }

    return null;
  } catch (error) {
    console.error("Failed to get plan by ID:", error);
    return null;
  }
}

/**
 * Validate plan data structure
 * @param {Object} planData - Plan object to validate
 * @returns {Object} Validation result { isValid: boolean, errors: Array<string> }
 */
export function validatePlan(planData) {
  const errors = [];

  // Required fields
  if (!planData.name || typeof planData.name !== "string") {
    errors.push("Plan name is required and must be a string");
  } else if (planData.name.length > MAX_PLAN_NAME_LENGTH) {
    errors.push(`Plan name must be ${MAX_PLAN_NAME_LENGTH} characters or less`);
  }

  if (!planData.mode || !["simple", "preset", "custom"].includes(planData.mode)) {
    errors.push("Plan mode must be 'simple', 'preset', or 'custom'");
  }

  // Description validation (optional but if present must be valid)
  if (planData.description && typeof planData.description !== "string") {
    errors.push("Plan description must be a string");
  } else if (planData.description && planData.description.length > MAX_PLAN_DESCRIPTION_LENGTH) {
    errors.push(`Plan description must be ${MAX_PLAN_DESCRIPTION_LENGTH} characters or less`);
  }

  // Segments validation
  if (!Array.isArray(planData.segments)) {
    errors.push("Plan segments must be an array");
  } else {
    if (planData.segments.length === 0) {
      errors.push("Plan must have at least one segment");
    }

    if (planData.segments.length > MAX_SEGMENTS_PER_PLAN) {
      errors.push(`Plan cannot have more than ${MAX_SEGMENTS_PER_PLAN} segments`);
    }

    // Validate each segment
    planData.segments.forEach((segment, index) => {
      // Accept simplified types (prepare, warmup, work, rest, cooldown) or full segment types
      const validSimplifiedTypes = ["prepare", "warmup", "work", "rest", "cooldown"];
      const isValidType = validSimplifiedTypes.includes(segment.type) || isValidSegmentType(segment.type);

      if (!segment.type || !isValidType) {
        errors.push(`Segment ${index + 1}: Invalid segment type "${segment.type}"`);
      }

      if (typeof segment.duration !== "number" || segment.duration <= 0) {
        errors.push(`Segment ${index + 1}: Duration must be a positive number`);
      }

      if (!segment.name || typeof segment.name !== "string") {
        errors.push(`Segment ${index + 1}: Name is required and must be a string`);
      }

      // Intensity and soundCue are now optional
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Save plan to localStorage (create or update)
 * @param {Object} planData - Plan object to save
 * @returns {Object} Result { success: boolean, planId?: string, errors?: Array<string> }
 */
export function savePlan(planData) {
  try {
    // Validate plan data
    const validation = validatePlan(planData);
    if (!validation.isValid) {
      console.error("Plan validation failed:", validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    const plans = loadPlans();

    // Check if updating existing plan
    const existingIndex = plans.findIndex(p => p.id === planData.id);

    if (existingIndex !== -1) {
      // Update existing plan
      plans[existingIndex] = {
        ...planData,
        lastModified: new Date().toISOString()
      };

      console.log(`Plan updated: ${planData.name} (ID: ${planData.id})`);
    } else {
      // Create new plan

      // Check max plans limit
      if (plans.length >= MAX_CUSTOM_PLANS) {
        return {
          success: false,
          errors: [`Maximum custom plans limit (${MAX_CUSTOM_PLANS}) reached`]
        };
      }

      // Generate ID if not provided
      if (!planData.id) {
        planData.id = crypto.randomUUID();
      }

      // Add metadata
      const newPlan = {
        ...planData,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        isPreset: false
      };

      plans.unshift(newPlan);

      console.log(`Plan created: ${planData.name} (ID: ${planData.id})`);

      // Emit analytics event
      eventBus.emit("plan:created", {
        planId: planData.id,
        planName: planData.name,
        segmentCount: planData.segments.length,
        duration: calculateTotalDuration(planData.segments)
      });
    }

    // Save to localStorage
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));

    return {
      success: true,
      planId: planData.id
    };
  } catch (error) {
    console.error("Failed to save plan:", error);
    return {
      success: false,
      errors: [error.message]
    };
  }
}

/**
 * Delete plan from storage
 * @param {string} planId - Plan ID to delete
 * @returns {boolean} Success status
 */
export function deletePlan(planId) {
  try {
    if (!planId) {
      console.error("Plan ID is required for deletion");
      return false;
    }

    const plans = loadPlans();
    const initialLength = plans.length;

    const filtered = plans.filter(p => p.id !== planId);

    if (filtered.length === initialLength) {
      console.log("Plan not found in storage, nothing to delete");
      return false;
    }

    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(filtered));

    console.log(`Plan deleted: ${planId}`);

    // If deleted plan was active, clear active plan
    const activePlanId = loadActivePlan();
    if (activePlanId === planId) {
      clearActivePlan();
    }

    // Emit analytics event
    eventBus.emit("plan:deleted", {planId});

    return true;
  } catch (error) {
    console.error("Failed to delete plan:", error);
    return false;
  }
}

/**
 * Load currently active plan ID
 * @returns {string|null} Active plan ID or null
 */
export function loadActivePlan() {
  try {
    const activePlanId = localStorage.getItem(ACTIVE_PLAN_KEY);
    return activePlanId || null;
  } catch (error) {
    console.error("Failed to load active plan:", error);
    return null;
  }
}

/**
 * Set active plan
 * @param {string} planId - Plan ID to set as active
 * @returns {boolean} Success status
 */
export function setActivePlan(planId) {
  try {
    if (!planId) {
      console.error("Plan ID is required");
      return false;
    }

    // Verify plan exists
    const plan = getPlanById(planId);
    if (!plan) {
      console.error(`Plan not found: ${planId}`);
      return false;
    }

    localStorage.setItem(ACTIVE_PLAN_KEY, planId);
    console.log(`Active plan set to: ${plan.name} (${planId})`);

    // Emit analytics event
    eventBus.emit("plan:selected", {
      planId: plan.id,
      planName: plan.name,
      mode: plan.mode
    });

    return true;
  } catch (error) {
    console.error("Failed to set active plan:", error);
    return false;
  }
}

/**
 * Clear active plan selection
 * @returns {boolean} Success status
 */
export function clearActivePlan() {
  try {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
    console.log("Active plan cleared");
    return true;
  } catch (error) {
    console.error("Failed to clear active plan:", error);
    return false;
  }
}

/**
 * Increment plan usage count and update last used timestamp
 * @param {string} planId - Plan ID to update
 * @returns {boolean} Success status
 */
export function incrementPlanUsage(planId) {
  try {
    if (!planId) return false;

    const plans = loadPlans();
    const planIndex = plans.findIndex(p => p.id === planId);

    if (planIndex === -1) {
      // Plan might be a preset, don't error
      console.log("Plan is a preset, usage not tracked in custom storage");
      return false;
    }

    // Update usage metadata
    plans[planIndex].usageCount = (plans[planIndex].usageCount || 0) + 1;
    plans[planIndex].lastUsed = new Date().toISOString();

    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));

    console.log(`Plan usage incremented: ${plans[planIndex].name} (count: ${plans[planIndex].usageCount})`);

    return true;
  } catch (error) {
    console.error("Failed to increment plan usage:", error);
    return false;
  }
}

/**
 * Get most recently used plans
 * @param {number} limit - Number of plans to return
 * @returns {Array} Most recently used plans
 */
export function getRecentPlans(limit = 5) {
  try {
    const plans = loadPlans();
    return plans
      .filter(p => p.lastUsed)
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get recent plans:", error);
    return [];
  }
}

/**
 * Get most frequently used plans
 * @param {number} limit - Number of plans to return
 * @returns {Array} Most frequently used plans
 */
export function getMostUsedPlans(limit = 5) {
  try {
    const plans = loadPlans();
    return plans
      .filter(p => p.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get most used plans:", error);
    return [];
  }
}

/**
 * Clear all custom plans (does not affect presets)
 * @returns {boolean} Success status
 */
export function clearAllPlans() {
  try {
    localStorage.removeItem(PLANS_STORAGE_KEY);
    clearActivePlan();
    console.log("All custom plans cleared");
    return true;
  } catch (error) {
    console.error("Failed to clear plans:", error);
    return false;
  }
}

/**
 * Calculate total duration of all segments
 * @param {Array} segments - Array of segment objects
 * @returns {number} Total duration in seconds
 */
function calculateTotalDuration(segments) {
  if (!Array.isArray(segments)) return 0;
  return segments.reduce((total, segment) => total + (segment.duration || 0), 0);
}

/**
 * Export plan as JSON
 * @param {string} planId - Plan ID to export
 * @returns {string|null} JSON string or null if plan not found
 */
export function exportPlanAsJSON(planId) {
  try {
    const plan = getPlanById(planId);
    if (!plan) return null;

    return JSON.stringify(plan, null, 2);
  } catch (error) {
    console.error("Failed to export plan:", error);
    return null;
  }
}

/**
 * Import plan from JSON
 * @param {string} jsonString - JSON string of plan data
 * @returns {Object} Result { success: boolean, planId?: string, errors?: Array<string> }
 */
export function importPlanFromJSON(jsonString) {
  try {
    const planData = JSON.parse(jsonString);

    // Generate new ID to avoid conflicts
    planData.id = crypto.randomUUID();
    planData.createdAt = new Date().toISOString();
    planData.lastUsed = null;
    planData.usageCount = 0;
    planData.isPreset = false;
    planData.mode = "custom";

    return savePlan(planData);
  } catch (error) {
    console.error("Failed to import plan:", error);
    return {
      success: false,
      errors: [error.message]
    };
  }
}

/**
 * Create "Quick Start" plan from simple settings (backward compatibility)
 * @param {Object} settings - Simple timer settings
 * @returns {Object} Quick Start plan object
 */
export function createQuickStartPlan(settings) {
  const {duration = 30, restTime = 10, repetitions = 3, alertTime = 3} = settings;

  return {
    id: "quick-start",
    name: "Quick Start",
    description: "Classic simple timer mode - quick setup for immediate workouts",
    mode: "simple",
    segments: [
      {
        type: "hiit-work",
        duration: duration,
        intensity: "very-hard",
        name: `Work - ${duration}s`,
        soundCue: "alert"
      },
      ...(restTime > 0 ? [{
        type: "complete-rest",
        duration: restTime,
        intensity: "light",
        name: `Rest - ${restTime}s`,
        soundCue: "rest-end"
      }] : [])
    ],
    duration: duration,
    restTime: restTime,
    repetitions: repetitions,
    alertTime: alertTime,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  };
}
