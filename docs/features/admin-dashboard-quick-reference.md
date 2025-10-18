# Admin Dashboard - Quick Reference Guide

## Quick Access

**URL:** `/admin`
**Password:** `123`

---

## File Locations

### JavaScript Modules

```
/src/js/admin/
├── auth.js                 # Authentication logic
├── metrics-calculator.js   # Metrics calculations
├── admin-dashboard.js      # Dashboard UI controller
└── main.js                 # Entry point
```

### HTML & CSS

```
/admin.html                 # Admin page
/src/css/admin.css         # Admin styles
```

---

## Quick Commands

### Development

```bash
# Start dev server
npm run dev

# Access admin dashboard
http://localhost:5173/admin
```

### Build

```bash
# Build for production
npm run build

# Admin page output
dist/admin.html
```

---

## Dashboard Sections

| Section         | Description                                       |
|-----------------|---------------------------------------------------|
| Overview        | Total workouts, sessions, favorites, avg duration |
| Workout Stats   | Completion rate, settings, duration               |
| Music Analytics | Top genres/moods (placeholder)                    |
| Favorites       | Count, top 5 favorited songs                      |
| Engagement      | Session duration, active days, return rate        |
| Recent Activity | Last 20 events timeline                           |
| System Info     | PWA status, analytics, storage usage              |
| Quick Actions   | Export data, PostHog link, clear cache            |

---

## Key Functions

### Authentication

```javascript
import { isAuthenticated, authenticate, logout } from './auth.js';

// Check if logged in
if (isAuthenticated()) { ... }

// Login
const success = await authenticate(password);

// Logout
logout();
```

### Metrics

```javascript
import * as metrics from './metrics-calculator.js';

// Get all metrics
const allMetrics = metrics.getAllMetrics();

// Get specific metrics
const favorites = metrics.getFavoritesCount();
const workouts = metrics.getTotalWorkouts();
const engagement = metrics.getEngagementMetrics();

// Export data
const jsonData = metrics.exportAllData();

// Clear all data
metrics.clearAllData();
```

### Dashboard

```javascript
import { initDashboard, renderDashboard, cleanup } from './admin-dashboard.js';

// Initialize dashboard
initDashboard();

// Manual refresh
renderDashboard();

// Cleanup (on page unload)
cleanup();
```

---

## Auto-Refresh

- **Interval:** 30 seconds
- **Toggle:** Automatic (stops on logout)
- **Manual:** Click refresh button

---

## Data Sources

### localStorage Keys

```javascript
'workout-timer-settings'      // User settings
'workout-timer-favorites'     // Favorite songs
'workout-timer-song-history'  // Song history
'analytics_opt_out'           // Analytics preference
```

### sessionStorage Keys

```javascript
'admin_authenticated'         // Auth status
'admin_auth_timestamp'        // Login time
```

---

## Security Notes

### Current Implementation (Development)

- Password: `123` (SHA-256 hashed)
- Client-side only validation
- Session timeout: 2 hours
- Session-only persistence

### Production Recommendations

- Implement server-side authentication
- Use JWT tokens
- Add rate limiting
- Enable 2FA
- IP whitelisting
- HTTPS only

---

## Troubleshooting

### Dashboard shows no data

**Fix:** Use the main app to generate data (play songs, add favorites)

### Can't log in

**Fix:** Check password is `123`, verify sessionStorage is enabled

### Metrics not updating

**Fix:** Click manual refresh button, check auto-refresh is running

### Export doesn't work

**Fix:** Check browser allows downloads, verify localStorage has data

---

## CSS Variables Used

```css
--color-primary             /* Primary orange */
--color-primary-gradient-start
--color-primary-gradient-end
--bg-glass                  /* Glassmorphism background */
--bg-dark-primary           /* Dark background */
--border-primary            /* Border color */
--text-primary              /* White text */
--text-secondary            /* Gray text */
--font-family-base          /* Rajdhani */
--font-family-display       /* Orbitron */
```

---

## Metrics Calculation

### Total Workouts

```javascript
// Unique days with song plays
const uniqueDates = new Set(
  history.map(song => new Date(song.playedAt).toDateString())
);
return uniqueDates.size;
```

### Completion Rate

```javascript
// Currently fixed at 85% (placeholder)
// Future: Track actual starts vs. completions
```

### Average Duration

```javascript
// Average from song durations
const totalDuration = history.reduce((sum, song) =>
  sum + (song.duration || 0), 0);
const avgSeconds = totalDuration / history.length;
return Math.round(avgSeconds / 60); // minutes
```

### Return Rate

```javascript
// Active days / total days * 100
const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
const returnRate = (uniqueDates.size / daysDiff) * 100;
```

---

## Icon Reference

Uses Phosphor Icons (https://phosphoricons.com/)

```html
<!-- Common icons used -->
<i class="ph ph-barbell"></i>          <!-- Workout -->
<i class="ph ph-heart"></i>             <!-- Favorites -->
<i class="ph ph-music-notes"></i>       <!-- Music -->
<i class="ph ph-chart-line"></i>        <!-- Analytics -->
<i class="ph ph-shield-check"></i>      <!-- Admin -->
<i class="ph ph-sign-out"></i>          <!-- Logout -->
<i class="ph ph-download-simple"></i>   <!-- Export -->
<i class="ph ph-trash"></i>             <!-- Delete -->
```

---

## Grid Layout

### Desktop (>= 1024px)

```css
grid-template-columns: repeat(3, 1fr);

/* Span options */
.col-span-2      /* 2 columns */
.col-span-full   /* All columns */
```

### Mobile (< 1024px)

```css
grid-template-columns: 1fr;  /* Single column stack */
```

---

## Export Data Format

```json
{
  "exportDate": "2025-10-18T12:00:00.000Z",
  "settings": { ... },
  "favorites": [ ... ],
  "songHistory": [ ... ],
  "metrics": { ... }
}
```

---

## Browser Console Debug

```javascript
// Enable debug mode
localStorage.setItem('debug', 'admin:*');

// Check auth status
sessionStorage.getItem('admin_authenticated');

// View all metrics
import * as metrics from './src/js/admin/metrics-calculator.js';
console.log(metrics.getAllMetrics());
```

---

## Performance Specs

- **Initial Load:** < 500ms
- **Metric Calc:** < 100ms
- **Auto-Refresh:** < 50ms overhead
- **Memory:** ~2-3MB
- **localStorage:** Typical 5-10MB quota

---

## Future Enhancements Priority

### High Priority

1. Genre/mood tracking from song metadata
2. Chart visualizations (Chart.js)
3. PostHog API integration
4. Date range filters

### Medium Priority

1. Custom event log storage
2. CSV/PDF export
3. Alert system
4. User journey mapping

### Low Priority

1. Multi-user support
2. Custom dashboards
3. A/B testing views
4. Real-time WebSocket updates

---

## Common Use Cases

### Daily Check-In

1. Navigate to `/admin`
2. Login
3. Review overview stats
4. Check recent activity
5. Monitor engagement trends

### Data Analysis

1. Export data (JSON)
2. Import to analysis tool
3. Generate custom reports

### Debugging

1. Check system info
2. Verify PWA status
3. Review localStorage usage
4. Check analytics status

### Maintenance

1. Clear old data
2. Export backup
3. Review user behavior
4. Monitor performance

---

**End of Quick Reference**
