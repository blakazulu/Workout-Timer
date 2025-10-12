# Workout Timer Pro - Design System & Style Guide

## <� Design Philosophy

**Theme:** Cyberpunk Futurism
**Aesthetic:** Neon-lit technology with retro CRT effects
**Mood:** Energetic, immersive, high-tech workout environment
**Target:** Fitness enthusiasts who appreciate bold, modern design

---

## < Color Palette

### Primary Colors

#### Cyan (Primary)

```css
--color-primary: #00ffc8
```

**Usage:** Timer display, success states, borders, primary actions, install button
**Psychology:** Energy, focus, active state
**Glow Effect:** `0 0 30px rgba(0, 255, 200, 0.8)`

#### Hot Pink (Accent)

```css
--color-accent: #ff0096
```

**Usage:** Alerts, music controls, danger states, critical warnings
**Psychology:** Urgency, attention, passion
**Glow Effect:** `0 0 30px rgba(255, 0, 150, 1)`

#### Purple (Secondary)

```css
--color-secondary: #6464ff
```

**Usage:** Rep counter, progress bars, info elements
**Psychology:** Focus, calm intensity
**Glow Effect:** `0 0 10px rgba(100, 100, 255, 0.5)`

### Background Colors

#### Deep Black

```css
--background-base: #0a0a0a
```

**Usage:** Body background, foundation layer

#### Dark Transparent Overlays

```css
--bg-glass:

rgba
(
10
,
10
,
10
,
0.8
)
--bg-glass-light:

rgba
(
10
,
10
,
10
,
0.7
)
--bg-glass-dark:

rgba
(
0
,
0
,
0
,
0.5
)
```

**Usage:** Cards, panels, settings containers with glassmorphism

### Border Colors

```css
--border-cyan:

rgba
(
0
,
255
,
200
,
0.3
)
--border-pink:

rgba
(
255
,
0
,
150
,
0.3
)
--border-purple:

rgba
(
100
,
100
,
255
,
0.2
)
```

### State Colors

**Work Mode:** Cyan (`#00ffc8`)
**Alert Mode:** Hot Pink (`#ff0096`)
**Rest Mode:** Cyan with tint
**Error State:** Hot Pink
**Success State:** Cyan

---

## =$ Typography

### Font Families

#### Display Font - Orbitron

```css
font-family:

'Orbitron'
,
'Rajdhani'
,
monospace

;
```

**Source:** Google Fonts
**Weights:** 400, 500, 600, 700, 800, 900
**Usage:**

- Timer value display (900 weight, 80px)
- Headers (700 weight, 36px)
- Music time display (600 weight, 11px)

**Characteristics:**

- Geometric, futuristic
- Wide letter spacing (4px)
- Excellent readability at large sizes
- Perfect for digital/tech aesthetic

#### Body Font - Rajdhani

```css
font-family:

'Rajdhani'
,
-apple-system, BlinkMacSystemFont,

'Segoe UI'
,
sans-serif

;
```

**Source:** Google Fonts
**Weights:** 400, 500, 600, 700
**Usage:**

- Body text and labels (500-600 weight, 14-18px)
- Settings inputs (600 weight)
- Buttons (700-800 weight)
- Rep counter (700 weight)

**Characteristics:**

- Clean, modern sans-serif
- Good readability at small sizes
- Complements Orbitron perfectly

### Font Sizes

```css
--font-size-xxs:

11
px

; /* Music time, small details */
--font-size-xs:

14
px

; /* Labels, YouTube input */
--font-size-sm:

16
px

; /* Buttons, body text */
--font-size-md:

18
px

; /* Rep counter, settings */
--font-size-lg:

36
px

; /* Headers (responsive) */
--font-size-xl:

80
px

; /* Timer value display */
```

### Font Weights

```css
--font-weight-normal:

500
; /* Body text */
--font-weight-medium:

600
; /* Emphasized text */
--font-weight-bold:

700
; /* Buttons, labels */
--font-weight-extra-bold:

800
; /* Important actions */
--font-weight-black:

900
; /* Timer display */
```

### Letter Spacing

```css
--letter-spacing:

2
px

; /* Standard spacing */
--letter-spacing-wide:

4
px

; /* Headers, buttons */
```

**Purpose:** Creates futuristic, spaced-out appearance typical of cyberpunk aesthetics

### Text Effects

#### Neon Glow (Cyan)

