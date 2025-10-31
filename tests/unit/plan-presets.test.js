/**
 * Unit Tests for Plan Presets Module
 * Tests built-in workout plans and preset operations
 */

import {expect, test} from "@playwright/test";

test.describe("Plan Presets Module - Built-in Plans", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import presets module
    await page.evaluate(async () => {
      const {getAllPresets, getPresetById, duplicatePreset} =
        await import("/src/js/modules/plans/presets.js");

      window.__testPresets = {
        getAllPresets,
        getPresetById,
        duplicatePreset
      };
    });
  });

  test("should have 12 built-in presets", async ({page}) => {
    const presets = await page.evaluate(() => {
      return window.__testPresets.getAllPresets();
    });

    expect(presets).toHaveLength(12);
  });

  test("all presets should have required fields", async ({page}) => {
    const validation = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => ({
        id: preset.id,
        hasName: !!preset.name,
        hasDescription: !!preset.description,
        hasMode: preset.mode === "preset",
        hasSegments: Array.isArray(preset.segments) && preset.segments.length > 0,
        isPreset: preset.isPreset === true
      }));
    });

    validation.forEach((preset, index) => {
      expect(preset.hasName, `Preset ${index} should have name`).toBe(true);
      expect(preset.hasDescription, `Preset ${index} should have description`).toBe(true);
      expect(preset.hasMode, `Preset ${index} should have mode="preset"`).toBe(true);
      expect(preset.hasSegments, `Preset ${index} should have segments`).toBe(true);
      expect(preset.isPreset, `Preset ${index} should have isPreset=true`).toBe(true);
    });
  });

  test("all segments should have valid structure", async ({page}) => {
    const segmentValidation = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const results = [];

      presets.forEach(preset => {
        preset.segments.forEach((segment, segIndex) => {
          results.push({
            presetName: preset.name,
            segmentIndex: segIndex,
            hasType: !!segment.type,
            hasDuration: typeof segment.duration === "number" && segment.duration > 0,
            hasIntensity: !!segment.intensity,
            hasName: !!segment.name,
            hasSoundCue: !!segment.soundCue
          });
        });
      });

      return results;
    });

    segmentValidation.forEach((seg) => {
      expect(seg.hasType, `${seg.presetName} segment ${seg.segmentIndex} should have type`).toBe(true);
      expect(seg.hasDuration, `${seg.presetName} segment ${seg.segmentIndex} should have valid duration`).toBe(true);
      expect(seg.hasIntensity, `${seg.presetName} segment ${seg.segmentIndex} should have intensity`).toBe(true);
      expect(seg.hasName, `${seg.presetName} segment ${seg.segmentIndex} should have name`).toBe(true);
      expect(seg.hasSoundCue, `${seg.presetName} segment ${seg.segmentIndex} should have soundCue`).toBe(true);
    });
  });

  test("presets should have unique IDs", async ({page}) => {
    const ids = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(p => p.id);
    });

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("presets should have realistic durations", async ({page}) => {
    const durations = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => {
        const totalDuration = preset.segments.reduce((sum, seg) => sum + seg.duration, 0);
        return {
          name: preset.name,
          totalSeconds: totalDuration,
          totalMinutes: Math.round(totalDuration / 60)
        };
      });
    });

    durations.forEach(({name, totalMinutes}) => {
      expect(totalMinutes, `${name} should be between 5-60 minutes`)
        .toBeGreaterThanOrEqual(5);
      expect(totalMinutes, `${name} should be between 5-60 minutes`)
        .toBeLessThanOrEqual(60);
    });
  });
});

test.describe("Plan Presets Module - Specific Presets", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {getAllPresets} = await import("/src/js/modules/plans/presets.js");
      window.__testPresets = {getAllPresets};
    });
  });

  test("should have Beginner HIIT preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name === "Beginner HIIT");
    });

    expect(preset).toBeDefined();
    expect(preset.description).toContain("15");
    expect(preset.segments.length).toBeGreaterThan(0);
  });

  test("should have Classic HIIT preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name === "Classic HIIT");
    });

    expect(preset).toBeDefined();
    expect(preset.description).toContain("20");
  });

  test("should have Tabata Protocol preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name === "Tabata Protocol");
    });

    expect(preset).toBeDefined();
    expect(preset.description).toContain("20:10");
  });

  test("should have Boxing Rounds preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name === "Boxing Rounds");
    });

    expect(preset).toBeDefined();
    expect(preset.description).toContain("round");
  });

  test("should have AMRAP preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name.includes("AMRAP"));
    });

    expect(preset).toBeDefined();
    expect(preset.description.toLowerCase()).toContain("many");
  });

  test("should have EMOM preset", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.find(p => p.name.includes("EMOM"));
    });

    expect(preset).toBeDefined();
    expect(preset.description.toLowerCase()).toContain("minute");
  });
});

