# Workout Plan System - Quick Reference Guide

## For Developers

### Data Layer (Phase 1-2)

**Import Plans Module:**

```javascript
import {
  // Storage
  loadPlans, savePlan, deletePlan, getPlanById,
  loadActivePlan, setActivePlan, clearActivePlan,
  incrementPlanUsage, createQuickStartPlan,

  // Presets
  getAllPresets, getPresetById, duplicatePreset,

  // Segment Types
  SEGMENT_TYPES, SEGMENT_CATEGORIES, INTENSITY_LEVELS, SOUND_CUES,
  getSegmentType, isValidSegmentType
} from "./modules/plans/index.js";
```

**Plan Object Structure:**

```javascript
{
  id: "uuid",
  name: "Plan Name",
  description: "Optional description",
  mode: "simple" | "preset" | "custom",
  segments: [
    {
      type: "hiit-work",        // See SEGMENT_TYPES
      duration: 30,             // Seconds
      intensity: "hard",        // See INTENSITY_LEVELS
      name: "HIIT Interval",
      soundCue: "alert"         // See SOUND_CUES
    }
  ],
  // Simple mode fields (backward compatibility)
  duration: 30,
  restTime: 10,
  repetitions: 3,
  alertTime: 3,
  // Metadata
  createdAt: "ISO timestamp",
  lastUsed: "ISO timestamp",
  usageCount: 0,
  isPreset: false
}
```

**Common Operations:**

```javascript
// Get all presets
const presets = getAllPresets(); // Returns 12 built-in plans

// Load user's custom plans
const customPlans = loadPlans();

// Get active plan
const activePlanId = loadActivePlan();
const plan = getPlanById(activePlanId);

// Save new plan
const result = savePlan(planData);
if (result.success) {
  console.log("Saved with ID:", result.planId);
} else {
  console.error("Validation errors:", result.errors);
}

// Select plan
setActivePlan(planId);

// Delete plan
const deleted = deletePlan(planId);

// Create Quick Start from settings
const quickStart = createQuickStartPlan({
  duration: 30,
  restTime: 10,
  repetitions: 3,
  alertTime: 3
});
```

### UI Layer (Phase 3-4)

**Import UI Modules:**

```javascript
import {initPlanSelector, updateActivePlanDisplay} from "./ui/plan-selector.js";
import {initPlanBuilder} from "./ui/plan-builder.js";
```

**Initialize (in app.js):**

```javascript
initPlanSelector();
initPlanBuilder();
loadAndApplyActivePlan();

// Listen for plan selection
eventBus.on("plan:selected", (data) => {
  const timer = getTimer();
  timer.loadPlanSegments(data.plan.segments);
});
```

**Open Plan Builder Programmatically:**

```javascript
// New plan
eventBus.emit("plan-builder:open");

// Edit existing plan
eventBus.emit("plan-builder:open", { planId: "uuid" });
```

**Trigger Plan Selector:**

```javascript
// Via HTML button
<button popovertarget="planSelectorPopover">Select Plan</button>

// Via JavaScript
document.getElementById("planSelectorPopover").showPopover();
```

### Timer Integration

**Load Segments into Timer:**

```javascript
const timer = getTimer();
const plan = getPlanById(planId);

// Load segments for execution
timer.loadPlanSegments(plan.segments);

// Start timer (will execute segments)
timer.start();
```

**Timer Segment Methods:**

```javascript
// Check current segment
const segment = timer.getCurrentSegment();
console.log(segment.name, segment.duration);

// Check if in segment mode
if (timer.isSegmentMode) {
  console.log(`Segment ${timer.currentSegmentIndex + 1}/${timer.planSegments.length}`);
}

// Clear segments (return to simple mode)
timer.clearPlanSegments();
```

**Timer Display:**

- Simple mode: "Rep X / Y"
- Segment mode: "Segment Name (X/Y)"

### Event Bus Events

**Listen for Events:**

