/**
 * Workout Plans Module - Main entry point
 * Re-exports all plans functionality from submodules
 */

// Storage operations (CRUD)
export {
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
  exportPlanAsJSON,
  importPlanFromJSON,
  createQuickStartPlan,
  PLANS_STORAGE_KEY,
  ACTIVE_PLAN_KEY
} from "./storage.js";

// Preset plans
export {
  getAllPresets,
  getPresetById,
  getPresetsByDuration,
  getPresetNames,
  duplicatePreset,
  WORKOUT_PRESETS
} from "./presets.js";

// Segment type definitions
export {
  SEGMENT_TYPES,
  SEGMENT_CATEGORIES,
  INTENSITY_LEVELS,
  SOUND_CUES,
  getSegmentType,
  getSegmentTypesByCategory,
  getAllSegmentTypeIds,
  isValidSegmentType,
  getIntensityDisplayName
} from "./segment-types.js";