```css
text-shadow:

0
0
30
px

rgba
(
0
,
255
,
200
,
0.8
)
,
0
0
60
px

rgba
(
0
,
255
,
200
,
0.4
)
;
filter:

drop-shadow
(
0
4
px

8
px

rgba
(
0
,
255
,
200
,
0.3
)
)
;
```

#### Neon Glow (Pink - Alert)

```css
text-shadow:

0
0
30
px

rgba
(
255
,
0
,
150
,
1
)
,
0
0
60
px

rgba
(
255
,
0
,
150
,
0.5
)
;
filter:

drop-shadow
(
0
4
px

8
px

rgba
(
255
,
0
,
150
,
0.5
)
)
;
```

#### Gradient Text (Headers)

```css
background:

linear-gradient
(
135
deg, #00ffc8

0
%
,
#ff0096

50
%
,
#6464ff

100
%
)
;
-webkit-background-clip: text

;
-webkit-text-fill-color: transparent

;
background-clip: text

;
background-size:

200
%
200
%
;
animation: gradientFlow

4
s ease infinite

;
```

---

## =� Spacing System

### Spacing Scale

```css
--spacing-xs:

8
px

;
--spacing-sm:

10
px

;
--spacing-md:

15
px

;
--spacing-lg:

20
px

;
--spacing-xl:

30
px

;
--spacing-xxl:

40
px

;
```

### Border Radius

```css
--radius-sm:

5
px

; /* Small elements */
--radius-md:

8
px

; /* Inputs, progress bars */
--radius-lg:

10
px

; /* Buttons, sections */
--radius-xl:

15
px

; /* Cards, panels */
--radius-xxl:

20
px

; /* Timer display */
```

---

## ( Visual Effects

### 1. Animated Tech Grid

```css
background-image:

linear-gradient
(
rgba
(
0
,
255
,
200
,
0.1
)
1
px, transparent

1
px

)
,
linear-gradient
(
90
deg,

rgba
(
0
,
255
,
200
,
0.1
)
1
px, transparent

1
px

)
;
background-size:

40
px

40
px

;
animation: gridMove

30
s linear infinite

;
opacity:

0.4
;
```

**Keyframe:**

```css
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}
```

### 2. Scanlines (CRT Effect)

```css
background:

repeating-linear-gradient
(
0
deg,
transparent,
transparent

2
px,

rgba
(
0
,
255
,
200
,
0.03
)
2
px,

rgba
(
0
,
255
,
200
,
0.03
)
4
px

)
;
opacity:

0.5
;
```

### 3. Floating Neon Orbs

Three orbs with different colors, sizes, and animation timings:

**Orb 1 (Cyan):**

```css
width:

400
px

;
height:

400
px

;
background:

radial-gradient
(
circle,

rgba
(
0
,
255
,
200
,
0.5
)
,
transparent

)
;
filter:

blur
(
100
px

)
;
animation: float

20
s ease-in-out infinite

;
top:

-
100
px

;
left:

-
100
px

;
```

**Orb 2 (Pink):**

```css
width:

500
px

;
height:

500
px

;
background:

radial-gradient
(
circle,

rgba
(
255
,
0
,
150
,
0.4
)
,
transparent

)
;
filter:

blur
(
100
px

)
;
animation: float

25
s ease-in-out infinite

;
animation-delay:

7
s

;
bottom:

-
150
px

;
right:

-
150
px

;
```

**Orb 3 (Purple):**

```css
width:

350
px

;
height:

350
px

;
background:

radial-gradient
(
circle,

rgba
(
100
,
100
,
255
,
0.4
)
,
transparent

)
;
filter:

blur
(
100
px

)
;
animation: float

30
s ease-in-out infinite

;
animation-delay:

14
s

;
top:

40
%
;
right:

-
100
px

;
```

**Float Animation:**

```css
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}
```

### 4. Vignette Effect

```css
background:

radial-gradient
(
ellipse at center,
transparent

0
%
,
transparent

60
%
,
rgba
(
0
,
0
,
0
,
0.4
)
100
%
)
;
```

### 5. Shimmer Animation (Timer Display)

```css
.timer-display::before {
  content: '';
  background: linear-gradient(
          45deg,
          transparent,
          rgba(0, 255, 200, 0.1),
          transparent
  );
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
```

### 6. Border Glow Pulse

```css
.timer-display::after {
  border-radius: var(--radius-xxl);
  padding: 2px;
  background: linear-gradient(135deg, rgba(0, 255, 200, 0.5), rgba(255, 0, 150, 0.5));
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 7. Glassmorphism

```css
background:

rgba
(
10
,
10
,
10
,
0.8
)
;
backdrop-filter:

