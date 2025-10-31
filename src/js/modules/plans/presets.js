/**
 * Built-in Workout Plan Presets
 * 12 professionally designed workout plans covering various training styles
 */

import { SEGMENT_TYPES, INTENSITY_LEVELS, SOUND_CUES } from "./segment-types.js";

/**
 * Generate unique ID for preset plans
 * @param {string} name - Plan name
 * @returns {string} Preset ID
 */
function generatePresetId(name) {
  return `preset-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Calculate total duration of all segments in seconds
 * @param {Array} segments - Array of segment objects
 * @returns {number} Total duration in seconds
 */
function calculateTotalDuration(segments) {
  return segments.reduce((total, segment) => total + segment.duration, 0);
}

/**
 * All built-in workout plan presets
 */
export const WORKOUT_PRESETS = [
  // 1. BEGINNER HIIT - 15 minutes
  {
    id: generatePresetId("Beginner HIIT"),
    name: "Beginner HIIT",
    description: "Perfect introduction to high-intensity training with manageable work-to-rest ratios",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300, // 5 min
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 6 rounds of 30s work / 30s rest
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 1",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 2",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 3",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 4",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 5",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.HIIT_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.HARD,
        name: "HIIT Interval 6",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 180, // 3 min
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 2. CLASSIC HIIT - 20 minutes
  {
    id: generatePresetId("Classic HIIT"),
    name: "Classic HIIT",
    description: "Standard 40:20 intervals for efficient fat burning and cardiovascular improvement",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 8 rounds of 40s work / 20s rest
      ...Array.from({ length: 8 }, (_, i) => [
        {
          type: SEGMENT_TYPES.HIIT_WORK.id,
          duration: 40,
          intensity: INTENSITY_LEVELS.VERY_HARD,
          name: `HIIT Interval ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        {
          type: SEGMENT_TYPES.COMPLETE_REST.id,
          duration: 20,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Rest",
          soundCue: SOUND_CUES.REST_END
        }
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 180,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 3. ADVANCED HIIT - 25 minutes
  {
    id: generatePresetId("Advanced HIIT"),
    name: "Advanced HIIT",
    description: "Challenging 45:15 protocol for experienced athletes pushing performance limits",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 10 rounds of 45s work / 15s rest
      ...Array.from({ length: 10 }, (_, i) => [
        {
          type: SEGMENT_TYPES.HIIT_WORK.id,
          duration: 45,
          intensity: INTENSITY_LEVELS.VERY_HARD,
          name: `HIIT Interval ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        {
          type: SEGMENT_TYPES.COMPLETE_REST.id,
          duration: 15,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Rest",
          soundCue: SOUND_CUES.REST_END
        }
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 4. TABATA PROTOCOL - 16 minutes
  {
    id: generatePresetId("Tabata Protocol"),
    name: "Tabata Protocol",
    description: "Original Tabata method: 20s max effort / 10s rest, scientifically proven effectiveness",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 240,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 3 Tabata blocks (8 rounds each) with 1 min rest between blocks
      ...Array.from({ length: 3 }, (blockIndex) => [
        ...Array.from({ length: 8 }, (_, i) => [
          {
            type: SEGMENT_TYPES.TABATA_WORK.id,
            duration: 20,
            intensity: INTENSITY_LEVELS.MAX,
            name: `Tabata Block ${blockIndex + 1} - Round ${i + 1}`,
            soundCue: SOUND_CUES.ALERT
          },
          {
            type: SEGMENT_TYPES.COMPLETE_REST.id,
            duration: 10,
            intensity: INTENSITY_LEVELS.LIGHT,
            name: "Rest",
            soundCue: SOUND_CUES.REST_END
          }
        ]).flat(),
        ...(blockIndex < 2 ? [{
          type: SEGMENT_TYPES.ACTIVE_RECOVERY.id,
          duration: 60,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Block Recovery",
          soundCue: SOUND_CUES.NONE
        }] : [])
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 180,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 5. BOXING ROUNDS - 25 minutes
  {
    id: generatePresetId("Boxing Rounds"),
    name: "Boxing Rounds",
    description: "Traditional boxing training with 3-minute rounds and 1-minute rest periods",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 5 rounds of 3 min work / 1 min rest
      ...Array.from({ length: 5 }, (_, i) => [
        {
          type: SEGMENT_TYPES.BOXING_ROUND.id,
          duration: 180,
          intensity: INTENSITY_LEVELS.HARD,
          name: `Round ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        ...(i < 4 ? [{
          type: SEGMENT_TYPES.COMPLETE_REST.id,
          duration: 60,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Rest Between Rounds",
          soundCue: SOUND_CUES.REST_END
        }] : [])
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 180,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 6. AMRAP 20 - 25 minutes
  {
    id: generatePresetId("AMRAP 20"),
    name: "AMRAP 20",
    description: "As Many Rounds As Possible in 20 minutes - test your work capacity",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      {
        type: SEGMENT_TYPES.AMRAP_BLOCK.id,
        duration: 1200, // 20 minutes
        intensity: INTENSITY_LEVELS.HARD,
        name: "AMRAP 20",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 7. EMOM 15 - 20 minutes
  {
    id: generatePresetId("EMOM 15"),
    name: "EMOM 15",
    description: "Every Minute On the Minute for 15 rounds - pacing and consistency challenge",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 15 x 1-minute EMOM rounds
      ...Array.from({ length: 15 }, (_, i) => ({
        type: SEGMENT_TYPES.EMOM_ROUND.id,
        duration: 60,
        intensity: INTENSITY_LEVELS.VERY_HARD,
        name: `EMOM Round ${i + 1}`,
        soundCue: SOUND_CUES.ALERT
      })),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 8. CIRCUIT TRAINING - 30 minutes
  {
    id: generatePresetId("Circuit Training"),
    name: "Circuit Training",
    description: "3 full-body circuits with exercise stations and active recovery",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 3 circuits of 5 minutes each with 2 min recovery
      ...Array.from({ length: 3 }, (_, i) => [
        {
          type: SEGMENT_TYPES.CIRCUIT_ROUND.id,
          duration: 300,
          intensity: INTENSITY_LEVELS.HARD,
          name: `Circuit ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        ...(i < 2 ? [{
          type: SEGMENT_TYPES.ACTIVE_RECOVERY.id,
          duration: 120,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Circuit Recovery",
          soundCue: SOUND_CUES.NONE
        }] : [])
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 9. PYRAMID POWER - 25 minutes
  {
    id: generatePresetId("Pyramid Power"),
    name: "Pyramid Power",
    description: "Ascending then descending intervals: 20s-30s-40s-50s-40s-30s-20s",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // Ascending pyramid
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 20,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 20s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 20,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 30s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 40,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 40s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 40,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 50,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid Peak - 50s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.ACTIVE_RECOVERY.id,
        duration: 90,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Mid-Pyramid Recovery",
        soundCue: SOUND_CUES.NONE
      },
      // Descending pyramid
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 40,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 40s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 40,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 30s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COMPLETE_REST.id,
        duration: 30,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Rest",
        soundCue: SOUND_CUES.REST_END
      },
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 20,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Pyramid - 20s",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 10. QUICK BURN - 10 minutes
  {
    id: generatePresetId("Quick Burn"),
    name: "Quick Burn",
    description: "Fast and effective 10-minute Tabata session for busy schedules",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 120,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Quick Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 6 rounds of Tabata (20s/10s)
      ...Array.from({ length: 6 }, (_, i) => [
        {
          type: SEGMENT_TYPES.TABATA_WORK.id,
          duration: 20,
          intensity: INTENSITY_LEVELS.MAX,
          name: `Tabata Round ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        {
          type: SEGMENT_TYPES.COMPLETE_REST.id,
          duration: 10,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Rest",
          soundCue: SOUND_CUES.REST_END
        }
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 120,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Quick Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 11. ENDURANCE BUILDER - 35 minutes
  {
    id: generatePresetId("Endurance Builder"),
    name: "Endurance Builder",
    description: "Sustained tempo intervals with active recovery for aerobic capacity building",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // 4 rounds of 5 min tempo / 2 min active recovery
      ...Array.from({ length: 4 }, (_, i) => [
        {
          type: SEGMENT_TYPES.TEMPO.id,
          duration: 300,
          intensity: INTENSITY_LEVELS.MODERATE,
          name: `Tempo Block ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        ...(i < 3 ? [{
          type: SEGMENT_TYPES.ACTIVE_RECOVERY.id,
          duration: 120,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Active Recovery",
          soundCue: SOUND_CUES.NONE
        }] : [])
      ]).flat(),
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  },

  // 12. METCON MIX - 30 minutes
  {
    id: generatePresetId("MetCon Mix"),
    name: "MetCon Mix",
    description: "Mixed metabolic conditioning with varied work intervals and training modalities",
    mode: "preset",
    segments: [
      {
        type: SEGMENT_TYPES.WARMUP.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Warm-up",
        soundCue: SOUND_CUES.NONE
      },
      // Strength block
      {
        type: SEGMENT_TYPES.STRENGTH_SET.id,
        duration: 240,
        intensity: INTENSITY_LEVELS.VERY_HARD,
        name: "Strength Work",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.TRANSITION.id,
        duration: 60,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Transition",
        soundCue: SOUND_CUES.NONE
      },
      // Power block
      {
        type: SEGMENT_TYPES.POWER_WORK.id,
        duration: 180,
        intensity: INTENSITY_LEVELS.MAX,
        name: "Power Work",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.ACTIVE_RECOVERY.id,
        duration: 90,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Active Recovery",
        soundCue: SOUND_CUES.NONE
      },
      // HIIT block
      ...Array.from({ length: 5 }, (_, i) => [
        {
          type: SEGMENT_TYPES.HIIT_WORK.id,
          duration: 40,
          intensity: INTENSITY_LEVELS.VERY_HARD,
          name: `HIIT Round ${i + 1}`,
          soundCue: SOUND_CUES.ALERT
        },
        {
          type: SEGMENT_TYPES.COMPLETE_REST.id,
          duration: 20,
          intensity: INTENSITY_LEVELS.LIGHT,
          name: "Rest",
          soundCue: SOUND_CUES.REST_END
        }
      ]).flat(),
      // Endurance finish
      {
        type: SEGMENT_TYPES.ENDURANCE_WORK.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.MODERATE,
        name: "Endurance Finisher",
        soundCue: SOUND_CUES.ALERT
      },
      {
        type: SEGMENT_TYPES.COOLDOWN.id,
        duration: 300,
        intensity: INTENSITY_LEVELS.LIGHT,
        name: "Cool-down",
        soundCue: SOUND_CUES.FINAL_COMPLETE
      }
    ],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0,
    isPreset: true
  }
];

// Calculate and add total duration to each preset
WORKOUT_PRESETS.forEach(preset => {
  preset.duration = calculateTotalDuration(preset.segments);
});

/**
 * Get all workout presets
 * @returns {Array} Array of all preset plans
 */
export function getAllPresets() {
  return [...WORKOUT_PRESETS];
}

/**
 * Get preset plan by ID
 * @param {string} presetId - Preset ID
 * @returns {Object|null} Preset plan or null if not found
 */
export function getPresetById(presetId) {
  const preset = WORKOUT_PRESETS.find(p => p.id === presetId);
  return preset ? { ...preset } : null;
}

/**
 * Get presets by duration range
 * @param {number} minDuration - Minimum duration in seconds
 * @param {number} maxDuration - Maximum duration in seconds
 * @returns {Array} Presets within duration range
 */
export function getPresetsByDuration(minDuration, maxDuration) {
  return WORKOUT_PRESETS.filter(
    p => p.duration >= minDuration && p.duration <= maxDuration
  );
}

/**
 * Get preset names for quick lookup
 * @returns {Array<string>} Array of preset names
 */
export function getPresetNames() {
  return WORKOUT_PRESETS.map(p => p.name);
}

/**
 * Duplicate a preset as starting point for custom plan
 * @param {string} presetId - Preset ID to duplicate
 * @returns {Object|null} Duplicated plan (non-preset) or null
 */
export function duplicatePreset(presetId) {
  const preset = getPresetById(presetId);
  if (!preset) return null;

  return {
    ...preset,
    id: crypto.randomUUID(),
    name: `${preset.name} (Copy)`,
    mode: "custom",
    isPreset: false,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0
  };
}
