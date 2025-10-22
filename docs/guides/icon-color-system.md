# Icon Color System - Cyberpunk Theme

**Date:** 2025-10-21
**Status:** ✅ ACTIVE
**Related:** [SVG Icon Visibility Fix](../fixes/icons/svg-icon-visibility-fix-2025-10-21.md)

---

## Overview

The icon color system provides **automatic contextual coloring** for all SVG icons based on the cyberpunk theme. Icons
are automatically colored based on their purpose and category.

---

## Theme Colors

### Primary Colors

| Color        | Hex       | Usage                           | Examples                   |
|--------------|-----------|---------------------------------|----------------------------|
| **Cyan**     | `#00ffc8` | Timer, Success, Primary Actions | Clock, Calendar, Checkmark |
| **Hot Pink** | `#ff0096` | Music, Alerts, Favorites        | Play, Heart, Warning       |
| **Purple**   | `#6464ff` | History, Stats, Secondary       | Charts, Users, Activity    |
| **White**    | `#ffffff` | Default, Neutral                | Generic icons              |

---

## Automatic Color Classes

Icons are **automatically colored** when created using `createIconImg()` or `createIcon()`:

### Music & Playback → Hot Pink (#ff0096)

- Play, Pause, Shuffle
- Music notes, Speaker
- YouTube logo

```javascript
createIconImg('ph-play'); // Automatically pink
createIcon('ph-music-note'); // Automatically pink
```

### Timer & Time → Cyan (#00ffc8)

- Clock, Timer, Calendar
- All time-related icons

```javascript
createIconImg('ph-timer'); // Automatically cyan
createIcon('ph-calendar'); // Automatically cyan
```

### Favorites → Hot Pink (#ff0096)

- Heart, Star icons
- Bookmark icons

```javascript
createIconImg('ph-heart'); // Automatically pink
```

### History & Stats → Purple (#6464ff)

- Charts, Graphs
- Activity, Gauge
- Trends

```javascript
createIconImg('ph-chart-pie'); // Automatically purple
createIcon('ph-trend-up'); // Automatically purple
```

### Users & Profiles → Purple (#6464ff)

- User, User Group
- Profile icons

```javascript
createIconImg('ph-users'); // Automatically purple
```

---

## Manual Color Override

You can override the automatic color:

```javascript
// Override to cyan
createIconImg('ph-heart', { color: 'icon-cyan' });

// Override to purple
createIcon('ph-play', { color: 'icon-purple' });

// Keep white
createIconImg('ph-x', { color: 'icon-white' });
```

---

## Available Color Classes

Use these classes in HTML or pass to `color` option:

### Semantic Classes

```css
.icon-music      /* Hot pink - Music controls */
.icon-timer      /* Cyan - Time/timer */
.icon-favorite   /* Hot pink - Hearts/stars */
.icon-history    /* Purple - Charts/stats */
.icon-success    /* Cyan - Checkmarks/success */
.icon-alert      /* Hot pink - Warnings/alerts */
.icon-secondary  /* Purple - Users/secondary */
```

### Color Classes

```css
.icon-cyan       /* #00ffc8 - Cyan */
.icon-pink       /* #ff0096 - Hot pink */
.icon-purple     /* #6464ff - Purple */
.icon-white      /* #ffffff - White (default) */
.icon-gray       /* Dimmed white (disabled) */
```

### State Classes

```css
.icon-disabled   /* 40% opacity */
.icon-inactive   /* 40% opacity */
.icon-active     /* Enhanced cyan glow */
.icon-loading    /* Spinning animation */
```

---

## Special Icon Classes

### Specific Icons

```css
.icon-play       /* Pink */
.icon-pause      /* Pink */
.icon-shuffle    /* Pink */
.icon-clock      /* Cyan */
.icon-calendar   /* Cyan */
.icon-heart      /* Pink with special heartbeat on hover */
```

### Heartbeat Animation

The heart icon has a special animation on hover:

```css
.svg-icon.icon-heart:hover {
  /* Heartbeat animation + extra glow */
}
```

---

## Hover Effects

All colored icons have **enhanced hover effects**:

- **Scale:** 1.1x on hover
- **Glow:** Color-matched drop shadow
- **Smooth transition:** 0.3s

```css
/* Cyan icons on hover */
.icon-cyan:hover {
  filter: /* cyan color */ drop-shadow(0 0 8px rgba(0, 255, 200, 0.8));
  transform: scale(1.1);
}

/* Pink icons on hover */
.icon-pink:hover {
  filter: /* pink color */ drop-shadow(0 0 8px rgba(255, 0, 150, 0.8));
  transform: scale(1.1);
}

/* Purple icons on hover */
.icon-purple:hover {
  filter: /* purple color */ drop-shadow(0 0 8px rgba(100, 100, 255, 0.8));
  transform: scale(1.1);
}
```

