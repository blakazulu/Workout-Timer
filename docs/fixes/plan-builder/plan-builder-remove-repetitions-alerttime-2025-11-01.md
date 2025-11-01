# Plan Builder - Remove Repetitions and Alert Time Fields

**Date**: 2025-11-01
**Type**: Feature Simplification
**Status**: ✅ Complete

## Overview

Simplified the custom plan creation workflow by removing the `repetitions` and `alert time` fields from Step 2 (Plan Details) of the plan builder. These fields were deemed unnecessary for custom workout plans, streamlining the user experience to focus on just plan name and description.

## Changes Made

### 1. HTML Structure (`src/partials/popovers/plan-builder.html`)

**Removed:**
- Repetitions input field and label
- Alert Time input field and label
- Form row container for these fields

**Result:**
Step 2 now only contains:
- Plan Name (required)
- Plan Description (optional)

### 2. JavaScript Logic (`src/js/ui/plan-builder.js`)

**Updated State Management:**
```javascript
// Before
planDetails: {
  name: "",
  description: "",
  repetitions: 1,
  alertTime: 3
}

// After
planDetails: {
  name: "",
  description: ""
}
```

**Modified Functions:**
- `openPlanBuilder()`: Removed initialization of repetitions and alertTime
- `populateStep2Form()`: Removed references to repetitions and alertTime input fields
- `backToStep1()`: Removed saving of repetitions and alertTime values
- `validatePlanDetails()`: Removed validation logic for repetitions and alertTime
- `handleSavePlan()`: Removed these fields from the plan data object
- Analytics tracking: Removed repetitions from the saved event

### 3. Storage Layer (`src/js/modules/plans/storage.js`)

**No changes required** - The storage layer was already flexible enough to handle plans without these fields. The `repetitions` and `alertTime` fields are still used by the "Quick Start" simple timer mode, so they remain in the `createQuickStartPlan()` function for backward compatibility.

### 4. Test Updates (`tests/e2e/plan-builder.spec.js`)

**Removed Tests:**
- Test for default values of repetitions and alert time
- Assertions checking visibility of these fields

**Updated Tests:**
- "should show Step 2 form fields" - Now only checks for name and description
- "should create a complete plan with multiple segments" - Removed assertions about repetitions value
- Fixed import statement to use `loadPlans()` instead of non-existent `getAllCustomPlans()`

## Files Modified

1. `src/partials/popovers/plan-builder.html`
2. `src/js/ui/plan-builder.js`
3. `tests/e2e/plan-builder.spec.js`

## Impact

### User Experience
- ✅ Simpler, cleaner Step 2 form
- ✅ Faster plan creation workflow
- ✅ Less cognitive load for users

### Technical
- ✅ Custom plans saved without repetitions and alertTime fields
- ✅ Backward compatibility maintained (Quick Start mode still uses these fields)
- ✅ All tests updated and passing

## Notes

- The `repetitions` and `alertTime` fields are **still used** by the simple timer mode (Quick Start)
- These fields are only removed from the **custom plan builder** workflow
- Existing custom plans with these fields will continue to work (fields are simply ignored if present)

## Testing

Run the plan builder test suite to verify:
```bash
npx playwright test tests/e2e/plan-builder.spec.js
```

Expected results:
- All plan builder tests should pass
- Step 2 form should only show name and description fields
- Plans should save successfully without repetitions/alertTime
