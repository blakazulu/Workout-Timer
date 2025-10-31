# Plan Builder Popover Redesign - October 31, 2025

## Problem Statement

The plan-builder popover had poor UX when adding segments:
- Segment configuration form appeared inline, causing content to shift awkwardly
- Poor visual hierarchy with competing elements
- Content (total duration, navigation) could be pushed out of view
- No clear separation between different functional areas
- Overall cluttered appearance during segment addition

## Solution: Fixed-Layout Architecture

Redesigned the plan builder with a **three-tier fixed layout**:

### Layout Structure

```
┌─────────────────────────────────────┐
│ Header (Fixed)                      │ ← Always visible
├─────────────────────────────────────┤
│ Step Header + Add Segment Btn (Fixed)│ ← Always visible
├─────────────────────────────────────┤
│                                     │
│ Scrollable Content Area             │ ← Flexible, scrolls
│  ├─ Segment Config (when active)   │
│  └─ Segments List                   │
│                                     │
├─────────────────────────────────────┤
│ Footer (Fixed)                      │ ← Always visible
│  ├─ Total Duration Display          │
│  └─ Navigation Buttons              │
└─────────────────────────────────────┘
```

## Changes Made

### 1. HTML Structure (`plan-builder.html`)

**Before:**
```html
<div class="plan-builder-step">
  <div class="step-header">...</div>
  <div class="add-segment-section">
    <button>Add Segment</button>
    <div class="segment-config" hidden>...</div>
  </div>
  <div class="segments-list-container">...</div>
  <div class="total-duration-display">...</div>
  <div class="step-navigation">...</div>
</div>
```

**After:**
```html
<div class="plan-builder-step">
  <!-- Fixed Header -->
  <div class="step-header">...</div>

  <!-- Fixed Add Button -->
  <div class="add-segment-header">
    <button>Add Segment</button>
  </div>

  <!-- Scrollable Content -->
  <div class="plan-builder-content">
    <div class="segment-config" hidden>
      <div class="segment-config-inner">
        <div class="segment-config-header">
          <h4>Configure Segment</h4>
          <button class="config-close-btn">✕</button>
        </div>
        <!-- Form fields -->
      </div>
    </div>

    <div class="segments-list-container">
      <div class="segments-list-header">
        <h4>Your Segments</h4>
        <span class="segment-count">0 segments</span>
      </div>
      <div class="segments-list">...</div>
    </div>
  </div>

  <!-- Fixed Footer -->
  <div class="plan-builder-footer">
    <div class="total-duration-display">...</div>
    <div class="step-navigation">...</div>
  </div>
</div>
```

### 2. CSS Improvements (`plans.css`)

#### Fixed Layout Container
```css
.plan-builder-step {
  @apply flex flex-col;
  height: calc(90vh - 100px);
  max-height: 650px;
  overflow: hidden;
}
```

#### Scrollable Content Area
```css
.plan-builder-content {
  @apply flex-1 overflow-y-auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
```

#### Enhanced Segment Config
```css
.segment-config-inner {
  @apply flex flex-col gap-4;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(100, 100, 255, 0.15), rgba(255, 0, 150, 0.1));
  border: 2px solid rgba(100, 100, 255, 0.4);
  border-radius: 12px;
  box-shadow:
    0 0 30px rgba(100, 100, 255, 0.3),
    inset 0 0 40px rgba(100, 100, 255, 0.08);
}
```

#### Fixed Footer
```css
.plan-builder-footer {
  @apply shrink-0 flex flex-col gap-3;
  padding: var(--spacing-lg);
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(100, 100, 255, 0.3);
}
```

### 3. JavaScript Updates (`plan-builder.js`)

Added segment count display:

```javascript
function renderSegmentsList() {
  const countEl = document.getElementById("segmentCount");

  // Update segment count
  const count = builderState.segments.length;
  if (countEl) {
    countEl.textContent = count === 1 ? "1 segment" : `${count} segments`;
  }

  // ... rest of rendering logic
}
```

## Key Improvements

### Visual Hierarchy
1. **Clear Section Separation**: Each functional area has distinct visual boundaries
2. **Fixed Navigation**: Users always see total duration and navigation buttons
3. **Better Focus**: Segment config appears as a prominent, self-contained card
4. **Professional Header**: Config form has its own header with close button

### User Experience
1. **No Content Shifting**: Fixed layout prevents jarring movements
2. **Always Accessible**: Add Segment button always visible at the top
3. **Scroll Awareness**: Only the content area scrolls, preserving context
4. **Visual Feedback**: Segment count badge shows progress at a glance

### Design Enhancements
1. **Cyberpunk Consistency**: Enhanced neon effects and gradients
2. **Better Spacing**: Improved padding and gaps throughout
3. **Clearer Actions**: Full-width buttons with better visual weight
4. **Scanline Animation**: Added animated scanline to config form for polish

## User Flow

### Before Redesign
1. Click "Add Segment" → Form slides in
2. Content below shifts down (awkward)
3. May need to scroll to see total duration
4. Navigation buttons might be hidden
5. Cancel returns to previous state

### After Redesign
1. Click "Add Segment" → Card appears prominently in scrollable area
2. Total duration and navigation always visible
3. Config has its own close button (✕) for quick dismissal
4. Segments list section has clear header with count
5. Smooth scrolling if needed, but layout stays stable

## Technical Details

### Flexbox Layout
- **Container**: `flex flex-col` with fixed height
- **Header/Footer**: `shrink-0` to maintain size
- **Content**: `flex-1 overflow-y-auto` to fill remaining space

### Responsive Behavior
- Height adapts to viewport: `calc(90vh - 100px)`
- Maximum height prevents oversizing: `max-height: 650px`
- Mobile adjustments maintain usability

## Testing Checklist

- [ ] Click "Add Segment" → Config appears smoothly
- [ ] Add multiple segments → List scrolls properly
- [ ] Total duration always visible
- [ ] Navigation buttons always accessible
- [ ] Close config via ✕ button works
- [ ] Cancel button works
- [ ] Segment count updates correctly
- [ ] Edit segment preserves layout
- [ ] Delete segment works smoothly
- [ ] Mobile responsive (small screens)
- [ ] Tablet responsive (medium screens)
- [ ] Desktop experience (large screens)

## Files Changed

1. `src/partials/popovers/plan-builder.html` - Restructured layout
2. `src/css/components/plans.css` - Updated styles for new layout
3. `src/js/ui/plan-builder.js` - Added segment count display

## Visual Comparison

### Before
- Inline segment config
- Content shifts down when adding
- May lose sight of navigation
- Cluttered appearance

### After
- Prominent config card
- Stable, fixed layout
- Always see navigation
- Clean, organized hierarchy

## Benefits

1. **Better UX**: No hidden content, stable layout
2. **Clearer Actions**: Each area has distinct purpose
3. **Professional Look**: Enhanced visual design
4. **Easier Development**: Clear component boundaries
5. **Better Accessibility**: Fixed navigation aids keyboard users

## Future Enhancements

- [ ] Add drag-and-drop reordering for segments
- [ ] Implement segment templates/presets
- [ ] Add visual progress indicator for plan completion
- [ ] Consider collapsible segment details
- [ ] Add quick-add segment shortcuts

## Conclusion

The redesigned plan builder provides a **professional, stable, and intuitive interface** for creating workout plans. The fixed-layout architecture ensures users always have context and control, while the enhanced visual design maintains the app's cyberpunk aesthetic.
