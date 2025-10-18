/**
 * Admin Dashboard - Users Section
 * Handles user list, drill-downs, and user journey visualization
 */

import * as posthog from "./posthog-client.js";

/**
 * Render users section with list and stats
 */
export async function renderUsersSection() {
  const container = document.getElementById("users-section");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="analytics-grid">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon total-users">
              <i class="ph-fill ph-users" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">Loading...</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
          <div class="stat-change positive">
            <i class="ph ph-trend-up" aria-hidden="true"></i>
            <span>Calculating...</span>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    // Fetch all user data
    const [users, engagement, cohorts] = await Promise.all([
      posthog.getUsers(30, 100),
      posthog.getUserEngagement(30),
      posthog.getUserCohorts(30)
    ]);

    // Update the stats in the existing analytics section
    updateUserStats(users, engagement, cohorts);
    
    // Populate the users table
    populateUsersTable(users);

  } catch (error) {
    console.error("[Users Section] Error loading users:", error);
    showUsersError(error);
  }
}

/**
 * Update user statistics in the analytics section
 */
function updateUserStats(users, engagement, cohorts) {
  const totalUsersEl = document.getElementById('total-users-count');
  const activeUsersEl = document.getElementById('active-users-count');
  const newUsersEl = document.getElementById('new-users-count');

  if (totalUsersEl) totalUsersEl.textContent = users.length;
  if (activeUsersEl) activeUsersEl.textContent = engagement.powerUsers || 0;
  if (newUsersEl) newUsersEl.textContent = cohorts.newUsers || 0;
}

/**
 * Populate users table with modern design
 */
function populateUsersTable(users) {
  const usersTable = document.getElementById('users-table');
  if (!usersTable) return;

  usersTable.innerHTML = users.map(user => {
    const engagementLevel = user.totalEvents >= 50 ? "power" : user.totalEvents >= 10 ? "active" : "casual";
    const engagementColor = engagementLevel === "power" ? "#00ffc8" : engagementLevel === "active" ? "#ff0096" : "#6464ff";

    return `
      <div class="user-row" onclick="openUserModal(${JSON.stringify({
        id: user.userId,
        name: `User ${user.userId.substring(0, 8)}`,
        status: engagementLevel,
        lastSeen: user.lastSeen.toLocaleDateString(),
        totalSessions: user.sessions || 0,
        totalTime: `${Math.floor(user.totalEvents / 10)}h`,
        timeline: [],
        sessions: [],
        preferences: {}
      }).replace(/"/g, '&quot;')})">
        <div class="user-avatar" style="background: linear-gradient(135deg, ${engagementColor}, ${engagementColor}80);">
          <i class="ph-fill ph-user" aria-hidden="true"></i>
        </div>
        <div class="user-info">
          <div class="user-name">User ${user.userId.substring(0, 8)}</div>
          <div class="user-details">
            <span class="user-status ${engagementLevel}">${engagementLevel}</span>
            <span class="user-time">${user.lastSeen.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Show error state
 */
function showUsersError(error) {
  const container = document.getElementById("users-section");
  if (!container) return;

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="table-card">
        <div class="table-header">
          <h3>User Analytics</h3>
        </div>
        <div class="table-container">
          <div style="text-align: center; padding: 3rem; color: var(--error-500);">
            <i class="ph ph-warning-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Failed to load users</h3>
            <p style="color: var(--text-tertiary); font-size: 0.875rem;">${error.message}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show user details modal (placeholder for future implementation)
 */
export async function showUserDetails(userId) {
  console.log('User details for:', userId);
  // This could open a detailed user modal in the future
}

/**
 * Calculate user summary statistics
 */
function calculateUserSummary(activity, userId) {
  const userActivity = activity.filter(event => event.distinct_id === userId);
  
  return {
    totalEvents: userActivity.length,
    workouts: userActivity.filter(e => e.event === 'workout_started').length,
    songs: userActivity.filter(e => e.event === 'music_played').length,
    sessions: userActivity.filter(e => e.event === 'session_started').length
  };
}

/**
 * Render timeline for user activity
 */
function renderTimeline(activity) {
  if (activity.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-empty" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No activity found</p>
      </div>
    `;
  }

  // Group by date
  const groupedByDate = {};
  activity.forEach(event => {
    const date = new Date(event.timestamp).toDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(event);
  });

  return Object.entries(groupedByDate).map(([date, events]) => {
    return `
      <div class="timeline-date" style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
        ${date}
      </div>
      <div class="timeline-events" style="position: relative; padding-left: 2rem; border-left: 2px solid var(--border-primary);">
        ${events.map((event, index) => {
          const iconClass = posthog.getEventIcon(event.event);
          const time = new Date(event.timestamp).toLocaleTimeString();
          
          return `
            <div class="timeline-event" style="position: relative; margin-bottom: 1rem;">
              <div class="timeline-marker" style="position: absolute; left: -2.625rem; width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--surface-secondary); border: 2px solid var(--border-primary); display: flex; align-items: center; justify-content: center;">
                <i class="${iconClass}" style="font-size: 1rem; color: var(--primary-500);"></i>
              </div>
              <div class="timeline-content" style="background: var(--surface-primary); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-primary);">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${posthog.formatEventName(event.event)}</div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">${time}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                  ${event.properties?.title || event.event}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}

/**
 * Render event properties
 */
function renderEventProperties(properties) {
  if (!properties || Object.keys(properties).length === 0) {
    return '<div style="color: var(--text-tertiary); font-style: italic;">No properties</div>';
  }

  return Object.entries(properties).map(([key, value]) => `
    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid var(--border-primary);">
      <span style="font-weight: 600; color: var(--text-secondary);">${key}:</span>
      <span style="color: var(--text-primary);">${typeof value === 'object' ? JSON.stringify(value) : value}</span>
    </div>
  `).join('');
}