/**
 * Workout Plan Segment Type Definitions
 * Professional segment types for comprehensive workout planning
 */

/**
 * Segment type categories and their definitions
 */
export const SEGMENT_CATEGORIES = {
  PREPARATION: "preparation",
  WORK: "work",
  REST: "rest",
  ROUNDS: "rounds",
  TRAINING_SPECIFIC: "training-specific",
  COMPLETION: "completion"
};

/**
 * Intensity levels for workout segments
 */
export const INTENSITY_LEVELS = {
  LIGHT: "light",
  MODERATE: "moderate",
  HARD: "hard",
  VERY_HARD: "very-hard",
  MAX: "max"
};

/**
 * Sound cue types for segment transitions
 */
export const SOUND_CUES = {
  NONE: "none",
  ALERT: "alert",               // Final countdown warning
  COMPLETE: "complete",         // Segment completion
  REST_END: "rest-end",         // Rest period ending
  FINAL_COMPLETE: "final-complete" // Workout complete
};

/**
 * Complete segment type definitions
 * Each segment type has a category, default duration, and typical intensity
 */
export const SEGMENT_TYPES = {
  // === PREPARATION ===
  WARMUP: {
    id: "warmup",
    name: "Warm-up",
    description: "General cardiovascular warm-up",
    category: SEGMENT_CATEGORIES.PREPARATION,
    defaultDuration: 300, // 5 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "fire"
  },

  MOVEMENT_PREP: {
    id: "movement-prep",
    name: "Movement Prep",
    description: "Dynamic stretching and mobility",
    category: SEGMENT_CATEGORIES.PREPARATION,
    defaultDuration: 180, // 3 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "wellness"
  },

  ACTIVATION: {
    id: "activation",
    name: "Activation",
    description: "Muscle activation exercises",
    category: SEGMENT_CATEGORIES.PREPARATION,
    defaultDuration: 120, // 2 minutes
    defaultIntensity: INTENSITY_LEVELS.MODERATE,
    icon: "energy"
  },

  // === WORK INTERVALS ===
  HIIT_WORK: {
    id: "hiit-work",
    name: "HIIT Work",
    description: "High-intensity interval work period",
    category: SEGMENT_CATEGORIES.WORK,
    defaultDuration: 40,
    defaultIntensity: INTENSITY_LEVELS.VERY_HARD,
    icon: "rocket-01"
  },

  TABATA_WORK: {
    id: "tabata-work",
    name: "Tabata Work",
    description: "20-second max effort interval",
    category: SEGMENT_CATEGORIES.WORK,
    defaultDuration: 20,
    defaultIntensity: INTENSITY_LEVELS.MAX,
    icon: "dart"
  },

  VO2_MAX: {
    id: "vo2-max",
    name: "VO2 Max",
    description: "Maximum aerobic capacity work",
    category: SEGMENT_CATEGORIES.WORK,
    defaultDuration: 180, // 3 minutes
    defaultIntensity: INTENSITY_LEVELS.VERY_HARD,
    icon: "chart-increase"
  },

  THRESHOLD: {
    id: "threshold",
    name: "Threshold",
    description: "Lactate threshold pace",
    category: SEGMENT_CATEGORIES.WORK,
    defaultDuration: 240, // 4 minutes
    defaultIntensity: INTENSITY_LEVELS.HARD,
    icon: "chart-line-data-01"
  },

  TEMPO: {
    id: "tempo",
    name: "Tempo",
    description: "Comfortably hard sustained effort",
    category: SEGMENT_CATEGORIES.WORK,
    defaultDuration: 300, // 5 minutes
    defaultIntensity: INTENSITY_LEVELS.MODERATE,
    icon: "timer-01"
  },

  // === REST/RECOVERY ===
  COMPLETE_REST: {
    id: "complete-rest",
    name: "Complete Rest",
    description: "Full passive recovery",
    category: SEGMENT_CATEGORIES.REST,
    defaultDuration: 60,
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "pause"
  },

  ACTIVE_RECOVERY: {
    id: "active-recovery",
    name: "Active Recovery",
    description: "Light movement recovery",
    category: SEGMENT_CATEGORIES.REST,
    defaultDuration: 90,
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "smile"
  },

  TRANSITION: {
    id: "transition",
    name: "Transition",
    description: "Equipment/exercise transition time",
    category: SEGMENT_CATEGORIES.REST,
    defaultDuration: 30,
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "arrow-reload-horizontal-round"
  },

  ROUND_RECOVERY: {
    id: "round-recovery",
    name: "Round Recovery",
    description: "Auto-inserted recovery between workout rounds",
    category: SEGMENT_CATEGORIES.REST,
    defaultDuration: 30, // 30 seconds between rounds
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "smile",
    soundCue: SOUND_CUES.REST_END // Whistle when recovery ends
  },

  // === ROUNDS ===
  BOXING_ROUND: {
    id: "boxing-round",
    name: "Boxing Round",
    description: "Traditional 3-minute boxing round",
    category: SEGMENT_CATEGORIES.ROUNDS,
    defaultDuration: 180, // 3 minutes
    defaultIntensity: INTENSITY_LEVELS.HARD,
    icon: "baseball-bat"
  },

  AMRAP_BLOCK: {
    id: "amrap-block",
    name: "AMRAP Block",
    description: "As Many Rounds As Possible",
    category: SEGMENT_CATEGORIES.ROUNDS,
    defaultDuration: 600, // 10 minutes
    defaultIntensity: INTENSITY_LEVELS.HARD,
    icon: "circle-arrow-reload-01-round"
  },

  EMOM_ROUND: {
    id: "emom-round",
    name: "EMOM Round",
    description: "Every Minute On the Minute",
    category: SEGMENT_CATEGORIES.ROUNDS,
    defaultDuration: 60,
    defaultIntensity: INTENSITY_LEVELS.VERY_HARD,
    icon: "clock-01"
  },

  CIRCUIT_ROUND: {
    id: "circuit-round",
    name: "Circuit Round",
    description: "Multi-exercise circuit",
    category: SEGMENT_CATEGORIES.ROUNDS,
    defaultDuration: 300, // 5 minutes
    defaultIntensity: INTENSITY_LEVELS.HARD,
    icon: "circle"
  },

  // === TRAINING SPECIFIC ===
  STRENGTH_SET: {
    id: "strength-set",
    name: "Strength Set",
    description: "Heavy resistance training",
    category: SEGMENT_CATEGORIES.TRAINING_SPECIFIC,
    defaultDuration: 120, // 2 minutes
    defaultIntensity: INTENSITY_LEVELS.VERY_HARD,
    icon: "dumbbell-01"
  },

  POWER_WORK: {
    id: "power-work",
    name: "Power Work",
    description: "Explosive power development",
    category: SEGMENT_CATEGORIES.TRAINING_SPECIFIC,
    defaultDuration: 90,
    defaultIntensity: INTENSITY_LEVELS.MAX,
    icon: "energy"
  },

  ENDURANCE_WORK: {
    id: "endurance-work",
    name: "Endurance Work",
    description: "Sustained aerobic work",
    category: SEGMENT_CATEGORIES.TRAINING_SPECIFIC,
    defaultDuration: 900, // 15 minutes
    defaultIntensity: INTENSITY_LEVELS.MODERATE,
    icon: "car-01"
  },

  SKILL_PRACTICE: {
    id: "skill-practice",
    name: "Skill Practice",
    description: "Technical skill development",
    category: SEGMENT_CATEGORIES.TRAINING_SPECIFIC,
    defaultDuration: 600, // 10 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "dart"
  },

  // === COMPLETION ===
  COOLDOWN: {
    id: "cooldown",
    name: "Cool-down",
    description: "Gradual heart rate reduction",
    category: SEGMENT_CATEGORIES.COMPLETION,
    defaultDuration: 300, // 5 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "chart-decrease"
  },

  STATIC_STRETCH: {
    id: "static-stretch",
    name: "Static Stretch",
    description: "Post-workout static stretching",
    category: SEGMENT_CATEGORIES.COMPLETION,
    defaultDuration: 300, // 5 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "wellness"
  },

  MOBILITY_WORK: {
    id: "mobility-work",
    name: "Mobility Work",
    description: "Joint mobility and flexibility",
    category: SEGMENT_CATEGORIES.COMPLETION,
    defaultDuration: 240, // 4 minutes
    defaultIntensity: INTENSITY_LEVELS.LIGHT,
    icon: "wellness"
  }
};