---

## Usage Examples

### Basic Usage (Automatic Colors)

```javascript
import { createIconImg, createIcon } from './utils/icon-mapper.js';

// Music controls - automatically pink
const playBtn = createIconImg('ph-play', {
  className: 'btn-icon',
  alt: 'Play'
});

// Timer - automatically cyan
const clockIcon = createIcon('ph-timer', {
  size: 24,
  alt: 'Timer'
});

// Stats - automatically purple
const chartIcon = createIconImg('ph-chart-pie', {
  alt: 'Statistics'
});
```

### Manual Color Override

```javascript
// Force a play icon to be cyan instead of pink
const cyanPlay = createIconImg('ph-play', {
  color: 'icon-cyan',
  alt: 'Play'
});

// Make a heart icon purple
const purpleHeart = createIcon('ph-heart', {
  color: 'icon-purple',
  alt: 'Favorite'
});
```

### HTML with Classes

```html
<!-- Automatically colored by JavaScript -->
<img src="/svg-icons/media/play.svg" class="svg-icon icon-music" alt="Play" />

<!-- Manually set to cyan -->
<img src="/svg-icons/media/play.svg" class="svg-icon icon-cyan" alt="Play" />

<!-- Disabled state -->
<img src="/svg-icons/alert-notification/warning-circle.svg"
     class="svg-icon icon-alert icon-disabled" alt="Warning" />

<!-- Loading spinner -->
<img src="/svg-icons/mouse-and-courses/loading-01.svg"
     class="svg-icon icon-loading" alt="Loading" />
```

---

## Adding New Icon Colors

### Step 1: Add to Color Map

Edit `/src/js/utils/icon-mapper.js`:

```javascript
const ICON_COLOR_MAP = {
  // ... existing categories

  // New category - Orange for settings
  settings: ['ph-gear', 'ph-lock', 'ph-eye'],
};
```

### Step 2: Add CSS Color Class

Edit `/src/css/components.css`:

```css
/* Orange - Settings */
.svg-icon.icon-orange,
.svg-icon.icon-settings {
  filter: brightness(0) saturate(100%) invert(67%) sepia(68%) saturate(3526%)
          hue-rotate(359deg) brightness(101%) contrast(102%);
  /* Result: #ff6b00 orange */
}

/* Hover state */
.svg-icon.icon-orange:hover,
.svg-icon.icon-settings:hover {
  filter: brightness(0) saturate(100%) invert(67%) sepia(68%) saturate(3526%)
          hue-rotate(359deg) brightness(101%) contrast(102%)
          drop-shadow(0 0 8px rgba(255, 107, 0, 0.8));
  transform: scale(1.1);
}
```

### Step 3: Use the New Color

```javascript
// Automatically orange
createIconImg('ph-gear'); // Settings icons now orange

// Manual override
createIcon('ph-warning', { color: 'icon-orange' });
```

---

## CSS Filter Generator

