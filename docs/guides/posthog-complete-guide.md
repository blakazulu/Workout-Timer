# PostHog Complete Guide - Everything You Need to Know

**Date:** 2025-10-18
**For:** Admin Dashboard Client-Side Analytics

---

## 📊 What is PostHog?

PostHog is a **complete product analytics platform** that tracks how users interact with your app. Unlike Google
Analytics, PostHog gives you:

- **Event tracking** - Every action users take
- **User profiles** - Anonymous but trackable users
- **Session replay** - Watch recordings of user sessions (optional)
- **Feature flags** - Turn features on/off remotely
- **A/B testing** - Test different versions
- **Funnels** - Track conversion flows
- **Retention** - See who comes back
- **Dashboards** - Pre-built visualizations

### Your Current Setup

You're tracking **14 event types**:

1. `workout_started` - Timer begins
2. `workout_reset` - Timer reset
3. `rep_completed` - Each rep finished
4. `music_played` - Song starts
5. `music_paused` - Song paused
6. `music_stopped` - Song stopped
7. `favorite_removed` - Unfavorite song
8. `session_started` - App opened
9. `session_ended` - App closed
10. `app_visible` - App in foreground
11. `app_hidden` - App in background
12. `search_opened` - Search activated
13. `$pageview` - Page views (automatic)
14. `$web_vitals` - Performance metrics (automatic)

---

## 🗄️ How PostHog Stores Data

### 1. Events (The Core)

Every action is an **event** with:

- **Event name** (e.g., `workout_started`)
- **Timestamp** (when it happened)
- **Properties** (metadata about the event)
- **Person ID** (who did it - anonymous by default)

**Example Event:**

```json
{
  "event": "workout_started",
  "timestamp": "2025-10-18T09:38:27.994Z",
  "distinct_id": "01JAFH8N...",
  "properties": {
    "duration": 30,
    "repetitions": 3,
    "restTime": 10,
    "hasMusic": true,
    "$browser": "Chrome",
    "$device_type": "Desktop",
    "$current_url": "https://yourapp.com"
  }
}
```

### 2. Persons (Users)

Each user gets a **distinct_id** (anonymous):

- Tracked across sessions
- Can store properties (device, preferences)
- No PII unless you explicitly set it

### 3. Sessions

Group of events from one visit:

- Session ID tracks the visit
- Duration calculated automatically
- Can replay if session recording enabled

---

## 🔍 What Data Can You Access?

### Real Data From Your Account

Based on your last 7 days:

**Workouts:**

- Oct 17: 2 workouts started, 2 reps completed
- Oct 18: 1 workout started

**Music:**

- Oct 17: 3 songs played
- Oct 18: 1 song played

**Users:**

- Oct 17: 1 unique user (Daily Active User)
- Oct 18: 1 unique user

---

## 📈 Types of Queries You Can Run

### 1. Trend Queries

**Track events over time**

```javascript
{
  "kind": "TrendsQuery",
  "series": [
    {
      "event": "workout_started",
      "math": "total"  // Count total events
    }
  ],
  "interval": "day",      // Group by day
  "dateRange": {
    "date_from": "-7d",   // Last 7 days
    "date_to": null       // Until now
  }
}
```

**Math Options:**

- `total` - Count all events
- `dau` - Daily Active Users
- `weekly_active` - Weekly Active Users
- `monthly_active` - Monthly Active Users
- `unique_session` - Unique sessions
- `avg` - Average of a property value
- `sum` - Sum of a property value
- `min` / `max` / `median` - Statistical values

### 2. Funnel Queries

**Track conversion flows**

```javascript
{
  "kind": "FunnelsQuery",
  "series": [
    { "event": "session_started" },
    { "event": "workout_started" },
    { "event": "rep_completed" },
    { "event": "workout_completed" }
  ],
  "funnelsFilter": {
    "funnelWindowInterval": 30,
    "funnelWindowIntervalUnit": "minute"
  }
}
```

Shows: How many users who started a session actually completed a workout?

### 3. Breakdown Queries

**Segment by properties**

```javascript
{
  "kind": "TrendsQuery",
  "series": [
    { "event": "music_played" }
  ],
  "breakdownFilter": {
    "breakdown": "genre",      // Property name
    "breakdown_type": "event"  // Event property
  }
}
```

Shows: Music plays by genre (EDM, Rock, Hip Hop, etc.)

### 4. HogQL Queries

**SQL-like queries for complex analysis**

```javascript
{
  "kind": "HogQLQuery",
  "query": "SELECT properties.genre, count() FROM events WHERE event = 'music_played' GROUP BY properties.genre"
}
```

---

## 🎯 Useful Metrics You Can Build

### Workout Metrics

