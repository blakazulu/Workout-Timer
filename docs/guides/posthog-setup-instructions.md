# PostHog Admin Dashboard Setup Instructions

**Goal:** Display real PostHog analytics data in your admin dashboard (no localStorage, client-side)

---

## Step 1: Get Your PostHog API Key

1. Go to **PostHog Dashboard**: https://app.posthog.com
2. Click your profile (bottom left) → **Personal API Keys**
3. Click **+ Create Key**
4. Name it: `Admin Dashboard`
5. Permissions: Check **Read** (you only need read access)
6. Click **Create Key**
7. **COPY THE KEY** - it starts with `phx_...`

⚠️ **Important:** Never commit this key to git or expose it in client code!

---

## Step 2: Add API Key to Netlify

### Option A: Netlify UI (Recommended)

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Key: `POSTHOG_PERSONAL_API_KEY`
6. Value: Paste your `phx_...` key
7. Click **Save**

### Option B: Netlify CLI

```bash
netlify env:set POSTHOG_PERSONAL_API_KEY "phx_your_key_here"
```

### Option C: Local Development (.env)

For testing locally, create `.env`:

```bash
POSTHOG_PERSONAL_API_KEY=phx_your_key_here
```

⚠️ **Add `.env` to `.gitignore`!**

---

## Step 3: Verify Files Are Created

You should now have these files:

```
workout-timer-pro/
├── netlify/
│   └── functions/
│       └── posthog-proxy.js         ✅ Created
├── src/
│   └── js/
│       └── admin/
│           ├── posthog-client.js    ✅ Created
│           └── posthog-data.js      ✅ Existing
└── docs/
    └── guides/
        └── posthog-complete-guide.md ✅ Created
```

---

## Step 4: Test the Proxy Function

### Local Test (Optional)

If you want to test locally before deploying:

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Run local dev server:

```bash
netlify dev
```

3. Your admin dashboard will be at: http://localhost:8888/admin.html

4. The proxy will be at: http://localhost:8888/.netlify/functions/posthog-proxy

### Production Test

1. Deploy your site to Netlify
2. Open browser console on admin dashboard
3. Run this test:

```javascript
// Test query
const query = {
  kind: 'TrendsQuery',
  series: [{ event: 'workout_started', math: 'total' }],
  interval: 'day',
  dateRange: { date_from: '-7d' }
};

// Test fetch
fetch('/.netlify/functions/posthog-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
})
.then(r => r.json())
.then(data => console.log('PostHog Data:', data))
.catch(err => console.error('Error:', err));
```

You should see real workout data in the console!

---

## Step 5: Update Admin Dashboard to Use PostHog

Now update your admin dashboard JavaScript to use the new PostHog client:

```javascript
// src/js/admin/admin-dashboard.js

import * as posthogClient from './posthog-client.js';

export async function initDashboard() {
  try {
    // Check if proxy is working
    const isHealthy = await posthogClient.checkProxyHealth();
    if (!isHealthy) {
      console.error('PostHog proxy not available');
      showPostHogError();
      return;
    }

    // Load all dashboard data from PostHog
    const dashboardData = await posthogClient.getDashboardData();

    // Update UI with real data
    updateMetricsCards(dashboardData.metrics);
    updateWorkoutChart(dashboardData.charts.workouts);
    updateMusicChart(dashboardData.charts.music);
    updateUserChart(dashboardData.charts.users);
    updateRecentActivity(dashboardData.recentActivity);

    console.log('✅ Dashboard loaded from PostHog');

  } catch (error) {
    console.error('Failed to load PostHog data:', error);
    showPostHogError(error);
  }
}

// Update metrics cards
function updateMetricsCards(metrics) {
  document.querySelector('[data-metric="workouts"]').textContent = metrics.totalWorkouts;
  document.querySelector('[data-metric="reps"]').textContent = metrics.totalReps;
  document.querySelector('[data-metric="songs"]').textContent = metrics.totalSongs;
  document.querySelector('[data-metric="users"]').textContent = metrics.uniqueUsers;
}

// Update charts
function updateWorkoutChart(data) {
  // data.labels = ["Oct 11", "Oct 12", ...]
  // data.datasets[0].data = [0, 0, 0, 0, 0, 0, 2, 1]

  const ctx = document.getElementById('activity-chart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets.map((dataset, i) => ({
        label: dataset.name,
        data: dataset.data,
        borderColor: ['#00ffc8', '#ff0096', '#6464ff'][i],
        backgroundColor: ['rgba(0, 255, 200, 0.1)', 'rgba(255, 0, 150, 0.1)', 'rgba(100, 100, 255, 0.1)'][i],
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
```

---

## Step 6: Replace localStorage with PostHog

Currently, your admin dashboard loads data from localStorage. Now you can switch to PostHog:

### Before (localStorage):

```javascript
// Load from localStorage
const history = JSON.parse(localStorage.getItem('cycleHistory') || '[]');
const totalSongs = history.length;
```

### After (PostHog):

```javascript
// Load from PostHog
const metrics = await posthogClient.getKeyMetrics(30);
const totalSongs = metrics.totalSongs;
```

---

## Available PostHog Queries

Your new `posthog-client.js` module provides these ready-to-use functions:

### Basic Metrics

```javascript
// Get key numbers
const metrics = await posthogClient.getKeyMetrics(30);
// Returns: { totalWorkouts, totalReps, totalSongs, totalFavorites, uniqueUsers, avgRepsPerWorkout }
```

### Trends

```javascript
// Workout trend (last 7 days)
const workouts = await posthogClient.getWorkoutTrend(7);

// Music trend (last 7 days)
const music = await posthogClient.getMusicTrend(7);

// Daily active users (last 30 days)
const users = await posthogClient.getDailyActiveUsers(30);
```

