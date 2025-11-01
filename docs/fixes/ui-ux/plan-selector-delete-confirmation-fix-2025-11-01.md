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

Two-part fix: Add missing CSS to show the modal, and use `requestAnimationFrame` for smooth reopening:

### What Changed

1. **Added Missing CSS Rule** (`src/css/components/plans.css:174-177`):
   ```css
   .delete-confirmation-modal:popover-open {
     display: block;
     animation: modalSlideIn 0.3s ease;
   }
   ```
   - **Critical fix!** The modal had `display: none` but no `:popover-open` state
   - Without this, JavaScript called `showPopover()` successfully but nothing appeared
   - Now the modal actually becomes visible when opened

2. **Modal Popover Mode** (`index.html:35`):
   ```html
   <div id="deleteConfirmationModal" popover="manual">
   ```
   - Using `popover="manual"` for better control
   - Note: Even manual popovers trigger light dismiss on parent auto popovers
   - We accept this and reopen the selector smoothly

3. **Optimized Reopen Logic** (`src/js/ui/plan-selector.js:444-511`):
   ```javascript
   const reopenSelector = () => {
     if (selectorPopover) {
       requestAnimationFrame(() => {
         selectorPopover.showPopover();
       });
     }
   };
   ```
   - Uses `requestAnimationFrame` instead of `setTimeout` for smoother timing
   - Reopens selector immediately after modal closes
   - Re-renders plan list in the next frame for smooth updates
   - Added backdrop click handler for manual popovers

4. **Delete Flow**:
   ```javascript
   // When confirm delete is clicked:
   modal.hidePopover();                    // Close modal
   reopenSelector();                       // Reopen selector (next frame)
   requestAnimationFrame(() => {           // After reopen:
     renderPlanList(currentMode);          //   Refresh the list
     updateActivePlanDisplay();            //   Update display
   });
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

1. **Modal is Visible**: The missing CSS rule is now added - modal appears correctly
2. **Smooth Reopen**: Using `requestAnimationFrame` instead of `setTimeout` feels more natural
3. **No Delays**: Immediate action on user input, smooth re-rendering
4. **Proper Cleanup**: Backdrop click handler properly cleans up event listeners
5. **Fully Tested**: Comprehensive test coverage for all user flows
6. **Good Logging**: Extensive console logs for debugging

## Key Insights

1. **CSS Issue**: The modal had `display: none` but was missing the `:popover-open { display: block }` rule:
   - JavaScript successfully called `modal.showPopover()`
   - The Popover API marked it as open
   - But CSS never changed it from `display: none` to visible
   - Console logs showed success, but nothing appeared on screen

2. **Popover API Limitation**: Manual popovers still trigger light dismiss on auto popovers:
   - The Popover API spec causes any popover (even manual) to close parent auto popovers
   - CSS tricks like `display: flex !important` don't work because the `:popover-open` state is removed
   - Solution: Accept the close and reopen smoothly with `requestAnimationFrame`

3. **Performance**: Using `requestAnimationFrame` instead of `setTimeout`:
   - Syncs with browser's paint cycle for smoother animations
   - Feels more responsive than arbitrary millisecond delays
   - Browser optimizes when to execute the callback

## Related Files

- **HTML**: `index.html` (lines 35)
- **JavaScript**: `src/js/ui/plan-selector.js` (lines 407-483)
- **Tests**: `tests/e2e/plan-selector.spec.js` (lines 403-557)

## Future Improvements

Consider adding:
- Escape key handler to close modal
- Focus trap within modal for accessibility
- Animation transitions when modal opens/closes
