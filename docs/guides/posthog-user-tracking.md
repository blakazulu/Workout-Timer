# PostHog User Tracking Guide

**Date:** 2025-10-18
**Feature:** Display Users from PostHog in Admin Dashboard

---

## 👥 Your Real User Data

Based on your current PostHog data, you have:

**User:** `0199f461-30c2-777d-b444-2cfcaf7c0f64`
- **Total Events:** 107 actions
- **First Seen:** Oct 17, 2025 at 22:53 UTC
- **Last Seen:** Oct 18, 2025 at 09:38 UTC
- **Active Days:** 1 day (so far)

---

## 🎯 New Functions Available

I've added 5 user-tracking functions to `src/js/admin/posthog-client.js`:

### 1. `getUsers(days, limit)`
Get list of all users with their stats

### 2. `getUserActivity(userId, limit)`
Get activity timeline for a specific user

### 3. `getUserCohorts(days)`
Analyze new vs returning users

### 4. `getUserEngagement(days)`
Categorize users by engagement level

### 5. `getUserRetention(days)`
Track daily user retention

---

## 💻 How to Display Users in Admin Dashboard

### Example 1: User List Table

```javascript
import * as posthog from './posthog-client.js';

async function showUserList() {
  // Get all users from last 30 days
  const users = await posthog.getUsers(30, 100);

  console.log('Total users:', users.length);

  // Display in table
  const html = `
    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Events</th>
          <th>Workouts</th>
          <th>Songs</th>
          <th>First Seen</th>
          <th>Last Seen</th>
          <th>Days Active</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.userId.substring(0, 8)}...</td>
            <td>${user.totalEvents}</td>
            <td>${user.workouts}</td>
            <td>${user.songsPlayed}</td>
            <td>${user.firstSeen.toLocaleDateString()}</td>
            <td>${user.lastSeen.toLocaleDateString()}</td>
            <td>${user.daysActive}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('user-list').innerHTML = html;
}
```

**Result for your current user:**
```
User ID: 0199f461...
Events: 107
Workouts: 3
Songs: 4
First Seen: Oct 17, 2025
Last Seen: Oct 18, 2025
Days Active: 1
```

---

### Example 2: User Engagement Breakdown

```javascript
async function showUserEngagement() {
  const engagement = await posthog.getUserEngagement(30);

  // Display as stats cards
  document.getElementById('power-users').textContent = engagement.powerUsers;
  document.getElementById('active-users').textContent = engagement.activeUsers;
  document.getElementById('casual-users').textContent = engagement.casualUsers;

  // Display as pie chart
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: engagement.labels,
      datasets: [{
        data: engagement.data,
        backgroundColor: ['#00ffc8', '#ff0096', '#6464ff']
      }]
    }
  });
}
```

**Your current data:**
```
Power Users (50+ events): 1 user
Active Users (10-49 events): 0 users
Casual Users (<10 events): 0 users
```

---

### Example 3: New vs Returning Users

```javascript
async function showUserCohorts() {
  const cohorts = await posthog.getUserCohorts(30);

  console.log('New users:', cohorts.newUsers);
  console.log('Returning users:', cohorts.returningUsers);
  console.log('Return rate:', cohorts.returnRate + '%');

  // Display
  document.getElementById('new-users').textContent = cohorts.newUsers;
  document.getElementById('returning-users').textContent = cohorts.returningUsers;
  document.getElementById('return-rate').textContent = cohorts.returnRate + '%';
}
```

**Your current data:**
```
New Users: 1 (100%)
Returning Users: 0 (0%)
Return Rate: 0%
```

*Note: As your app gets more usage, this will show how many users come back!*

---

### Example 4: User Activity Timeline

```javascript
async function showUserTimeline(userId) {
  const activity = await posthog.getUserActivity(userId, 50);

  const html = activity.map(event => `
    <div class="activity-item">
      <span class="time">${event.timestamp.toLocaleString()}</span>
      <span class="event">${posthog.formatEventName(event.event)}</span>
      <i class="${posthog.getEventIcon(event.event)}"></i>
    </div>
  `).join('');

  document.getElementById('timeline').innerHTML = html;
}