```javascript
import {eventBus} from "./core/event-bus.js";

// Plan events
eventBus.on("plan:selected", (data) => {
  console.log("Plan selected:", data.plan.name);
});

eventBus.on("plan:saved", (data) => {
  console.log("Plan saved:", data.planId);
});

eventBus.on("plan:deleted", (data) => {
  console.log("Plan deleted:", data.planId);
});

// Segment events
eventBus.on("segment:started", (data) => {
  console.log("Segment:", data.segmentName, data.duration);
});

// Timer events
eventBus.on("timer:completed", (data) => {
  if (data.mode === "segment") {
    console.log("Completed all segments:", data.totalSegments);
  }
});
```

### Segment Types Reference

**Categories:**

- `preparation` - Warmup, Movement Prep, Activation
- `work` - HIIT Work, Tabata, VO2 Max, Threshold, Tempo
- `rest` - Complete Rest, Active Recovery, Transition
- `rounds` - Boxing, AMRAP, EMOM, Circuit
- `training-specific` - Strength, Power, Endurance, Skill
- `completion` - Cooldown, Static Stretch, Mobility

**Common Segment Types:**

```javascript
SEGMENT_TYPES.WARMUP.id           // "warmup"
SEGMENT_TYPES.HIIT_WORK.id        // "hiit-work"
SEGMENT_TYPES.TABATA_WORK.id      // "tabata-work"
SEGMENT_TYPES.COMPLETE_REST.id    // "complete-rest"
SEGMENT_TYPES.BOXING_ROUND.id     // "boxing-round"
SEGMENT_TYPES.COOLDOWN.id         // "cooldown"
```

**Intensity Levels:**

```javascript
INTENSITY_LEVELS.LIGHT      // "light"
INTENSITY_LEVELS.MODERATE   // "moderate"
INTENSITY_LEVELS.HARD       // "hard"
INTENSITY_LEVELS.VERY_HARD  // "very-hard"
INTENSITY_LEVELS.MAX        // "max"
```

**Sound Cues:**

```javascript
SOUND_CUES.NONE           // "none" - Silent
SOUND_CUES.ALERT          // "alert" - Beep (countdown)
SOUND_CUES.COMPLETE       // "complete" - Double beep
SOUND_CUES.REST_END       // "rest-end" - Whistle
SOUND_CUES.FINAL_COMPLETE // "final-complete" - Triple beep
```

### Analytics Tracking

**Track Custom Events:**

```javascript
import {analytics} from "./core/analytics.js";

// Plan events
analytics.track("plan:created", {
  planId: "uuid",
  planName: "My Workout",
  segmentCount: 5,
  duration: 1800
});

analytics.track("plan_selector:mode_switched", {
  mode: "preset"
});

// Segment events
analytics.track("segment:started", {
  segmentType: "hiit-work",
  segmentName: "Sprint",
  duration: 30,
  index: 2
});
```

### Styling Reference

**CSS Classes:**

**Plan Display:**

```css
.active-plan-display          /* Settings panel button */
.active-plan-name             /* Plan name text */
.plan-selector-arrow          /* Arrow icon */
```

**Plan Selector:**

```css
.plan-selector-popover        /* Main modal */
.plan-mode-tab                /* Mode tab button */
.plan-mode-tab.active         /* Active mode */
.plan-list                    /* Card grid container */
.plan-card                    /* Individual plan card */
.plan-card.active-plan        /* Selected plan */
.active-badge                 /* Active indicator */
```

**Plan Builder:**

```css
.plan-builder-popover         /* Main modal */
.form-group                   /* Form field wrapper */
.segment-list                 /* Segment container */
.segment-editor               /* Individual editor */
.segment-drag-handle          /* Drag handle */
.segment-actions              /* Action buttons */
.add-segment-btn              /* Add button */
.plan-total-duration          /* Duration badge */
```

**Responsive Breakpoint:**

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Testing Helpers

**Create Test Plan:**

```javascript
const testPlan = {
  id: crypto.randomUUID(),
  name: "Test Plan",
  description: "For testing",
  mode: "custom",
  segments: [
    {
      type: "warmup",
      duration: 60,
      intensity: "light",
      name: "Warm-up",
      soundCue: "none"
    },
    {
      type: "hiit-work",
      duration: 30,
      intensity: "very-hard",
      name: "Sprint",
      soundCue: "alert"
    }
  ],
  createdAt: new Date().toISOString(),
  lastUsed: null,
  usageCount: 0,
  isPreset: false
};

const result = savePlan(testPlan);
```

