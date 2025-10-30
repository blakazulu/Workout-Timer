# Workout Plan System Implementation

## Overview

Transform the static workout timer into a flexible plan-based system with 3 modes:

1. **Simple Mode** (current implementation) - Quick start with basic settings
2. **Built-in Plans** (10-12 preset plans) - Professional workout templates
3. **Custom Plans** - User-created workouts with unlimited segments

---

## Phase 1: Data Layer & Core Architecture

### 1.1 Create Plan Data Structures

**Files to create:**

- `src/js/modules/plans/index.js` - Main module exports
- `src/js/modules/plans/storage.js` - Plan CRUD operations
- `src/js/modules/plans/presets.js` - 10-12 built-in workout plans
- `src/js/modules/plans/segment-types.js` - Professional segment definitions

**Plan Data Model:**

```javascript
{
  id: "uuid",
    name
:
  "Classic HIIT",
    description
:
  "High-intensity interval training",
    mode
:
  "simple" | "preset" | "custom",
    segments
:
  [
    {
      type: "warmup" | "work" | "rest" | "active-recovery" | "cooldown" | "hiit-work" | "tabata-work" | etc.,
      duration: 300, // seconds
      intensity: "light" | "moderate" | "hard" | "very-hard" | "max",
      name: "Warm-up",
      soundCue: "none" | "alert" | "complete" | "rest-end" | "final-complete"
    }
  ],
    // Backward compatibility with simple mode
    duration
:
  30,
    restTime
:
  10,
    repetitions
:
  3,
    alertTime
:
  3,
    createdAt
:
  "ISO timestamp",
    lastUsed
:
  "ISO timestamp",
    usageCount
:
  0,
    isPreset
:
  false
}
```

### 1.2 Built-in Workout Presets (10-12 plans)

1. **Beginner HIIT** - 15 min (warm-up + 6x 30/30 + cool-down)
2. **Classic HIIT** - 20 min (warm-up + 8x 40/20 + cool-down)
3. **Advanced HIIT** - 25 min (warm-up + 10x 45/15 + cool-down)
4. **Tabata Protocol** - 16 min (warm-up + 3x Tabata blocks + cool-down)
5. **Boxing Rounds** - 25 min (warm-up + 5x 3min rounds/1min rest + cool-down)
6. **AMRAP 20** - 25 min (warm-up + 20min AMRAP + cool-down)
7. **EMOM 15** - 20 min (warm-up + 15x 1min EMOM + cool-down)
8. **Circuit Training** - 30 min (warm-up + 3 circuits + cool-down)
9. **Pyramid Power** - 25 min (ascending/descending intervals)
10. **Quick Burn** - 10 min (warm-up + 6x 20/10 Tabata + cool-down)
11. **Endurance Builder** - 35 min (tempo intervals with active recovery)
12. **MetCon Mix** - 30 min (mixed functional training blocks)

### 1.3 Segment Type Definitions

**Professional segment types:**

- Preparation: Warm-up, Movement Prep, Activation
- Work Intervals: HIIT Work, Tabata Work (20s), VO2 Max, Threshold, Tempo
- Rest/Recovery: Complete Rest, Active Recovery, Transition
- Rounds: Boxing Round, AMRAP Block, EMOM Round, Circuit Round
- Training Specific: Strength Set, Power Work, Endurance Work, Skill Practice
- Completion: Cool-down, Static Stretch, Mobility Work

---

## Phase 2: Storage & Data Management

### 2.1 Extend Storage Module

**Modify:** `src/js/modules/storage.js`

Add functions:

- `loadPlans()` - Get all saved plans
- `savePlan(planData)` - Save/update a plan
- `deletePlan(planId)` - Remove a plan
- `loadActivePlan()` - Get currently selected plan
- `setActivePlan(planId)` - Set active plan
- `incrementPlanUsage(planId)` - Track usage stats

**Storage keys:**

- `"workout-timer-plans"` - All user plans
- `"workout-timer-active-plan"` - Current plan ID

### 2.2 Migration Strategy

- Preserve existing simple settings as "Quick Start" plan
- Auto-create on first load if no plans exist
- Backward compatible with existing localStorage

---

## Phase 3: UI Components

### 3.1 Plan Selector Modal

**Create:** `src/partials/popovers/plan-selector.html`

**Structure:**

```html

<div class="plan-selector-popover" id="planSelectorPopover" popover>
  <header>
    <h3>Select Workout Plan</h3>
    <button popovertarget="planSelectorPopover" popovertargetaction="hide">×</button>
  </header>

  <div class="plan-modes">
    <button class="plan-mode-tab active" data-mode="simple">Simple</button>
    <button class="plan-mode-tab" data-mode="preset">Built-in Plans</button>
    <button class="plan-mode-tab" data-mode="custom">My Plans</button>
  </div>

  <div class="plan-list">
    <!-- Dynamic plan cards rendered here -->
  </div>

  <footer>
    <button id="createCustomPlan">+ Create Custom Plan</button>
  </footer>
</div>
```