blur
(
20
px

)
;
border:

2
px solid

rgba
(
0
,
255
,
200
,
0.3
)
;
box-shadow:

0
0
40
px

rgba
(
0
,
255
,
200
,
0.2
)
,
0
8
px

32
px

rgba
(
0
,
0
,
0
,
0.6
)
,
inset

0
1
px

0
rgba
(
0
,
255
,
200
,
0.2
)
;
```

---

## <� Component Styles

### Timer Display

**Normal State (Work Mode):**

```css
background:

rgba
(
10
,
10
,
10
,
0.8
)
;
border:

2
px solid

rgba
(
0
,
255
,
200
,
0.3
)
;
box-shadow:

0
0
40
px

rgba
(
0
,
255
,
200
,
0.2
)
;
color: #00ffc8

;
```

**Alert State:**

```css
animation: pulse

0.5
s infinite

;
border-color: #ff0096

;
box-shadow:

0
0
60
px

rgba
(
255
,
0
,
150
,
0.5
)
;
color: #ff0096

;
```

**Rest State:**

```css
border-color: #00ffc8

;
background:

rgba
(
0
,
255
,
200
,
0.05
)
;
box-shadow:

0
0
40
px

rgba
(
0
,
255
,
200
,
0.3
)
;
```

**Pulse Animation:**

```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
```

### Music Controls Widget

```css
background:

rgba
(
10
,
10
,
10
,
0.8
)
;
backdrop-filter:

blur
(
15
px

)
;
border:

1
px solid

rgba
(
255
,
0
,
150
,
0.3
)
;
border-radius:

15
px

;
box-shadow:

0
0
30
px

rgba
(
255
,
0
,
150
,
0.2
)
,
0
8
px

32
px

rgba
(
0
,
0
,
0
,
0.5
)
;
```

**Components:**

- Song title in pink (#ff0096)
- Play/pause button with pink border and glow
- Progress bar with gradient fill (pink � purple)
- Time displays in purple (#6464ff)

### Buttons

**Primary Button (START):**

```css
background:

linear-gradient
(
135
deg, #00ffc8, #6464ff

)
;
color: #000

;
font-weight:

800
;
text-transform: uppercase

;
letter-spacing:

4
px

;
box-shadow:

0
4
px

15
px

rgba
(
0
,
0
,
0
,
0.3
)
;
```

**Hover:**

```css
transform:

translateY
(
-
2
px

)
;
box-shadow:

0
0
30
px

rgba
(
0
,
255
,
200
,
0.5
)
;
```

**Secondary Button (RESET):**

```css
background:

linear-gradient
(
135
deg, #ff0096, #6464ff

)
;
color: #fff

;
font-weight:

800
;
```

**Hover:**

```css
box-shadow:

0
0
30
px

rgba
(
255
,
0
,
150
,
0.5
)
;
```

**Ripple Effect:**

```css
.btn::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}
```

### Progress Bar

**Container:**

```css
height:

6
px

;
background:

rgba
(
100
,
100
,
255
,
0.2
)
;
border-radius:

3
px

;
cursor: pointer

;
```

**Fill:**

```css
background:

linear-gradient
(
90
deg, #ff0096, #6464ff

)
;
box-shadow:

0
0
10
px

rgba
(
255
,
0
,
150
,
0.5
)
;
transition: width

0.1
s linear

;
```

**Handle:**

```css
width:

14
px

;
height:

14
px

;
background: #ff0096

;
border:

2
px solid #fff

;
border-radius:

50
%
;
box-shadow:

0
0
15
px

rgba
(
255
,
0
,
150
,
0.8
)
;
opacity:

0
;
```

**Hover State:**

```css
.progress-bar-container:hover .progress-bar-handle {
  opacity: 1;
}
```

### Settings Panel

```css
background:

rgba
(
10
,
10
,
10
,
0.7
)
;
backdrop-filter:

blur
(
15
px

)
;
border:

1
px solid

rgba
(
100
,
100
,
255
,
0.2
)
;
border-radius:

15
px

;
box-shadow:

0
0
30
px

rgba
(
100
,
100
,
255
,
0.1
)
,
0
8
px

32
px

rgba
(
0
,
0
,
0
,
0.5
)
;
```

**Grid Layout:**

```css
display: grid

;
grid-template-columns:

1
fr

1
fr

;
gap:

15
px

;
```

**Input Fields:**

```css
background:

rgba
(
0
,
0
,
0
,
0.5
)
;
border:

1
px solid

rgba
(
0
,
255
,
200
,
0.2
)
;
color: #00ffc8