**Validation:**

```javascript
import {validatePlan} from "./modules/plans/index.js";

const validation = validatePlan(planData);
if (!validation.isValid) {
  console.error("Errors:", validation.errors);
}
```

**Debug Mode:**

```javascript
// Enable timer debug logging
localStorage.setItem("timer_debug", "true");
window.location.reload();

// Or in console
window.enableTimerDebug();
```

## For Users

### Creating a Custom Plan

1. Click "Active Plan" button in settings
2. Click "Create Custom Plan" button
3. Enter plan name and description
4. Optional: Select a preset to duplicate
5. Click "Add Segment" for each workout phase
6. Configure each segment:
    - Type: Choose from dropdown
    - Name: Descriptive name
    - Duration: Seconds
    - Intensity: Light → Maximum
    - Sound: When segment ends
7. Reorder segments with ↑↓ buttons
8. Remove unwanted segments with trash icon
9. Review total duration
10. Click "Save Plan"

### Selecting a Plan

1. Click "Active Plan" button
2. Switch between tabs:
    - **Simple:** Quick Start (classic mode)
    - **Built-in Plans:** 12 preset plans
    - **My Plans:** Your custom plans
3. Click plan card to select
4. Modal closes, plan name updates

### Editing a Plan

1. Go to "My Plans" tab
2. Click edit icon (gear) on plan card
3. Modify segments as needed
4. Click "Save Plan"

### Deleting a Plan

1. Go to "My Plans" tab
2. Click delete icon (trash) on plan card
3. Confirm deletion

### Using Preset Plans

**12 Built-in Plans:**

1. **Beginner HIIT** - 15 min (gentle introduction)
2. **Classic HIIT** - 20 min (40:20 intervals)
3. **Advanced HIIT** - 25 min (45:15 intervals)
4. **Tabata Protocol** - 16 min (20:10 max effort)
5. **Boxing Rounds** - 25 min (3-min rounds)
6. **AMRAP 20** - 25 min (as many rounds as possible)
7. **EMOM 15** - 20 min (every minute on minute)
8. **Circuit Training** - 30 min (3 full circuits)
9. **Pyramid Power** - 25 min (ascending/descending)
10. **Quick Burn** - 10 min (fast Tabata)
11. **Endurance Builder** - 35 min (tempo intervals)
12. **MetCon Mix** - 30 min (mixed modalities)

### During Workout

**Segment Mode:**

- Timer shows segment name
- Progress shown as (X/Y)
- Automatic transitions between segments
- Sounds play per segment settings
- Different work/rest types

**Simple Mode:**

- Shows "Rep X / Y"
- Classic timer behavior
- Same sound cues
- Manual progression

## Keyboard Shortcuts

- `Space` - Start/Pause timer
- `R` - New timer (when timer active)
- `Tab` - Navigate UI elements
- `Enter` - Activate focused button
- `Esc` - Close modal (when focused)

## Storage Keys

```javascript
localStorage.getItem("workout-timer-plans")      // Custom plans array
localStorage.getItem("workout-timer-active-plan") // Active plan ID
localStorage.getItem("cycleSettings")             // Simple mode settings
```

## File Locations

**Data Layer:**

- `/src/js/modules/plans/index.js` - Module exports
- `/src/js/modules/plans/storage.js` - CRUD operations
- `/src/js/modules/plans/presets.js` - 12 built-in plans
- `/src/js/modules/plans/segment-types.js` - Type definitions

**UI Layer:**

- `/src/js/ui/plan-selector.js` - Selection interface
- `/src/js/ui/plan-builder.js` - Creation/editing interface
- `/src/partials/popovers/plan-selector.html` - Selector HTML
- `/src/partials/popovers/plan-builder.html` - Builder HTML

**Timer:**

- `/src/js/modules/timer.js` - Execution logic (modified)

**Styling:**

- `/src/css/components/plans.css` - All plan styles

**Documentation:**

- `/docs/features/workout-plan-system-implementation.md` - Full spec
- `/docs/features/workout-plan-system-phase-3-4-implementation-summary.md` - Implementation summary
- `/docs/features/workout-plan-system-quick-reference.md` - This file