// Show timeline for your user
showUserTimeline('0199f461-30c2-777d-b444-2cfcaf7c0f64');
```

---

### Example 5: Daily User Retention Chart

```javascript
async function showUserRetention() {
  const retention = await posthog.getUserRetention(7);

  const labels = retention.map(r => r.date);
  const data = retention.map(r => r.users);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Active Users',
        data: data,
        borderColor: '#00ffc8',
        fill: true
      }]
    }
  });
}
```

---

## 🎨 Complete Admin Dashboard Example

Here's a complete example showing users in your admin dashboard:

```javascript
// src/js/admin/admin-dashboard.js
import * as posthog from './posthog-client.js';

export async function initDashboard() {
  try {
    // Load all user data
    const [users, engagement, cohorts, retention] = await Promise.all([
      posthog.getUsers(30, 100),
      posthog.getUserEngagement(30),
      posthog.getUserCohorts(30),
      posthog.getUserRetention(7)
    ]);

    // Update user metrics cards
    updateUserMetrics(users, engagement, cohorts);

    // Display user list
    renderUserList(users);

    // Display engagement chart
    renderEngagementChart(engagement);

    // Display retention chart
    renderRetentionChart(retention);

  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

function updateUserMetrics(users, engagement, cohorts) {
  document.getElementById('total-users').textContent = users.length;
  document.getElementById('power-users').textContent = engagement.powerUsers;
  document.getElementById('new-users').textContent = cohorts.newUsers;
  document.getElementById('return-rate').textContent = cohorts.returnRate + '%';
}

function renderUserList(users) {
  const container = document.getElementById('user-list');

  if (users.length === 0) {
    container.innerHTML = '<p>No users yet. Start using the app to see users!</p>';
    return;
  }

  const html = `
    <div class="user-grid">
      ${users.map(user => `
        <div class="user-card">
          <div class="user-id">${user.userId.substring(0, 12)}...</div>
          <div class="user-stats">
            <div class="stat">
              <span class="label">Events</span>
              <span class="value">${user.totalEvents}</span>
            </div>
            <div class="stat">
              <span class="label">Workouts</span>
              <span class="value">${user.workouts}</span>
            </div>
            <div class="stat">
              <span class="label">Songs</span>
              <span class="value">${user.songsPlayed}</span>
            </div>
          </div>
          <div class="user-dates">
            <div>First: ${user.firstSeen.toLocaleDateString()}</div>
            <div>Last: ${user.lastSeen.toLocaleDateString()}</div>
          </div>
          <button onclick="viewUserDetails('${user.userId}')">View Details</button>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function renderEngagementChart(engagement) {
  const ctx = document.getElementById('engagement-chart').getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: engagement.labels,
      datasets: [{
        data: engagement.data,
        backgroundColor: ['#00ffc8', '#ff0096', '#6464ff']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function renderRetentionChart(retention) {
  const ctx = document.getElementById('retention-chart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: retention.map(r => new Date(r.date).toLocaleDateString()),
      datasets: [{
        label: 'Daily Active Users',
        data: retention.map(r => r.users),
        borderColor: '#00ffc8',
        backgroundColor: 'rgba(0, 255, 200, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// View individual user details
async function viewUserDetails(userId) {
  const activity = await posthog.getUserActivity(userId, 100);

  // Show modal with user activity
  showModal(`
    <h2>User Activity: ${userId.substring(0, 12)}...</h2>
    <div class="timeline">
      ${activity.map(event => `
        <div class="timeline-item">
          <time>${event.timestamp.toLocaleString()}</time>
          <i class="${posthog.getEventIcon(event.event)}"></i>
          <span>${posthog.formatEventName(event.event)}</span>
        </div>
      `).join('')}
    </div>
  `);
}
```

---

## 📊 What Each Function Returns

### `getUsers(30, 100)`
```javascript
[
  {
    userId: "0199f461-30c2-777d-b444-2cfcaf7c0f64",
    totalEvents: 107,
    firstSeen: Date(2025-10-17T22:53:55),
    lastSeen: Date(2025-10-18T09:38:17),
    workouts: 3,
    songsPlayed: 4,
    sessions: 2,
    daysActive: 1
  }
  // ... more users
]
```

### `getUserEngagement(30)`
```javascript
{
  powerUsers: 1,      // 50+ events
  activeUsers: 0,     // 10-49 events
  casualUsers: 0,     // <10 events
  total: 1,
  labels: ["Power Users (50+ events)", "Active Users (10-49 events)", "Casual Users (<10 events)"],
  data: [1, 0, 0]
}
```

### `getUserCohorts(30)`
```javascript
{
  newUsers: 1,
  returningUsers: 0,
  totalUsers: 1,
  returnRate: "0.0"   // percentage
}
```

### `getUserRetention(7)`
```javascript
[
  { date: "2025-10-17", users: 1 },
  { date: "2025-10-18", users: 1 }
]
```

### `getUserActivity(userId, 50)`
```javascript
[
  {
    event: "music_played",
    timestamp: Date(2025-10-18T09:38:17),
    properties: { videoId: "...", title: "..." }
  },
  {
    event: "workout_started",
    timestamp: Date(2025-10-18T09:38:27),
    properties: { duration: 30, repetitions: 3 }
  }
  // ... more events (up to 50)
]
```

---

## 🎯 Quick Test

Add this to your test page or console to see your users:

```javascript
import * as posthog from './posthog-client.js';

// Get and display users
const users = await posthog.getUsers(30);
console.table(users);

// Get engagement
const engagement = await posthog.getUserEngagement(30);
console.log('Engagement:', engagement);

// Get cohorts
const cohorts = await posthog.getUserCohorts(30);
console.log('Cohorts:', cohorts);
```

---

## 📈 User Metrics You Can Display

**Overview Cards:**
- Total Users
- Active Users Today
- New Users This Week
- Return Rate

**User Breakdown:**
- Power Users (50+ events)
- Active Users (10-49 events)
- Casual Users (<10 events)

**Cohort Analysis:**
- New vs Returning
- User Retention Rate
- Average Sessions per User

**User List:**
- User ID (anonymized)
- Total Events
- Workouts Completed
- Songs Played
- First Seen Date
- Last Seen Date
- Days Active

**Individual User View:**
- Complete activity timeline
- Event breakdown
- Usage patterns
- Most active times

---

## 🔒 Privacy Notes

**What PostHog Tracks:**
- ✅ Anonymous user IDs (e.g., `0199f461-30c2...`)
- ✅ Actions they take (events)
- ✅ When they visit
- ✅ Device/browser info (optional)

**What PostHog Does NOT Track:**
- ❌ Names
- ❌ Email addresses
- ❌ IP addresses (anonymized)
- ❌ Personal information

**You control:**
- How long to store data (default: 1 year)
- What properties to track
- User opt-out (already implemented)

---

## 🚀 Next Steps

1. **Add user section to admin dashboard**
   - User list table
   - Engagement chart
   - Cohort stats

2. **Create user detail view**
   - Click a user to see their timeline
   - Show their most-used features
   - Display usage patterns

3. **Add user filters**
   - Filter by engagement level
   - Sort by most active
   - Search by user ID

4. **Build user insights**
   - Most common user journey
   - Average session length by user
   - Power user characteristics

---

## 📚 Function Reference

```javascript
// Get all users
const users = await posthog.getUsers(days, limit);

// Get user activity
const activity = await posthog.getUserActivity(userId, limit);

// Get engagement breakdown
const engagement = await posthog.getUserEngagement(days);

// Get new vs returning
const cohorts = await posthog.getUserCohorts(days);

// Get daily retention
const retention = await posthog.getUserRetention(days);
```

---

**Summary:**
You can now display all your users from PostHog in the admin dashboard! Your current data shows 1 power user (you!) with 107 events across 2 days. As more people use your app, you'll see user growth, engagement patterns, and retention metrics. 🎉
