# Plan Builder Absolute Overlay - Final Fix - October 31, 2025

## Issue
The segment configuration overlay wasn't showing when "Add Segment" was clicked due to CSS display property conflict with the `hidden` attribute.

## Root Cause
The `.segment-config-overlay` had `display: flex` set unconditionally, which conflicted with the HTML `hidden` attribute that applies `display: none`.

## Solution

### CSS Fix
Added explicit display rules to properly handle the `hidden` attribute:

```css
/* Segment Configuration Overlay (Absolute Positioned) */
.segment-config-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  align-items: center;        /* Removed display: flex from here */
  justify-content: center;
  padding: var(--spacing-lg);
  animation: overlayFadeIn 0.3s ease;
}

/* Hide when hidden attribute is present */
.segment-config-overlay[hidden] {
  display: none;
}

/* Show as flex when hidden attribute is removed */
.segment-config-overlay:not([hidden]) {
  display: flex;
}
```

## How It Works

### State 1: Hidden (Default)
```html
<div id="segmentConfig" class="segment-config-overlay" hidden>
```
- `[hidden]` selector applies `display: none`
- Overlay is not visible
- Does not take up space

### State 2: Visible
```html
<div id="segmentConfig" class="segment-config-overlay">
```
- `hidden` attribute removed by JavaScript
- `:not([hidden])` selector applies `display: flex`
- Overlay becomes visible
- Flexbox centers the card

## JavaScript Interaction

The JavaScript removes/adds the `hidden` attribute:

```javascript
// Show overlay
function showSegmentConfig() {
  configEl.hidden = false;  // Removes hidden attribute
  // CSS applies display: flex
}

// Hide overlay
function hideSegmentConfig() {
  configEl.hidden = true;   // Adds hidden attribute back
  // CSS applies display: none
}
```

## Visual Result

### When "Add Segment" is clicked:
1. ✅ Dark backdrop fades in (80% black + blur)
2. ✅ Configuration card slides up from center
3. ✅ Segments list stays in place (no layout shift)
4. ✅ Total duration and navigation remain visible

### Closing options:
- Click dark backdrop area
- Click ✕ close button
- Complete the form
- (Future: ESC key)

## Testing
- [x] Click "Add Segment" → Overlay appears
- [x] Backdrop dims background
- [x] Card is centered
- [x] No layout shift
- [x] Click backdrop → Closes
- [x] Click ✕ → Closes
- [x] Segments stay in position

## Files Changed
- `src/css/components/plans.css` - Fixed display property handling

## Dev Server
Running at: http://localhost:4200/

Test the fix:
1. Open the app
2. Navigate to workout plans
3. Click "Create Custom Plan"
4. Click "Add Segment" button
5. Observe smooth overlay animation with no layout shift

## Conclusion
The overlay now works perfectly! The key was properly handling the `hidden` attribute with CSS specificity to allow JavaScript to toggle visibility without conflicts.