;
font-family:

'Rajdhani'
;
font-weight:

600
;
```

**Focus State:**

```css
border-color: #00ffc8

;
box-shadow:

0
0
20
px

rgba
(
0
,
255
,
200
,
0.3
)
;
background:

rgba
(
0
,
255
,
200
,
0.05
)
;
```

### Loading Overlay

```css
background:

rgba
(
0
,
0
,
0
,
0.95
)
;
backdrop-filter:

blur
(
10
px

)
;
```

**Spinner:**

```css
width:

60
px

;
height:

60
px

;
border:

4
px solid

rgba
(
0
,
255
,
200
,
0.2
)
;
border-top-color: #00ffc8

;
border-right-color: #ff0096

;
border-radius:

50
%
;
animation: spin

1
s linear infinite

;
box-shadow:

0
0
30
px

rgba
(
0
,
255
,
200
,
0.5
)
,
inset

0
0
20
px

rgba
(
0
,
255
,
200
,
0.2
)
;
```

### Tooltip (Popover)

```css
background:

rgba
(
0
,
0
,
0
,
0.98
)
;
border:

2
px solid #ff0096

;
border-radius:

10
px

;
box-shadow:

0
0
30
px

rgba
(
255
,
0
,
150
,
0.6
)
;
backdrop-filter:

blur
(
10
px

)
;
```

**Content:**

- Title in pink (#ff0096, 18px)
- Labels in purple (#6464ff)
- Values in cyan (#00ffc8)

---

## <� Animations & Transitions

### Timing Functions

```css
--transition-fast:

0.2
s

;
--transition-medium:

0.5
s

;
```

### Standard Easing

```css
ease-in-out /* Default for most transitions */
linear /* Grid movement, spinners */
ease-out

/* Fade-in effects */
```

### Animation Catalog

#### 1. Gradient Flow (Headers)

```css
@keyframes gradientFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Duration: 4s, infinite */
```

#### 2. Pulse (Alert State)

```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Duration: 0.5s, infinite */
```

#### 3. Pulse Glow (Warning Text)

```css
@keyframes pulseGlow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(255, 0, 150, 0.8),
    0 0 40px rgba(255, 0, 150, 0.4);
  }
  50% {
    text-shadow: 0 0 40px rgba(255, 0, 150, 1),
    0 0 80px rgba(255, 0, 150, 0.6);
  }
}

/* Duration: 1s, infinite */
```

#### 4. Spin (Loading Spinner)

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Duration: 1s, linear, infinite */
```

#### 5. Fade In Up (Container)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Duration: 0.8s, ease-out */
```

#### 6. Grid Move (Background)

```css
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}

/* Duration: 30s, linear, infinite */
```

### GPU-Accelerated Properties

**Always use these for 60fps:**

- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (when necessary)

**Avoid animating:**

- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `background-color` (use opacity instead)

---

## =� Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 400px) {
  /* Adjust spacing and font sizes */
  --spacing-lg: 15px;
  --spacing-xl: 20px;
  --font-size-lg: 28px;
}

/* Hover-capable devices */
@media (hover: hover) and (pointer: fine) {
  /* Show hover effects, hide gesture hints */
  .gesture-hint {
    display: none;
  }
}
```

### Responsive Typography

```css
.header h1 {
  font-size: clamp(24px, 8vw, 36px);
  letter-spacing: clamp(1px, 0.5vw, 4px);
}
```

### Touch-Friendly Targets

Minimum hit area: **44x44px** (Apple/Google guidelines)

---

##  Accessibility Considerations

### Color Contrast

- Cyan on black: **9.8:1** (AAA)
- Pink on black: **6.2:1** (AA)
- Purple on black: **4.8:1** (AA Large)

### Text Readability

- Minimum font size: 14px
- Line height: 1.6 for body text
- Letter spacing aids readability at small sizes

### Focus States

All interactive elements have visible focus states with increased glow:

```css
:focus-visible {
  outline: 2px solid #00ffc8;
  outline-offset: 4px;
  box-shadow: 0 0 25px rgba(0, 255, 200, 0.5);
}
```

---

## <� State-Based Styling

### Timer States

| State    | Border | Background | Text Color | Shadow      |
|----------|--------|------------|------------|-------------|
| Work     | Cyan   | Dark glass | Cyan       | Cyan glow   |
| Alert    | Pink   | Dark glass | Pink       | Pink glow   |
| Rest     | Cyan   | Cyan tint  | Cyan       | Cyan glow   |
| Complete | Purple | Dark glass | Purple     | Purple glow |

