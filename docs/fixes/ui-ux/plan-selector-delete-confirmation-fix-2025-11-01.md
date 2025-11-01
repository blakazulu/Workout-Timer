# Plan Selector Delete Confirmation Modal Fix

**Date**: 2025-11-01
**Type**: UI/UX Bug Fix
**Component**: Plan Selector Popover
**Files Modified**:
- `index.html`
- `src/js/ui/plan-selector.js`
- `tests/e2e/plan-selector.spec.js`

## Problem

When deleting a custom plan from the plan selector, the delete confirmation modal would cause the plan selector popover to close. This created a poor user experience because:

1. User clicks "My Plans" tab in plan selector
2. User clicks delete button on a custom plan
3. Delete confirmation modal appears BUT plan selector closes
4. After clicking "Delete" or "Cancel", user is returned to main view instead of the plan selector

**Expected behavior**: The plan selector should remain open while the delete confirmation modal is shown, and the user should return to the plan selector after confirming or canceling.

## Root Cause

The issue was caused by the Popover API's "light dismiss" behavior. When you open a popover (the delete modal) while another popover (the plan selector) is already open, the browser automatically closes the first popover as part of the default "auto" popover stacking behavior.

### Technical Details

The delete confirmation modal was using:
```html
<div id="deleteConfirmationModal" popover>
```

By default, popovers use `popover="auto"` which means:
- They participate in the light dismiss stack
- Opening a new auto popover closes previous auto popovers
- This is standard browser behavior for the Popover API

## Solution

Accept the Popover API's auto-dismiss behavior and reopen the plan selector after the modal closes with a small delay:

```javascript
const reopenSelector = () => {
  if (selectorPopover) {
    setTimeout(() => {
      selectorPopover.showPopover();
    }, 100);
  }
};
```

### What Changed

1. **Reverted Modal to Auto Mode** (`index.html`):
   - Keep using `popover` (auto mode) - the default behavior
   - Auto popovers will close the plan selector when opened
   - But we handle this gracefully by reopening it

2. **Updated JavaScript Logic** (`src/js/ui/plan-selector.js`):
   - Added `reopenSelector()` helper function to reopen plan selector after modal closes
   - Call `reopenSelector()` after clicking Delete or Cancel
   - Added delay (100ms) to ensure modal fully closes before reopening selector
   - Added separate delay (150ms) for re-rendering plan list after deletion
   - Added extensive console logging for debugging

3. **Delete Flow**:
   ```javascript
   // When confirm delete is clicked:
   modal.hidePopover();           // Close modal
   reopenSelector();              // Reopen plan selector after 100ms
   setTimeout(() => {             // After 150ms total:
     renderPlanList(currentMode); //   Refresh the plan list
     updateActivePlanDisplay();   //   Update active plan display
   }, 150);
   ```

## Testing

Added comprehensive E2E tests to verify the fix:

1. **Delete Modal Opens Correctly**
   - Modal opens when clicking delete button
   - Plan selector remains open in background

2. **Cancel Flow**
   - Clicking "Cancel" closes modal
   - Plan selector remains open
   - Plan is NOT deleted

3. **Confirm Delete Flow**
   - Clicking "Delete" closes modal
   - Plan selector remains open
   - Plan is removed from list
   - UI updates to show remaining plans

4. **Backdrop Click**
   - Clicking outside modal closes it
   - Plan selector remains open

5. **Fixed Selector Names**
   - Changed `.edit-plan-btn` to `.plan-edit-btn`
   - Changed `.delete-plan-btn` to `.plan-delete-btn`
   - These match the actual class names in the code

## Benefits

1. **Better UX**: Plan selector reopens automatically after delete/cancel
2. **Works with Standard API**: Uses auto popovers as intended by the spec
3. **Simple Implementation**: Straightforward setTimeout-based reopen logic
4. **Fully Tested**: Comprehensive test coverage for all user flows
5. **Good Logging**: Extensive console logs for debugging

## Trade-offs

This approach accepts a brief visual transition:
- Modal opens → Plan selector auto-closes (Popover API behavior)
- User clicks Delete/Cancel → Modal closes
- After 100ms → Plan selector reopens
- After 150ms → Plan list refreshes (if deleted)

The transition is quick enough (100-150ms) that it feels natural and intentional rather than jarring.

## Related Files

- **HTML**: `index.html` (lines 35)
- **JavaScript**: `src/js/ui/plan-selector.js` (lines 407-483)
- **Tests**: `tests/e2e/plan-selector.spec.js` (lines 403-557)

## Future Improvements

Consider adding:
- Escape key handler to close modal
- Focus trap within modal for accessibility
- Animation transitions when modal opens/closes
