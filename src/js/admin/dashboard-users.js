/**
 * Admin Dashboard - Users Section
 * Handles user list, drill-downs, and user journey visualization
 */

import * as posthog from "./posthog-client.js";

/**
 * Initialize modal event listeners
 */
export function initializeUserModal() {
  const modal = document.getElementById('user-journey-modal');
  if (!modal) return;

  // Close button
  const closeBtn = modal.querySelector('.user-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  // Backdrop click
  const backdrop = modal.querySelector('.user-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  // Tab switching
  const tabs = modal.querySelectorAll('.journey-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      const contents = modal.querySelectorAll('.journey-tab-content');
      contents.forEach(content => {
        content.classList.remove('active');
      });

      const targetContent = document.getElementById(`${tabName}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * Render users section with list and stats
 */
export async function renderUsersSection() {
  // Show loading state
  const usersTable = document.getElementById('users-table');
  if (usersTable) {
    usersTable.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-spinner" style="font-size: 3rem; animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 1rem;">Loading users...</p>
      </div>
    `;
  }

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

  if (!users || users.length === 0) {
    usersTable.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-users" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No users found</p>
      </div>
    `;
    return;
  }

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
  const usersTable = document.getElementById('users-table');
  if (!usersTable) return;

  usersTable.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--error-500);">
      <i class="ph ph-warning-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
      <h3 style="margin-bottom: 0.5rem;">Failed to load users</h3>
      <p style="color: var(--text-tertiary); font-size: 0.875rem;">${error.message}</p>
    </div>
  `;
}

/**
 * Open user modal with user journey details
 * Made global for onclick access
 */
window.openUserModal = async function(userData) {
  const modal = document.getElementById('user-journey-modal');
  if (!modal) return;

  // Show modal
  modal.classList.add('show');

  // Populate user info
  document.getElementById('user-id-display').textContent = userData.id.substring(0, 8);
  document.getElementById('user-total-sessions').textContent = userData.totalSessions;
  document.getElementById('user-total-time').textContent = userData.totalTime;
  document.getElementById('user-last-seen').textContent = userData.lastSeen;

  // Show loading state in timeline
  const timelineContainer = document.getElementById('user-timeline');
  timelineContainer.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
      <i class="ph ph-spinner" style="font-size: 3rem; animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 1rem;">Loading timeline...</p>
    </div>
  `;

  try {
    // Fetch user activity from PostHog
    const activity = await posthog.getUserActivity(userData.id, 100);

    // Render timeline
    timelineContainer.innerHTML = renderTimeline(activity);
  } catch (error) {
    console.error('[User Modal] Error loading timeline:', error);
    timelineContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--error-500);">
        <i class="ph ph-warning-circle" style="font-size: 3rem;"></i>
        <p style="margin-top: 1rem;">Failed to load timeline</p>
      </div>
    `;
  }
};

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
        <i class="ph ph-clock-counter-clockwise" style="font-size: 3rem; opacity: 0.3;"></i>
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

  // Render grouped timeline
  return Object.entries(groupedByDate)
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    .map(([date, events]) => {
      return `
        <div class="timeline-day">
          <div class="timeline-date">
            <i class="ph-fill ph-calendar-blank" aria-hidden="true"></i>
            <span>${date}</span>
          </div>
          <div class="timeline-events">
            ${events.map((event) => {
              const iconClass = posthog.getEventIcon(event.event);
              const time = new Date(event.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              const eventName = posthog.formatEventName(event.event);
              const eventDetail = event.properties?.title ||
                                 event.properties?.genre ||
                                 event.properties?.mood ||
                                 '';

              return `
                <div class="timeline-event">
                  <div class="timeline-event-icon">
                    <i class="${iconClass}" aria-hidden="true"></i>
                  </div>
                  <div class="timeline-event-content">
                    <div class="timeline-event-header">
                      <div class="timeline-event-title">${eventName}</div>
                      <div class="timeline-event-time">${time}</div>
                    </div>
                    ${eventDetail ? `
                      <div class="timeline-event-subtitle">${eventDetail}</div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
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