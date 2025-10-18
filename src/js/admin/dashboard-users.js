/**
 * Admin Dashboard - Users Section
 * Handles user list, drill-downs, and user journey visualization
 */

import * as posthog from './posthog-client.js';

/**
 * Render users section with list and stats
 */
export async function renderUsersSection() {
  const container = document.getElementById('users-section');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading users...</div>';

  try {
    // Fetch all user data
    const [users, engagement, cohorts] = await Promise.all([
      posthog.getUsers(30, 100),
      posthog.getUserEngagement(30),
      posthog.getUserCohorts(30)
    ]);

    // Render user overview cards
    const overviewHTML = `
      <div class="admin-grid admin-grid-4" style="margin-bottom: 2rem;">
        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #3b82f6;">
            <i class="ph-fill ph-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">${users.length}</div>
            <div class="stat-subtitle">Last 30 days</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #00ffc8;">
            <i class="ph-fill ph-fire"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Power Users</div>
            <div class="stat-value">${engagement.powerUsers}</div>
            <div class="stat-subtitle">50+ events</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #10b981;">
            <i class="ph-fill ph-user-plus"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">New Users</div>
            <div class="stat-value">${cohorts.newUsers}</div>
            <div class="stat-subtitle">${((cohorts.newUsers / cohorts.totalUsers) * 100).toFixed(0)}% of total</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #f59e0b;">
            <i class="ph-fill ph-arrow-bend-up-left"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Return Rate</div>
            <div class="stat-value">${cohorts.returnRate}%</div>
            <div class="stat-subtitle">${cohorts.returningUsers} returning</div>
          </div>
        </div>
      </div>
    `;

    // Render user list table
    const userListHTML = users.length > 0 ? `
      <div class="admin-card">
        <div style="padding: var(--admin-space-xl);">
          <div class="chart-title" style="margin-bottom: var(--admin-space-lg);">
            <div class="chart-icon" style="--icon-color-1: #3b82f6; --icon-color-2: #8b5cf6;">
              <i class="ph-fill ph-users-three"></i>
            </div>
            <span>All Users (${users.length})</span>
          </div>

          <div class="users-table">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--admin-border); text-align: left;">
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">User ID</th>
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Events</th>
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Workouts</th>
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Songs</th>
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Last Seen</th>
                  <th style="padding: 12px; font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(user => {
                  const engagementLevel = user.totalEvents >= 50 ? 'power' : user.totalEvents >= 10 ? 'active' : 'casual';
                  const engagementColor = engagementLevel === 'power' ? '#00ffc8' : engagementLevel === 'active' ? '#ff0096' : '#6464ff';

                  return `
                    <tr style="border-bottom: 1px solid var(--admin-border); cursor: pointer; transition: background 0.2s;"
                        onclick="window.viewUserDetails('${user.userId}')"
                        onmouseover="this.style.background='rgba(255,255,255,0.02)'"
                        onmouseout="this.style.background='transparent'">
                      <td style="padding: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, ${engagementColor}, ${engagementColor}80); display: flex; align-items: center; justify-content: center;">
                            <i class="ph-fill ph-user" style="color: white; font-size: 1.25rem;"></i>
                          </div>
                          <div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.875rem;">${user.userId.substring(0, 12)}...</div>
                            <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${engagementLevel} user</div>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 16px;">
                        <div style="font-size: 1.25rem; font-weight: 600; color: ${engagementColor};">${user.totalEvents}</div>
                      </td>
                      <td style="padding: 16px;">
                        <div style="font-size: 1.125rem;">${user.workouts}</div>
                      </td>
                      <td style="padding: 16px;">
                        <div style="font-size: 1.125rem;">${user.songsPlayed}</div>
                      </td>
                      <td style="padding: 16px;">
                        <div style="font-size: 0.875rem;">${formatRelativeTime(user.lastSeen)}</div>
                        <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${user.lastSeen.toLocaleDateString()}</div>
                      </td>
                      <td style="padding: 16px;">
                        <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="event.stopPropagation(); window.viewUserDetails('${user.userId}')">
                          <i class="ph ph-eye"></i>
                          View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : `
      <div class="admin-card" style="padding: var(--admin-space-xl); text-align: center;">
        <i class="ph ph-user-circle-dashed" style="font-size: 4rem; color: var(--admin-text-muted); opacity: 0.3;"></i>
        <p style="margin-top: 1rem; color: var(--admin-text-muted);">No users found in the last 30 days</p>
        <p style="font-size: 0.875rem; color: var(--admin-text-muted);">Users will appear here once they start using the app</p>
      </div>
    `;

    container.innerHTML = overviewHTML + userListHTML;

  } catch (error) {
    console.error('[Users Section] Error loading users:', error);
    container.innerHTML = `
      <div class="admin-card" style="padding: var(--admin-space-xl);">
        <div style="text-align: center; color: var(--admin-accent-red);">
          <i class="ph ph-warning-circle" style="font-size: 3rem;"></i>
          <p style="margin-top: 1rem;">Failed to load users</p>
          <p style="font-size: 0.875rem; opacity: 0.7;">${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Show user details modal with journey timeline
 */
export async function showUserDetails(userId) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'user-detail-modal';
  modal.className = 'user-detail-modal';
  modal.innerHTML = `
    <div class="user-detail-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="user-detail-content">
      <div class="user-detail-header">
        <h2 class="admin-heading-2" style="margin: 0; display: flex; align-items: center; gap: 12px;">
          <i class="ph-fill ph-user-circle"></i>
          User Journey
        </h2>
        <button class="user-detail-close" onclick="this.closest('.user-detail-modal').remove()">
          <i class="ph ph-x"></i>
        </button>
      </div>
      <div class="user-detail-body">
        <div class="loading">Loading user details...</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Fetch user activity
  try {
    const activity = await posthog.getUserActivity(userId, 100);

    // Get user summary
    const summary = calculateUserSummary(activity, userId);

    // Render user details
    const modalBody = modal.querySelector('.user-detail-body');
    modalBody.innerHTML = `
      <!-- User Summary -->
      <div class="user-summary" style="margin-bottom: 2rem;">
        <div style="background: var(--admin-glass); border-radius: var(--admin-radius-lg); padding: 1.5rem; border: 1px solid var(--admin-border);">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; color: var(--admin-text-muted); margin-bottom: 1rem;">
            ${userId}
          </div>

          <div class="admin-grid admin-grid-4">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--admin-accent-cyan);">${summary.totalEvents}</div>
              <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; margin-top: 0.5rem;">Total Events</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--admin-accent-purple);">${summary.workouts}</div>
              <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; margin-top: 0.5rem;">Workouts</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--admin-accent-pink);">${summary.songs}</div>
              <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; margin-top: 0.5rem;">Songs Played</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--admin-accent-green);">${summary.sessions}</div>
              <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; margin-top: 0.5rem;">Sessions</div>
            </div>
          </div>

          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--admin-text-muted);">
            <div>
              <strong>First Seen:</strong> ${summary.firstSeen.toLocaleString()}
            </div>
            <div>
              <strong>Last Seen:</strong> ${summary.lastSeen.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <!-- Event Breakdown -->
      <div class="event-breakdown" style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="ph-fill ph-chart-bar"></i>
          Event Breakdown
        </h3>
        <div class="admin-grid admin-grid-3" style="gap: 1rem;">
          ${Object.entries(summary.eventCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([event, count]) => `
              <div style="background: var(--admin-glass); border-radius: var(--admin-radius-md); padding: 1rem; border: 1px solid var(--admin-border);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <i class="${posthog.getEventIcon(event)}" style="font-size: 1.5rem; color: var(--admin-accent-cyan);"></i>
                  <div style="flex: 1;">
                    <div style="font-size: 0.875rem; color: var(--admin-text-muted);">${posthog.formatEventName(event)}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem;">${count}</div>
                  </div>
                </div>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- User Journey Timeline -->
      <div class="user-journey">
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="ph-fill ph-clock-counter-clockwise"></i>
          Activity Timeline (Last ${activity.length} events)
        </h3>
        <div class="timeline-container">
          ${renderTimeline(activity)}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('[User Details] Error:', error);
    const modalBody = modal.querySelector('.user-detail-body');
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--admin-accent-red);">
        <i class="ph ph-warning-circle" style="font-size: 4rem;"></i>
        <p style="margin-top: 1rem;">Failed to load user details</p>
        <p style="font-size: 0.875rem; opacity: 0.7;">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Calculate user summary from activity
 */
function calculateUserSummary(activity, userId) {
  const eventCounts = {};
  let workouts = 0;
  let songs = 0;
  let sessions = 0;

  activity.forEach(event => {
    // Count events
    eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;

    // Count specific types
    if (event.event === 'workout_started') workouts++;
    if (event.event === 'music_played') songs++;
    if (event.event === 'session_started') sessions++;
  });

  return {
    userId,
    totalEvents: activity.length,
    workouts,
    songs,
    sessions,
    eventCounts,
    firstSeen: activity.length > 0 ? activity[activity.length - 1].timestamp : new Date(),
    lastSeen: activity.length > 0 ? activity[0].timestamp : new Date()
  };
}

/**
 * Render timeline of user activity
 */
function renderTimeline(activity) {
  if (activity.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">
        <i class="ph ph-empty" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No activity recorded</p>
      </div>
    `;
  }

  // Group by date
  const grouped = activity.reduce((acc, event) => {
    const date = event.timestamp.toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return Object.entries(grouped).map(([date, events]) => `
    <div class="timeline-day" style="margin-bottom: 2rem;">
      <div class="timeline-date" style="font-size: 0.875rem; font-weight: 600; color: var(--admin-text-muted); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
        <i class="ph ph-calendar-blank"></i>
        ${date}
      </div>
      <div class="timeline-events" style="position: relative; padding-left: 2rem; border-left: 2px solid var(--admin-border);">
        ${events.map((event, index) => {
          const iconClass = posthog.getEventIcon(event.event);
          const eventName = posthog.formatEventName(event.event);
          const time = event.timestamp.toLocaleTimeString();

          return `
            <div class="timeline-event" style="position: relative; margin-bottom: 1.5rem;">
              <div class="timeline-marker" style="position: absolute; left: -2.625rem; width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--admin-bg-secondary); border: 2px solid var(--admin-border); display: flex; align-items: center; justify-content: center;">
                <i class="${iconClass}" style="font-size: 1rem; color: var(--admin-accent-cyan);"></i>
              </div>
              <div class="timeline-content" style="background: var(--admin-glass); border-radius: var(--admin-radius-md); padding: 1rem; border: 1px solid var(--admin-border);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                  <div style="font-weight: 600;">${eventName}</div>
                  <div style="font-size: 0.75rem; color: var(--admin-text-muted);">${time}</div>
                </div>
                ${event.properties && Object.keys(event.properties).length > 0 ? `
                  <div style="font-size: 0.75rem; color: var(--admin-text-muted); margin-top: 0.5rem;">
                    ${renderEventProperties(event.properties)}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Render event properties in a readable format
 */
function renderEventProperties(properties) {
  const importantProps = ['duration', 'repetitions', 'title', 'genre', 'mood', 'videoId'];
  const filtered = Object.entries(properties)
    .filter(([key]) => importantProps.includes(key))
    .map(([key, value]) => {
      if (key === 'videoId' && typeof value === 'string') {
        return `<span style="opacity: 0.7;">${key}:</span> ${value.substring(0, 12)}...`;
      }
      return `<span style="opacity: 0.7;">${key}:</span> ${value}`;
    });

  return filtered.length > 0 ? filtered.join(' • ') : '';
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Make viewUserDetails available globally
window.viewUserDetails = showUserDetails;