### Button States

| State    | Transform        | Shadow       | Opacity |
|----------|------------------|--------------|---------|
| Normal   | scale(1)         | Medium       | 1.0     |
| Hover    | translateY(-2px) | Large + glow | 1.0     |
| Active   | scale(0.98)      | Small        | 0.9     |
| Disabled | none             | None         | 0.5     |

---

## =� YouTube Background Styling

```css
.youtube-background {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  opacity: 0.3; /* Subtle, non-distracting */
  pointer-events: none;
  z-index: 0;
}

.youtube-background::after {
  /* Dark overlay for readability */
  background: linear-gradient(
          135deg,
          rgba(18, 18, 18, 0.7) 0%,
          rgba(26, 26, 26, 0.7) 100%
  );
  z-index: 1;
}
```

**Aspect Ratio Maintenance:**

```css
width:

100
vw

;
height:

56.25
vw

; /* 16:9 */
min-height:

100
vh

;
min-width:

177.77
vh

; /* 16:9 inverse */
```

---

## =� CSS Architecture

### File Organization

1. **variables.css** - Design tokens (colors, spacing, typography)
2. **global.css** - Body, layout, background effects
3. **components.css** - UI elements (buttons, cards, controls)
4. **animations.css** - Keyframe definitions

### Naming Convention

**BEM-inspired with utility classes:**

```css
.timer-display /* Block */
.timer-display--alert /* Modifier */
.timer-value /* Element */
.timer-value--warning /* Element modifier */
.hidden /* Utility */
.text-center

/* Utility */
```

### CSS Custom Properties Usage

All colors, spacing, and timing use CSS variables for:

- Easy theme customization
- Consistent values across components
- Dynamic updates possible via JavaScript

---

## <� Design Tokens Summary

```css
:root {
  /* Colors */
  --color-primary: #00ffc8;
  --color-accent: #ff0096;
  --color-secondary: #6464ff;

  /* Backgrounds */
  --bg-dark-primary: #0a0a0a;
  --bg-glass: rgba(10, 10, 10, 0.8);

  /* Borders */
  --border-primary: rgba(0, 255, 200, 0.3);

  /* Text */
  --text-primary: #ffffff;

  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 10px;
  --spacing-md: 15px;
  --spacing-lg: 20px;
  --spacing-xl: 30px;
  --spacing-xxl: 40px;

  /* Border Radius */
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 15px;
  --radius-xxl: 20px;

  /* Typography */
  --font-family-base: 'Rajdhani', sans-serif;
  --font-family-display: 'Orbitron', monospace;
  --font-size-xxs: 11px;
  --font-size-xs: 14px;
  --font-size-sm: 16px;
  --font-size-md: 18px;
  --font-size-lg: 36px;
  --font-size-xl: 80px;

  /* Transitions */
  --transition-fast: 0.2s;
  --transition-medium: 0.5s;

  /* Effects */
  --backdrop-blur: 10px;
}
```

---

## <� Visual Hierarchy

### Z-Index Stack

```
100    - Loading overlay
10     - Main container (UI elements)
1      - Scanlines, vignette
0      - Background grid, orbs, YouTube video
-1     - (unused)
```

### Layer Composition

1. **Background Layer** (z-index: 0)
    - Gradient base
    - Animated grid
    - Floating orbs
    - YouTube video

2. **Effect Layer** (z-index: 1)
    - Scanlines
    - Vignette

3. **Content Layer** (z-index: 10)
    - Container
    - Timer display
    - Settings panel
    - Buttons
    - Music controls

4. **Overlay Layer** (z-index: 100)
    - Loading screen
    - Toast notifications
    - Tooltips

---

## =� Best Practices

### Performance

1. Use `transform` and `opacity` for animations
2. Apply `will-change` sparingly and remove when done
3. Use `backdrop-filter` with caution (GPU intensive)
4. Limit simultaneous animations to 3-4 elements

### Consistency

1. Always use CSS variables for colors and spacing
2. Maintain 4px increment for spacing and sizing
3. Use defined border-radius values
4. Apply consistent glow effects per state

### Accessibility

1. Ensure 4.5:1 contrast minimum for body text
2. Use semantic HTML with ARIA labels
3. Provide focus indicators for all interactive elements
4. Test with screen readers

### Maintainability

1. Comment complex animations
2. Group related styles together
3. Use meaningful class names
4. Document color meanings and usage

---

**Last Updated:** 2025-10-12
**Version:** 1.0
**Status:** Production Design System