### Breakdowns

```javascript
// Music by genre
const genres = await posthogClient.getMusicGenreBreakdown(30);
// Returns: { labels: ['EDM', 'Rock', ...], data: [45, 38, ...] }
```

### Funnels

```javascript
// Workout completion funnel
const funnel = await posthogClient.getWorkoutFunnel();
// Returns: [
//   { step: 1, name: 'Session Started', count: 100, conversionRate: 100 },
//   { step: 2, name: 'Workout Started', count: 75, conversionRate: 75 },
//   { step: 3, name: 'Rep Completed', count: 60, conversionRate: 60 }
// ]
```

### Advanced

```javascript
// Recent activity
const activity = await posthogClient.getRecentActivity(50);

// Top events
const topEvents = await posthogClient.getTopEvents(30, 10);

// Session duration stats
const sessions = await posthogClient.getSessionDurations(30);

// PWA stats
const pwa = await posthogClient.getPWAStats(90);

// Complete dashboard data (all at once)
const allData = await posthogClient.getDashboardData();
```

---

## Example: Complete Dashboard Update

Here's a minimal example to get you started:

```javascript
// src/js/admin/admin-dashboard.js
import * as posthogClient from './posthog-client.js';

export async function initDashboard() {
  showLoader();

  try {
    // Load all data
    const data = await posthogClient.getDashboardData();

    // Update metrics cards
    document.getElementById('total-workouts').textContent = data.metrics.totalWorkouts;
    document.getElementById('total-reps').textContent = data.metrics.totalReps;
    document.getElementById('total-songs').textContent = data.metrics.totalSongs;
    document.getElementById('total-users').textContent = data.metrics.uniqueUsers;

    // Create workout chart
    createLineChart('workout-chart', data.charts.workouts);

    // Create music chart
    createLineChart('music-chart', data.charts.music);

    // Create user chart
    createLineChart('user-chart', data.charts.users);

    // Show recent activity
    renderRecentActivity(data.recentActivity);

    hideLoader();
    console.log('✅ Dashboard loaded successfully');

  } catch (error) {
    console.error('Dashboard error:', error);
    hideLoader();
    showError('Failed to load analytics data. Please refresh.');
  }
}

function createLineChart(canvasId, chartData) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets.map((ds, i) => ({
        label: ds.name,
        data: ds.data,
        borderColor: ['#00ffc8', '#ff0096', '#6464ff'][i],
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}

function renderRecentActivity(activities) {
  const container = document.getElementById('recent-activity');

  container.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <i class="${posthogClient.getEventIcon(activity.event)}"></i>
      <span>${posthogClient.formatEventName(activity.event)}</span>
      <time>${new Date(activity.timestamp).toLocaleString()}</time>
    </div>
  `).join('');
}

// Auto-refresh every 30 seconds
setInterval(() => initDashboard(), 30000);
```

---

## Troubleshooting

### "PostHog proxy not available"

**Cause:** Netlify function not deployed or API key missing

**Fix:**

1. Check Netlify deployment logs
2. Verify `POSTHOG_PERSONAL_API_KEY` is set in Netlify
3. Redeploy your site

### "CORS error"

**Cause:** Trying to call PostHog API directly from browser

**Fix:** Always use the Netlify function proxy (`/.netlify/functions/posthog-proxy`), never call PostHog API directly
from client code.

### "No data returned"

**Cause:** No events in your PostHog project yet

**Fix:**

1. Visit your main app (index.html)
2. Perform some actions (start workout, play music)
3. Wait 1-2 minutes for PostHog to process events
4. Refresh admin dashboard

### "API key invalid"

**Cause:** Wrong API key or insufficient permissions

**Fix:**

1. Get a new Personal API Key from PostHog
2. Make sure it has **Read** permissions
3. Update Netlify environment variable
4. Redeploy

---

## Security Notes

✅ **Secure:**

- API key is stored in Netlify environment (server-side)
- Netlify function acts as proxy
- Client never sees the API key

❌ **Insecure:**

- Never put API key in JavaScript files
- Never commit API key to git
- Never use PostHog API directly from browser

---

## Next Steps

Once you have PostHog data showing in your admin dashboard:

1. **Remove localStorage dependencies** - Replace all localStorage reads with PostHog queries
2. **Add real-time updates** - Set up auto-refresh every 30 seconds
3. **Build custom insights** - Create new queries for specific metrics
4. **Add data export** - Use `posthogClient.exportAllData()` for downloads
5. **Create alerts** - Monitor thresholds (e.g., notify if DAU drops)

---

## Quick Reference

### Get Your Data

```javascript
import * as posthog from './posthog-client.js';

// Key metrics
const metrics = await posthog.getKeyMetrics(30);

// Workout data
const workouts = await posthog.getWorkoutTrend(7);

// Music data
const music = await posthog.getMusicTrend(7);

// Users
const users = await posthog.getDailyActiveUsers(30);

// Everything at once
const all = await posthog.getDashboardData();
```

### Utility Functions

```javascript
// Format event names
posthog.formatEventName('workout_started'); // "Workout Started"

// Get event icons
posthog.getEventIcon('music_played'); // "ph-music-note"

// Check health
const healthy = await posthog.checkProxyHealth(); // true/false
```

---

## Support

- **PostHog Docs:** https://posthog.com/docs
- **Query API:** https://posthog.com/docs/api/query
- **Complete Guide:** See `/docs/guides/posthog-complete-guide.md`

---

That's it! You now have real PostHog analytics in your admin dashboard, completely client-side! 🎉