To generate filters for specific hex colors, use:
**[CSS Filter Generator](https://codepen.io/sosuke/pen/Pjoqqp)**

1. Enter your target hex color
2. Copy the generated filter values
3. Add to `.svg-icon.icon-yourcolor` class

Example for `#00ffc8` (cyan):

```
brightness(0) saturate(100%) invert(89%) sepia(36%) saturate(2561%)
hue-rotate(102deg) brightness(104%) contrast(101%)
```

---

## Color Categories Reference

### Current Auto-Mapping

```javascript
ICON_COLOR_MAP = {
  music: [
    'ph-play', 'ph-pause', 'ph-shuffle',
    'ph-music-notes', 'ph-music-note',
    'ph-speaker-high', 'ph-youtube-logo'
  ], // → Hot Pink (#ff0096)

  timer: [
    'ph-clock-counter-clockwise', 'ph-timer',
    'ph-calendar', 'ph-calendar-blank', 'ph-calendar-check'
  ], // → Cyan (#00ffc8)

  favorite: [
    'ph-heart', 'ph-star'
  ], // → Hot Pink (#ff0096)

  history: [
    'ph-chart-pie', 'ph-chart-line', 'ph-trend-up',
    'ph-trend-down', 'ph-activity', 'ph-gauge'
  ], // → Purple (#6464ff)

  success: [
    'ph-check-circle'
  ], // → Cyan (#00ffc8)

  alert: [
    'ph-warning', 'ph-warning-circle'
  ], // → Hot Pink (#ff0096)

  secondary: [
    'ph-users', 'ph-user', 'ph-user-circle', 'ph-user-plus'
  ], // → Purple (#6464ff)
}
```

---

## Icon Size Classes

Combine color classes with size classes:

```html
<!-- Small cyan timer -->
<img src="/svg-icons/date-and-time/timer-01.svg"
     class="svg-icon icon-timer svg-icon-sm" alt="Timer" />

<!-- Large pink heart -->
<img src="/svg-icons/bookmark-favorite/favourite.svg"
     class="svg-icon icon-heart svg-icon-lg" alt="Favorite" />

<!-- Extra large purple chart -->
<img src="/svg-icons/business-and-finance/pie-chart.svg"
     class="svg-icon icon-history svg-icon-xl" alt="Statistics" />
```

Size classes:

- **Default:** `1em` (inherits font size)
- `.svg-icon-sm`: `0.875em` (14px at 16px font size)
- `.svg-icon-lg`: `1.25em` (20px at 16px font size)
- `.svg-icon-xl`: `1.5em` (24px at 16px font size)

---

## Accessibility

Icons maintain accessibility features:

```javascript
// Alt text for screen readers
createIconImg('ph-play', { alt: 'Play music' });

// Aria labels
createIcon('ph-heart', { alt: 'Add to favorites' });
```

HTML output:

```html
<img src="/svg-icons/media/play.svg"
     class="svg-icon icon-music"
     alt="Play music" />
```

---

## Performance

### Filter Performance

- CSS filters are GPU-accelerated
- Minimal performance impact
- Better than inline SVG + CSS variables approach
- Scales well with hundreds of icons

### Transitions

All icons use smooth transitions:

```css
transition: filter 0.3s ease, transform 0.2s ease;
```

---

## Browser Support

CSS filters used for coloring:

- ✅ Chrome/Edge 18+
- ✅ Firefox 35+
- ✅ Safari 9.1+
- ✅ iOS Safari 9.3+
- ✅ All modern browsers

Coverage: **97%+ of users**

---

## Troubleshooting

### Icon appears white instead of colored

**Check:**

1. Is the icon in the `ICON_COLOR_MAP`?
2. Is the icon-mapper creating it with `createIconImg()` or `createIcon()`?
3. Inspect element - does it have a color class like `icon-music`?

**Fix:**

```javascript
// Add to ICON_COLOR_MAP or use manual override
createIconImg('ph-youricon', { color: 'icon-cyan' });
```

### Icon color doesn't match theme

**Check:**

1. Is the hex color correct in CSS?
2. Did you use the CSS Filter Generator?

**Fix:**
Re-generate filter with [CSS Filter Generator](https://codepen.io/sosuke/pen/Pjoqqp)

### Hover effect not working

**Check:**

1. Does the icon have a color class?
2. Is CSS being overridden?

**Fix:**

```css
/* Ensure hover state is defined */
.svg-icon.icon-yourcolor:hover {
  filter: /* your color */ drop-shadow(0 0 8px rgba(...));
  transform: scale(1.1);
}
```

---

## Quick Reference

| Use Case              | Code                                                    | Result                       |
|-----------------------|---------------------------------------------------------|------------------------------|
| **Music Play Button** | `createIconImg('ph-play')`                              | Pink with glow on hover      |
| **Timer Icon**        | `createIcon('ph-timer')`                                | Cyan with glow on hover      |
| **Favorite Heart**    | `createIconImg('ph-heart')`                             | Pink with heartbeat on hover |
| **Chart Stats**       | `createIcon('ph-chart-pie')`                            | Purple with glow on hover    |
| **White Close**       | `createIconImg('ph-x', {color: 'icon-white'})`          | White (no auto-color)        |
| **Disabled Icon**     | `createIcon('ph-gear', {className: 'icon-disabled'})`   | 40% opacity                  |
| **Loading Spinner**   | `createIcon('ph-spinner', {className: 'icon-loading'})` | Spinning animation           |

---

## Related Documentation

- **SVG Migration:** [Phosphor Icons to SVG Migration](../migrations/Phosphor-Icons-migration-to-svg.md)
- **Visibility Fix:** [SVG Icon Visibility Fix](../fixes/icons/svg-icon-visibility-fix-2025-10-21.md)
- **Icon Mapper:** `/src/js/utils/icon-mapper.js`
- **Icon Styles:** `/src/css/components.css`
- **Color Variables:** `/src/css/variables.css`

---

**Generated:** 2025-10-21
**Last Updated:** 2025-10-21
**Version:** 1.0