1. **Total Workouts** - Count `workout_started`
2. **Completion Rate** - `workout_completed` / `workout_started` × 100
3. **Average Workout Duration** - Average of `duration` property
4. **Most Popular Duration** - Breakdown by `duration`
5. **Total Reps Completed** - Sum of `rep_completed`
6. **Average Reps per Workout** - `rep_completed` / `workout_started`

### Music Metrics

1. **Music Usage Rate** - % of workouts with `hasMusic = true`
2. **Most Popular Genres** - Breakdown `music_played` by `genre`
3. **Most Popular Moods** - Breakdown `music_played` by `mood`
4. **Top Songs** - Count `music_played` grouped by `videoId`
5. **Favorite Activity** - Count `favorite_added` vs `favorite_removed`

### User Engagement

1. **Daily Active Users** - `session_started` with `math: "dau"`
2. **Session Duration** - Average time between `session_started` and `session_ended`
3. **Return Rate** - Users with multiple `session_started` events
4. **PWA Install Rate** - `pwa_installed` / `$pageview` × 100

### Performance Metrics

1. **App Visibility** - Time in `app_visible` vs `app_hidden`
2. **Load Time** - From `$web_vitals` properties
3. **Error Rate** - If you track errors
4. **Feature Usage** - Count different feature events

---

## 🛠️ How to Query PostHog from Your Admin Dashboard

### Option 1: Using MCP Tools (Server-Side)

**Current approach - requires Node.js server**

You're using Claude's PostHog MCP tools, which work great but require a backend. This is what I used above to fetch your
data.

**Pros:**

- ✅ Secure (API key stays on server)
- ✅ No CORS issues
- ✅ Full PostHog API access

**Cons:**

- ❌ Requires a server
- ❌ Can't run purely client-side

### Option 2: PostHog Client-Side SDK (What You Want!)

**Direct browser queries**

PostHog's JavaScript SDK can query data directly from the browser using **public query endpoints**.

**Important:** For sensitive queries (events, user data), you need to either:

1. Use PostHog's public sharing feature (limited)
2. Set up a simple proxy endpoint (recommended)
3. Accept that anyone can see your analytics (if public app)

### Option 3: Build a Simple Proxy

**Best of both worlds**

Create a tiny serverless function (Netlify/Vercel) that:

1. Accepts queries from your admin dashboard
2. Adds your PostHog API key
3. Forwards request to PostHog
4. Returns data

This keeps your API key secure while allowing client-side queries.

---

## 💻 Client-Side Implementation Guide

Since you want everything client-side for your admin dashboard, here's how to do it:

### Step 1: Create PostHog Query Module