/**
 * Get segment type by ID
 * @param {string} typeId - Segment type ID
 * @returns {Object|null} Segment type definition or null if not found
 */
export function getSegmentType(typeId) {
  const type = Object.values(SEGMENT_TYPES).find(t => t.id === typeId);
  return type || null;
}

/**
 * Get all segment types by category
 * @param {string} category - Category name from SEGMENT_CATEGORIES
 * @returns {Array} Array of segment types in that category
 */
export function getSegmentTypesByCategory(category) {
  return Object.values(SEGMENT_TYPES).filter(t => t.category === category);
}

/**
 * Get all segment type IDs
 * @returns {Array<string>} Array of all segment type IDs
 */
export function getAllSegmentTypeIds() {
  return Object.values(SEGMENT_TYPES).map(t => t.id);
}

/**
 * Validate segment type ID
 * @param {string} typeId - Segment type ID to validate
 * @returns {boolean} True if valid segment type
 */
export function isValidSegmentType(typeId) {
  return getAllSegmentTypeIds().includes(typeId);
}

/**
 * Get intensity level display name
 * @param {string} intensity - Intensity level constant
 * @returns {string} Human-readable intensity name
 */
export function getIntensityDisplayName(intensity) {
  const names = {
    [INTENSITY_LEVELS.LIGHT]: "Light",
    [INTENSITY_LEVELS.MODERATE]: "Moderate",
    [INTENSITY_LEVELS.HARD]: "Hard",
    [INTENSITY_LEVELS.VERY_HARD]: "Very Hard",
    [INTENSITY_LEVELS.MAX]: "Maximum"
  };
  return names[intensity] || "Unknown";
}
