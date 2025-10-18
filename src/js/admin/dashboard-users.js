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
  console.log('[Users Section] ========== STARTING renderUsersSection ==========');

  // Show loading state
  const usersTable = document.getElementById('users-table');
  console.log('[Users Section] users-table element:', usersTable);

  if (usersTable) {
    usersTable.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-spinner" style="font-size: 3rem; animation: spin 1s linear infinite;"></i>
        <p style="margin-top: 1rem;">Loading users...</p>
      </div>
    `;
    console.log('[Users Section] Loading state displayed');
  } else {
    console.error('[Users Section] users-table element NOT FOUND!');
  }

  try {
    console.log('[Users Section] Fetching data from PostHog...');

    // Fetch all user data
    const [users, engagement, cohorts] = await Promise.all([
      posthog.getUsers(30, 100),
      posthog.getUserEngagement(30),
      posthog.getUserCohorts(30)
    ]);

    console.log('[Users Section] Fetched users:', users);
    console.log('[Users Section] Fetched engagement:', engagement);
    console.log('[Users Section] Fetched cohorts:', cohorts);

    // Update the stats in the existing analytics section
    updateUserStats(users, engagement, cohorts);

    // Populate the users table
    populateUsersTable(users);

    console.log('[Users Section] ========== COMPLETED renderUsersSection ==========');

  } catch (error) {
    console.error("[Users Section] ========== ERROR in renderUsersSection ==========");
    console.error("[Users Section] Error:", error);
    console.error("[Users Section] Error stack:", error.stack);
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
  console.log('[populateUsersTable] Called with users:', users);
  console.log('[populateUsersTable] Users count:', users ? users.length : 'null/undefined');

  const usersTable = document.getElementById('users-table');
  console.log('[populateUsersTable] usersTable element:', usersTable);

  if (!usersTable) {
    console.error('[populateUsersTable] usersTable NOT FOUND!');
    return;
  }

  if (!users || users.length === 0) {
    console.log('[populateUsersTable] No users, showing empty state');
    usersTable.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-users" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No users found</p>
      </div>
    `;
    return;
  }

  console.log('[populateUsersTable] Rendering', users.length, 'user rows');

  const html = users.map((user, index) => {
    console.log(`[populateUsersTable] User ${index}:`, user);

    const engagementLevel = user.totalEvents >= 50 ? "power" : user.totalEvents >= 10 ? "active" : "casual";
    const engagementColor = engagementLevel === "power" ? "#00ffc8" : engagementLevel === "active" ? "#ff0096" : "#6464ff";

    const userData = {
      id: user.userId,
      name: `User ${user.userId.substring(0, 8)}`,
      status: engagementLevel,
      lastSeen: user.lastSeen.toLocaleDateString(),
      totalSessions: user.sessions || 0,
      totalTime: `${Math.floor(user.totalEvents / 10)}h`,
      timeline: [],
      sessions: [],
      preferences: {}
    };

    console.log(`[populateUsersTable] User ${index} data for onclick:`, userData);

    return `
      <div class="user-row" onclick="openUserModal(${JSON.stringify(userData).replace(/"/g, '&quot;')})">
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

  console.log('[populateUsersTable] Generated HTML length:', html.length);
  console.log('[populateUsersTable] HTML preview:', html.substring(0, 300));

  usersTable.innerHTML = html;
  console.log('[populateUsersTable] Table populated, checking window.openUserModal:', typeof window.openUserModal);
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
  console.log('[User Modal] Opening modal for user:', userData);

  const modal = document.getElementById('user-journey-modal');
  if (!modal) {
    console.error('[User Modal] Modal element not found');
    return;
  }

  // Show modal
  modal.classList.add('show');

  // Update modal title
  const modalTitle = document.getElementById('user-modal-title');
  if (modalTitle) {
    modalTitle.textContent = `User ${userData.id.substring(0, 8)}`;
  }

  // Populate user info
  const userIdEl = document.getElementById('user-id-display');
  const sessionsEl = document.getElementById('user-total-sessions');
  const timeEl = document.getElementById('user-total-time');
  const lastSeenEl = document.getElementById('user-last-seen');

  if (userIdEl) userIdEl.textContent = userData.id.substring(0, 8);
  if (sessionsEl) sessionsEl.textContent = userData.totalSessions;
  if (timeEl) timeEl.textContent = userData.totalTime;
  if (lastSeenEl) lastSeenEl.textContent = userData.lastSeen;

  // Show loading state in timeline
  const timelineContainer = document.getElementById('user-timeline');
  if (!timelineContainer) {
    console.error('[User Modal] Timeline container not found');
    return;
  }

  timelineContainer.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
      <i class="ph ph-spinner" style="font-size: 3rem; animation: spin 1s linear infinite;"></i>
      <p style="margin-top: 1rem;">Loading timeline...</p>
    </div>
  `;

  try {
    // Fetch user activity from PostHog
    console.log('[User Modal] Fetching activity for user:', userData.id);
    const activity = await posthog.getUserActivity(userData.id, 100);
    console.log('[User Modal] Retrieved activity:', activity);
    console.log('[User Modal] Activity length:', activity ? activity.length : 'null/undefined');
    console.log('[User Modal] First event:', activity && activity[0] ? activity[0] : 'no events');

    // Render timeline
    const html = renderTimeline(activity);
    console.log('[User Modal] Rendered HTML length:', html.length);
    console.log('[User Modal] Rendered HTML preview:', html.substring(0, 200));

    timelineContainer.innerHTML = html;
    console.log('[User Modal] Timeline container updated');

    // Render sessions
    const sessionsContainer = document.getElementById('user-sessions');
    if (sessionsContainer) {
      console.log('[User Modal] Rendering sessions...');
      sessionsContainer.innerHTML = renderSessions(activity);
      console.log('[User Modal] Sessions rendered');
    }

    // Render preferences
    const preferencesContainer = document.getElementById('user-preferences');
    if (preferencesContainer) {
      console.log('[User Modal] Rendering preferences...');
      preferencesContainer.innerHTML = renderPreferences(activity);
      console.log('[User Modal] Preferences rendered');
    }
  } catch (error) {
    console.error('[User Modal] Error loading timeline:', error);
    console.error('[User Modal] Error stack:', error.stack);
    timelineContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--error-500);">
        <i class="ph ph-warning-circle" style="font-size: 3rem;"></i>
        <p style="margin-top: 1rem;">Failed to load timeline</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
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
  console.log('[renderTimeline] Called with activity:', activity);
  console.log('[renderTimeline] Activity type:', typeof activity);
  console.log('[renderTimeline] Is array?', Array.isArray(activity));

  if (!activity || activity.length === 0) {
    console.log('[renderTimeline] No activity, showing empty state');
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-clock-counter-clockwise" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No activity found</p>
      </div>
    `;
  }

  console.log('[renderTimeline] Rendering', activity.length, 'events');

  // Render events (most recent first)
  const html = activity.map((event, index) => {
    console.log(`[renderTimeline] Event ${index}:`, event);

    const iconClass = posthog.getEventIcon(event.event);
    const eventName = posthog.formatEventName(event.event);

    console.log(`[renderTimeline] Event ${index} - iconClass:`, iconClass);
    console.log(`[renderTimeline] Event ${index} - eventName:`, eventName);

    // Format timestamp
    const date = new Date(event.timestamp);
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const dateStr = date.toLocaleDateString();

    // Get event details from properties
    const eventDetail = event.properties?.title ||
                       event.properties?.genre ||
                       event.properties?.mood ||
                       event.properties?.videoId ||
                       '';

    console.log(`[renderTimeline] Event ${index} - detail:`, eventDetail);

    return `
      <div class="timeline-event">
        <div class="timeline-icon">
          <i class="${iconClass}" aria-hidden="true"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">${eventName}</div>
          ${eventDetail ? `
            <div class="timeline-description">${eventDetail}</div>
          ` : ''}
          <div class="timeline-time">${dateStr} at ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');

  console.log('[renderTimeline] Final HTML length:', html.length);
  return html;
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

/**
 * Render sessions tab content
 */
function renderSessions(activity) {
  console.log('[renderSessions] Called with activity:', activity);
  console.log('[renderSessions] Activity length:', activity ? activity.length : 'null/undefined');

  if (!activity || activity.length === 0) {
    console.log('[renderSessions] No activity, showing empty state');
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-calendar-blank" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No sessions found</p>
      </div>
    `;
  }

  // Group events by session (session_started to session_ended or next session_started)
  const sessions = [];
  let currentSession = null;

  activity.forEach((event, index) => {
    if (event.event === 'session_started' || event.event === 'app_visible') {
      // Start new session
      if (currentSession) {
        sessions.push(currentSession);
      }
      currentSession = {
        startTime: event.timestamp,
        endTime: null,
        events: [event]
      };
    } else if (event.event === 'session_ended' || event.event === 'app_hidden') {
      // End current session
      if (currentSession) {
        currentSession.endTime = event.timestamp;
        currentSession.events.push(event);
        sessions.push(currentSession);
        currentSession = null;
      }
    } else if (currentSession) {
      // Add to current session
      currentSession.events.push(event);
    }
  });

  // Push last session if still open
  if (currentSession) {
    currentSession.endTime = new Date(); // Mark as ongoing
    sessions.push(currentSession);
  }

  console.log('[renderSessions] Found', sessions.length, 'sessions');

  if (sessions.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-calendar-blank" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No complete sessions found</p>
      </div>
    `;
  }

  const html = sessions.map((session, index) => {
    console.log(`[renderSessions] Session ${index}:`, session);

    const duration = Math.floor((session.endTime - session.startTime) / 1000 / 60); // minutes
    const date = new Date(session.startTime);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Count event types in this session
    const workouts = session.events.filter(e => e.event === 'workout_started').length;
    const songs = session.events.filter(e => e.event === 'music_played').length;

    return `
      <div class="timeline-event">
        <div class="timeline-icon">
          <i class="ph-fill ph-calendar-check" aria-hidden="true"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">Session ${sessions.length - index}</div>
          <div class="timeline-description">
            ${duration} min • ${workouts} workouts • ${songs} songs
          </div>
          <div class="timeline-time">${dateStr} at ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');

  console.log('[renderSessions] Final HTML length:', html.length);
  return html;
}

/**
 * Render preferences tab content
 */
function renderPreferences(activity) {
  console.log('[renderPreferences] Called with activity:', activity);
  console.log('[renderPreferences] Activity length:', activity ? activity.length : 'null/undefined');

  if (!activity || activity.length === 0) {
    console.log('[renderPreferences] No activity, showing empty state');
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-sliders" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No preferences data</p>
      </div>
    `;
  }

  // Extract preferences from activity
  const genres = {};
  const moods = {};
  const songs = {};

  activity.forEach(event => {
    // Count genre selections
    if (event.event === 'genre_selected' && event.properties?.genre) {
      const genre = event.properties.genre;
      genres[genre] = (genres[genre] || 0) + 1;
    }

    // Count mood selections
    if (event.event === 'mood_selected' && event.properties?.mood) {
      const mood = event.properties.mood;
      moods[mood] = (moods[mood] || 0) + 1;
    }

    // Count song plays
    if (event.event === 'music_played' && event.properties?.title) {
      const song = event.properties.title;
      songs[song] = (songs[song] || 0) + 1;
    }
  });

  // Sort and get top 5
  const topGenres = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMoods = Object.entries(moods).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topSongs = Object.entries(songs).sort((a, b) => b[1] - a[1]).slice(0, 5);

  console.log('[renderPreferences] Top genres:', topGenres);
  console.log('[renderPreferences] Top moods:', topMoods);
  console.log('[renderPreferences] Top songs:', topSongs);

  let html = '';

  // Render top genres
  if (topGenres.length > 0) {
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
          <i class="ph-fill ph-tag" style="margin-right: 0.5rem;"></i>Favorite Genres
        </h4>
        ${topGenres.map(([genre, count]) => `
          <div class="timeline-event">
            <div class="timeline-icon">
              <i class="ph-fill ph-music-note" aria-hidden="true"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${genre}</div>
              <div class="timeline-description">${count} selections</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render top moods
  if (topMoods.length > 0) {
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
          <i class="ph-fill ph-smiley" style="margin-right: 0.5rem;"></i>Favorite Moods
        </h4>
        ${topMoods.map(([mood, count]) => `
          <div class="timeline-event">
            <div class="timeline-icon">
              <i class="ph-fill ph-heart" aria-hidden="true"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${mood}</div>
              <div class="timeline-description">${count} selections</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render top songs
  if (topSongs.length > 0) {
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
          <i class="ph-fill ph-play-circle" style="margin-right: 0.5rem;"></i>Most Played Songs
        </h4>
        ${topSongs.map(([song, count]) => `
          <div class="timeline-event">
            <div class="timeline-icon">
              <i class="ph-fill ph-music-notes" aria-hidden="true"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${song}</div>
              <div class="timeline-description">${count} plays</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (!html) {
    console.log('[renderPreferences] No preferences found, showing empty state');
    return `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-sliders" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No preferences found</p>
      </div>
    `;
  }

  console.log('[renderPreferences] Final HTML length:', html.length);
  return html;
}