```javascript
// src/js/admin/posthog-queries.js

const POSTHOG_PROJECT_ID = '235590'; // Your project ID
const POSTHOG_API_HOST = 'https://app.posthog.com';

/**
 * Query PostHog insights
 * Note: This requires authentication - see implementation options below
 */
export async function queryPostHog(queryConfig) {
  const url = `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // WARNING: Do not expose your API key in client code!
      // Use a proxy or public sharing instead
    },
    body: JSON.stringify({ query: queryConfig })
  });

  if (!response.ok) {
    throw new Error(`PostHog query failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get workout statistics
 */
export async function getWorkoutStats(days = 7) {
  const query = {
    kind: 'TrendsQuery',
    series: [
      {
        event: 'workout_started',
        math: 'total',
        name: 'Workouts Started'
      },
      {
        event: 'rep_completed',
        math: 'total',
        name: 'Reps Completed'
      }
    ],
    interval: 'day',
    dateRange: {
      date_from: `-${days}d`,
      date_to: null
    }
  };

  return await queryPostHog(query);
}

/**
 * Get music genre breakdown
 */
export async function getMusicGenres(days = 30) {
  const query = {
    kind: 'TrendsQuery',
    series: [
      {
        event: 'music_played',
        math: 'total'
      }
    ],
    breakdownFilter: {
      breakdown: 'genre',
      breakdown_type: 'event'
    },
    dateRange: {
      date_from: `-${days}d`,
      date_to: null
    }
  };

  return await queryPostHog(query);
}

/**
 * Get daily active users
 */
export async function getDailyActiveUsers(days = 30) {
  const query = {
    kind: 'TrendsQuery',
    series: [
      {
        event: 'session_started',
        math: 'dau'
      }
    ],
    interval: 'day',
    dateRange: {
      date_from: `-${days}d`,
      date_to: null
    }
  };

  return await queryPostHog(query);
}

/**
 * Get workout completion funnel
 */
export async function getWorkoutFunnel() {
  const query = {
    kind: 'FunnelsQuery',
    series: [
      { event: 'session_started' },
      { event: 'workout_started' },
      { event: 'rep_completed' }
    ],
    funnelsFilter: {
      funnelWindowInterval: 30,
      funnelWindowIntervalUnit: 'minute'
    },
    dateRange: {
      date_from: '-30d',
      date_to: null
    }
  };

  return await queryPostHog(query);
}
```

### Step 2: Update Admin Dashboard

```javascript
// src/js/admin/admin-dashboard.js

import * as posthogQueries from './posthog-queries.js';

async function loadPostHogData() {
  try {
    // Fetch workout stats
    const workoutStats = await posthogQueries.getWorkoutStats(7);
    displayWorkoutChart(workoutStats);

    // Fetch music genres
    const genres = await posthogQueries.getMusicGenres(30);
    displayGenreChart(genres);

    // Fetch DAU
    const users = await posthogQueries.getDailyActiveUsers(30);
    displayUserChart(users);

    // Update metrics cards
    updateMetricsFromPostHog(workoutStats, users);

  } catch (error) {
    console.error('Failed to load PostHog data:', error);
    showPostHogError(error);
  }
}

function displayWorkoutChart(data) {
  // data.results[0] contains workout_started
  // data.results[1] contains rep_completed

  const labels = data.results[0].labels;
  const workouts = data.results[0].data;
  const reps = data.results[1].data;

  // Use Chart.js to display
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Workouts Started',
          data: workouts,
          borderColor: '#00ffc8'
        },
        {
          label: 'Reps Completed',
          data: reps,
          borderColor: '#ff0096'
        }
      ]
    }
  });
}
```

### Step 3: Security Considerations

**⚠️ IMPORTANT:** Never expose your PostHog API key in client-side code!

**Option A: Use Netlify Function (Recommended)**

```javascript
// netlify/functions/posthog-query.js
export async function handler(event) {
  const { query } = JSON.parse(event.body);

  const response = await fetch('https://app.posthog.com/api/projects/235590/query/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.POSTHOG_API_KEY}`
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
}
```

Then in your client:

```javascript
async function queryPostHog(query) {
  const response = await fetch('/.netlify/functions/posthog-query', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  return await response.json();
}
```

**Option B: Admin Password Protection**

Since your admin dashboard already requires a password, you could:

1. Keep the dashboard private (no public access)
2. Accept that anyone with admin access sees the data
3. Use obfuscated API key (weak security, but works for personal projects)

**Option C: PostHog Shared Insights**

PostHog lets you create shareable insight links that work without auth:

1. Create insight in PostHog dashboard
2. Click "Share" → Get public link
3. Embed in your dashboard

---

## 📊 Real Query Examples From Your Data

### Example 1: Workout Trend (Last 7 Days)

**Query:**

```javascript
{
  "kind": "InsightVizNode",
  "source": {
    "kind": "TrendsQuery",
    "series": [
      {
        "kind": "EventsNode",
        "event": "workout_started",
        "math": "total"
      }
    ],
    "interval": "day",
    "dateRange": { "date_from": "-7d" }
  }
}
```

**Result:**

```javascript
{
  data: [0, 0, 0, 0, 0, 0, 2, 1],
  labels: ["11-Oct", "12-Oct", "13-Oct", "14-Oct", "15-Oct", "16-Oct", "17-Oct", "18-Oct"],
  count: 3  // Total workouts
}
```

### Example 2: Daily Active Users

**Query:**

```javascript
{
  "kind": "TrendsQuery",
  "series": [{
    "event": "session_started",
    "math": "dau"  // Daily Active Users
  }],
  "interval": "day",
  "dateRange": { "date_from": "-7d" }
}
```

**Result:**

```javascript
{
  data: [0, 0, 0, 0, 0, 0, 1, 1],  // 1 user on Oct 17, 1 user on Oct 18
  count: 2  // Total unique users in period
}
```

---

## 🎨 Dashboard Visualizations You Can Build

### 1. **Key Metrics Cards**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Total Workouts  │  │   Active Users   │  │  Songs Played    │
│       127        │  │        45        │  │       289        │
│    ↑ 12% ────    │  │    ↑ 8% ────     │  │    ↑ 15% ────    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 2. **Activity Trend Chart**

Line chart showing workouts, reps, music plays over time

### 3. **Genre Distribution**

Pie chart showing % of plays by genre

### 4. **Workout Funnel**

```
Session Started:  100%  ████████████████████
Workout Started:   75%  ███████████████
Rep Completed:     60%  ████████████
Workout Complete:  50%  ██████████
```

### 5. **Top Songs Table**

```
Rank | Song          | Plays | Genre
-----|---------------|-------|-------
  1  | Beast Mode    |  45   | EDM
  2  | Power Up      |  38   | Rock
  3  | High Energy   |  32   | Hip Hop
```

---

## 🔧 Advanced Features

### Feature Flags

Control features remotely:

```javascript
if (posthog.isFeatureEnabled('new-timer-ui')) {
  // Show new UI
}
```

### Session Replay

Watch user sessions:

```javascript
posthog.startSessionRecording();
```

View recordings in PostHog dashboard → Session Replay

### Cohorts

Group users by behavior:

- "Power users" - >10 workouts/month
- "Music lovers" - Always use music
- "Quick workers" - <20 sec workouts

### A/B Testing

Test variations:

```javascript
const variant = posthog.getFeatureFlag('timer-layout');
if (variant === 'vertical') {
  // Show vertical layout
} else {
  // Show horizontal layout
}
```

---

## 📝 Event Properties You're Tracking

Based on your implementation in `analytics-tracker.js`:

### workout_started

```javascript
{
  duration: 30,        // Seconds
  repetitions: 3,      // Number of sets
  restTime: 10,        // Rest between sets
  hasMusic: true       // Using music or not
}
```

### music_played

```javascript
{
  videoId: "dQw4w9WgXcQ",
  title: "Song Title",
  genre: "EDM",         // If selected
  mood: "Intense"       // If selected
}
```

### favorite_added

```javascript
{
  videoId: "dQw4w9WgXcQ",
  title: "Song Title",
  totalFavorites: 15    // Total after adding
}
```

### session_started

```javascript
{
  timestamp: "2025-10-18T09:30:00Z",
  userAgent: "Mozilla/5.0...",
  screenWidth: 1920,
  screenHeight: 1080
}
```

---

## 🚀 Quick Start Implementation

To add PostHog data to your admin dashboard **right now**:

### 1. Create Netlify Function

```bash
mkdir -p netlify/functions
```

Create `netlify/functions/posthog-proxy.js`:

```javascript
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { query } = JSON.parse(event.body);

  try {
    const response = await fetch(
      `https://app.posthog.com/api/projects/235590/query/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`
        },
        body: JSON.stringify({ query })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### 2. Add API Key to Netlify

Get your API key from PostHog:

1. Go to PostHog → Settings → Personal API Keys
2. Create new key with "read" permissions
3. Add to Netlify: `POSTHOG_PERSONAL_API_KEY=phx_...`

### 3. Update Admin Dashboard

```javascript
// src/js/admin/posthog-client.js
export async function queryPostHog(query) {
  const response = await fetch('/.netlify/functions/posthog-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('PostHog query failed');
  }

  return await response.json();
}

// Preset queries
export const queries = {
  workoutTrend: (days = 7) => ({
    kind: 'TrendsQuery',
    series: [{ event: 'workout_started', math: 'total' }],
    interval: 'day',
    dateRange: { date_from: `-${days}d` }
  }),

  dailyUsers: (days = 30) => ({
    kind: 'TrendsQuery',
    series: [{ event: 'session_started', math: 'dau' }],
    interval: 'day',
    dateRange: { date_from: `-${days}d` }
  }),

  musicGenres: (days = 30) => ({
    kind: 'TrendsQuery',
    series: [{ event: 'music_played', math: 'total' }],
    breakdownFilter: {
      breakdown: 'genre',
      breakdown_type: 'event'
    },
    dateRange: { date_from: `-${days}d` }
  })
};
```

### 4. Use in Dashboard

```javascript
import { queryPostHog, queries } from './posthog-client.js';

async function loadDashboard() {
  // Get workout data
  const workouts = await queryPostHog(queries.workoutTrend(7));
  console.log('Workouts:', workouts.results[0].data);

  // Get user data
  const users = await queryPostHog(queries.dailyUsers(30));
  console.log('Users:', users.results[0].data);

  // Get genre data
  const genres = await queryPostHog(queries.musicGenres(30));
  console.log('Genres:', genres.results);
}
```

---

## 📖 Resources

- **PostHog Docs:** https://posthog.com/docs
- **Query API:** https://posthog.com/docs/api/query
- **Trends:** https://posthog.com/docs/product-analytics/trends
- **Funnels:** https://posthog.com/docs/product-analytics/funnels
- **HogQL:** https://posthog.com/docs/hogql

---

## ✅ Summary

You can display **all** PostHog data in your admin dashboard by:

1. **Querying the PostHog API** - Use trend, funnel, and HogQL queries
2. **Securing your API key** - Use Netlify function proxy
3. **Visualizing results** - Use Chart.js with PostHog data
4. **Building custom metrics** - Combine events for insights

Your current tracking gives you access to:

- ✅ Workout statistics and trends
- ✅ Music usage and genre preferences
- ✅ User engagement and session data
- ✅ Feature usage patterns
- ✅ Performance metrics
- ✅ Custom breakdowns and funnels

Everything can be displayed client-side without using the PostHog dashboard!