test.describe("Plan Presets Module - Get Preset by ID", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {getAllPresets, getPresetById} =
        await import("/src/js/modules/plans/presets.js");

      window.__testPresets = {
        getAllPresets,
        getPresetById
      };
    });
  });

  test("should get preset by valid ID", async ({page}) => {
    const result = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const firstPreset = presets[0];
      const retrieved = window.__testPresets.getPresetById(firstPreset.id);

      return {
        original: firstPreset.name,
        retrieved: retrieved?.name,
        match: firstPreset.id === retrieved?.id
      };
    });

    expect(result.original).toBe(result.retrieved);
    expect(result.match).toBe(true);
  });

  test("should return null for invalid ID", async ({page}) => {
    const preset = await page.evaluate(() => {
      return window.__testPresets.getPresetById("non-existent-id");
    });

    expect(preset).toBeNull();
  });

  test("should return full preset object with all segments", async ({page}) => {
    const preset = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const firstPresetId = presets[0].id;
      return window.__testPresets.getPresetById(firstPresetId);
    });

    expect(preset.id).toBeDefined();
    expect(preset.name).toBeDefined();
    expect(preset.description).toBeDefined();
    expect(preset.segments).toBeDefined();
    expect(preset.segments.length).toBeGreaterThan(0);
    expect(preset.mode).toBe("preset");
    expect(preset.isPreset).toBe(true);
  });
});

test.describe("Plan Presets Module - Duplicate Preset", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {getAllPresets, duplicatePreset} =
        await import("/src/js/modules/plans/presets.js");

      window.__testPresets = {
        getAllPresets,
        duplicatePreset
      };
    });
  });

  test("should duplicate preset with new ID", async ({page}) => {
    const result = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const original = presets[0];
      const duplicate = window.__testPresets.duplicatePreset(original.id);

      return {
        originalId: original.id,
        duplicateId: duplicate?.id,
        idsAreDifferent: original.id !== duplicate?.id
      };
    });

    expect(result.duplicateId).toBeDefined();
    expect(result.idsAreDifferent).toBe(true);
  });

  test("should copy all segments from original", async ({page}) => {
    const result = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const original = presets[0];
      const duplicate = window.__testPresets.duplicatePreset(original.id);

      return {
        originalSegmentCount: original.segments.length,
        duplicateSegmentCount: duplicate?.segments.length,
        firstSegmentMatches: original.segments[0].type === duplicate?.segments[0].type
      };
    });

    expect(result.duplicateSegmentCount).toBe(result.originalSegmentCount);
    expect(result.firstSegmentMatches).toBe(true);
  });

  test("should mark duplicate as custom mode, not preset", async ({page}) => {
    const duplicate = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const original = presets[0];
      return window.__testPresets.duplicatePreset(original.id);
    });

    expect(duplicate.mode).toBe("custom");
    expect(duplicate.isPreset).toBe(false);
  });

  test("should update name to indicate it's a copy", async ({page}) => {
    const result = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const original = presets[0];
      const duplicate = window.__testPresets.duplicatePreset(original.id);

      return {
        originalName: original.name,
        duplicateName: duplicate?.name,
        hasCopyIndicator: duplicate?.name.includes("Copy of") || duplicate?.name.includes("(Copy)")
      };
    });

    expect(result.hasCopyIndicator).toBe(true);
  });

  test("should reset metadata for duplicate", async ({page}) => {
    const duplicate = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return window.__testPresets.duplicatePreset(presets[0].id);
    });

    expect(duplicate.createdAt).toBeDefined();
    expect(duplicate.lastUsed).toBeNull();
    expect(duplicate.usageCount).toBe(0);
  });

  test("should return null for invalid preset ID", async ({page}) => {
    const duplicate = await page.evaluate(() => {
      return window.__testPresets.duplicatePreset("non-existent-id");
    });

    expect(duplicate).toBeNull();
  });

  test("duplicated segments should be independent copies", async ({page}) => {
    const result = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const original = presets[0];
      const duplicate = window.__testPresets.duplicatePreset(original.id);

      // Modify duplicate segment
      duplicate.segments[0].name = "MODIFIED";

      // Check original wasn't affected
      const originalUnchanged = original.segments[0].name !== "MODIFIED";

      return {
        originalName: original.segments[0].name,
        duplicateName: duplicate.segments[0].name,
        isIndependent: originalUnchanged
      };
    });

    expect(result.isIndependent).toBe(true);
    expect(result.duplicateName).toBe("MODIFIED");
  });
});