### 3.2 Custom Plan Builder Modal

**Create:** `src/partials/popovers/plan-builder.html`

**Features:**

- Plan name/description inputs
- "Add Segment" button
- Segment list with drag-drop reordering
- Each segment: type dropdown, duration input, intensity selector
- "Duplicate from preset" option
- Save/Cancel buttons

### 3.3 Settings Panel Integration

**Modify:** `src/partials/features/settings-panel.html`

Add above existing inputs:

```html

<div class="active-plan-display">
  <button id="selectPlanBtn" popovertarget="planSelectorPopover">
    <span id="currentPlanName">Quick Start</span>
    <img src="/svg-icons/arrows/arrow-right-01.svg"/>
  </button>
</div>

<!-- Existing duration/rest/reps inputs below -->
```

### 3.4 Segment Editor Component

**Create:** Reusable segment editor for custom plan builder

- Type selector (dropdown with all segment types)
- Duration input (seconds or minutes)
- Intensity slider/selector
- Sound cue selector
- Remove button
- Drag handle for reordering

---

## Phase 4: UI Logic & Event Handling

### 4.1 Plan Selector Logic

**Create:** `src/js/ui/plan-selector.js`

Functions:

- `renderPlanList(mode)` - Render plans for selected mode
- `selectPlan(planId)` - Apply plan to settings
- `showPlanDetails(plan)` - Preview plan segments
- Event handlers for mode tabs, plan selection

### 4.2 Plan Builder Logic

**Create:** `src/js/ui/plan-builder.js`

Functions:

- `initPlanBuilder(planId?)` - Initialize builder (new or edit mode)
- `addSegment(type)` - Add new segment to plan
- `removeSegment(index)` - Remove segment
- `reorderSegments()` - Handle drag-drop
- `savePlan()` - Validate and save to storage
- `duplicatePreset(presetId)` - Copy preset as starting point

### 4.3 Timer Integration

**Modify:** `src/js/modules/timer.js`

Add support for segment-based execution:

- `loadPlanSegments(segments)` - Parse plan into timer sequence
- Track current segment index
- Play appropriate sound cues per segment
- Display segment name/type during workout
- Update progress indicator for multi-segment plans

---

## Phase 5: Styling

### 5.1 Plan Components CSS

**Create:** `src/css/components/plans.css`

Style:

- Plan selector modal (3-column grid for plan cards)
- Plan cards (name, description, duration, usage count)
- Mode tabs (active states)
- Plan builder modal (segment list, drag handles)
- Active plan display in settings panel
- Segment type badges/pills (color-coded by type)

### 5.2 Responsive Design

- Mobile: Single-column plan list, full-screen modals
- Desktop: Grid layout, side-by-side builder

---

## Phase 6: Analytics & Events

### 6.1 PostHog Integration

**Modify:** `src/js/core/analytics.js`

Track events:

- `plan:selected` - {planId, planName, mode}
- `plan:created` - {planName, segmentCount, duration}
- `plan:edited` - {planId}
- `plan:deleted` - {planId}
- `plan:duplicated` - {sourceId, newName}
- `workout:started` - {planId, planName, mode}
- `segment:started` - {segmentType, duration}

---

## Phase 7: Testing

### 7.1 Unit Tests

**Create:** `tests/unit/plans.test.js`

Test:

- Plan CRUD operations
- Preset plan validation
- Segment type definitions
- Storage migration
- Plan selection updates timer settings

### 7.2 E2E Tests

**Create:** `tests/e2e/plans.spec.js`

Test:

- Select built-in plan → verify timer settings
- Create custom plan → save → reload → verify persistence
- Duplicate preset → edit → save
- Delete custom plan
- Switch between modes

---

## Phase 8: Documentation

**Create:** `docs/features/workout-plan-system-implementation.md`

Document:

- Architecture overview
- Data structures
- Built-in plan specifications
- Custom plan creation flow
- Storage schema
- Testing strategy

---

## Implementation Order

1. **Phase 1 & 2** - Data layer (storage, presets, models)
2. **Phase 3.1** - Plan selector modal HTML
3. **Phase 4.1** - Plan selector logic (read-only mode selection)
4. **Phase 3.3** - Settings panel integration
5. **Phase 5** - Styling for selector
6. **Phase 3.2** - Custom plan builder HTML
7. **Phase 4.2** - Plan builder logic (create/edit)
8. **Phase 4.3** - Timer integration for segments
9. **Phase 6** - Analytics
10. **Phase 7** - Testing
11. **Phase 8** - Documentation

---

## Backward Compatibility

- Existing simple settings remain default "Quick Start" mode
- No breaking changes to current timer functionality
- localStorage keys namespaced to avoid conflicts
- Graceful fallback if plan data corrupted

---

## Future Enhancements (Out of Scope)

- Export/import plans as JSON
- Share plans via URL
- Community plan library
- Voice cues for segment transitions
- Music sync with workout segments