test.describe("Plan Presets Module - Preset Characteristics", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const {getAllPresets} = await import("/src/js/modules/plans/presets.js");
      window.__testPresets = {getAllPresets};
    });
  });

  test("presets should have appropriate warmup segments", async ({page}) => {
    const warmupInfo = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => {
        const warmupSegments = preset.segments.filter(s =>
          s.type === "warmup" || s.type === "movement-prep" || s.type === "activation"
        );
        return {
          name: preset.name,
          hasWarmup: warmupSegments.length > 0,
          warmupCount: warmupSegments.length
        };
      });
    });

    // Most presets should have warmup
    const presetsWithWarmup = warmupInfo.filter(p => p.hasWarmup).length;
    expect(presetsWithWarmup).toBeGreaterThan(warmupInfo.length / 2);
  });

  test("presets should have appropriate cooldown segments", async ({page}) => {
    const cooldownInfo = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => {
        const cooldownSegments = preset.segments.filter(s =>
          s.type === "cooldown" || s.type === "static-stretch" || s.type === "mobility-work"
        );
        return {
          name: preset.name,
          hasCooldown: cooldownSegments.length > 0,
          cooldownCount: cooldownSegments.length
        };
      });
    });

    // Most presets should have cooldown
    const presetsWithCooldown = cooldownInfo.filter(p => p.hasCooldown).length;
    expect(presetsWithCooldown).toBeGreaterThan(cooldownInfo.length / 2);
  });

  test("presets should use varied intensity levels", async ({page}) => {
    const intensityInfo = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => {
        const intensities = new Set(preset.segments.map(s => s.intensity));
        return {
          name: preset.name,
          uniqueIntensities: intensities.size,
          hasVariedIntensity: intensities.size > 1
        };
      });
    });

    // Most presets should vary intensity
    const presetsWithVariedIntensity = intensityInfo.filter(p => p.hasVariedIntensity).length;
    expect(presetsWithVariedIntensity).toBeGreaterThan(intensityInfo.length / 2);
  });

  test("presets should use varied sound cues", async ({page}) => {
    const soundInfo = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      return presets.map(preset => {
        const sounds = new Set(preset.segments.map(s => s.soundCue));
        return {
          name: preset.name,
          uniqueSounds: sounds.size,
          usesAlert: preset.segments.some(s => s.soundCue === "alert"),
          usesComplete: preset.segments.some(s => s.soundCue === "complete")
        };
      });
    });

    // Most presets should use sound cues
    const presetsWithSounds = soundInfo.filter(p => p.usesAlert || p.usesComplete).length;
    expect(presetsWithSounds).toBeGreaterThan(soundInfo.length / 2);
  });

  test("Tabata preset should have correct 20:10 timing", async ({page}) => {
    const tabataCheck = await page.evaluate(() => {
      const presets = window.__testPresets.getAllPresets();
      const tabata = presets.find(p => p.name === "Tabata Protocol");

      if (!tabata) return null;

      // Find work and rest segments
      const workSegments = tabata.segments.filter(s =>
        s.type === "tabata-work" || s.name.toLowerCase().includes("work")
      );
      const restSegments = tabata.segments.filter(s =>
        s.type === "complete-rest" || s.name.toLowerCase().includes("rest")
      );

      return {
        hasCorrectWorkTime: workSegments.some(s => s.duration === 20),
        hasCorrectRestTime: restSegments.some(s => s.duration === 10)
      };
    });

    if (tabataCheck) {
      expect(tabataCheck.hasCorrectWorkTime).toBe(true);
      expect(tabataCheck.hasCorrectRestTime).toBe(true);
    }
  });
});
