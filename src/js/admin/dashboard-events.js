/**
 * Admin Dashboard - Events Section
 * Displays all events with counts and statistics
 */

import * as posthog from './posthog-client.js';

/**
 * Render events section with breakdown and statistics
 */
export async function renderEventsSection() {
  const container = document.getElementById('events-section');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading events...</div>';

  try {
    // Get top events and recent activity
    const [topEvents, recentActivity] = await Promise.all([
      posthog.getTopEvents(30, 20),
      posthog.getRecentActivity(100)
    ]);

    // Calculate event statistics
    const stats = calculateEventStats(topEvents);

    // Render event overview
    const overviewHTML = `
      <div class="admin-grid admin-grid-4" style="margin-bottom: 2rem;">
        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #3b82f6;">
            <i class="ph-fill ph-lightning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Events</div>
            <div class="stat-value">${stats.totalEvents.toLocaleString()}</div>
            <div class="stat-subtitle">Last 30 days</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #8b5cf6;">
            <i class="ph-fill ph-list-dashes"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Event Types</div>
            <div class="stat-value">${stats.uniqueEvents}</div>
            <div class="stat-subtitle">Different actions</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #00ffc8;">
            <i class="ph-fill ph-trophy"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Most Common</div>
            <div class="stat-value-text">${posthog.formatEventName(stats.mostCommon)}</div>
            <div class="stat-subtitle">${stats.mostCommonCount} times</div>
          </div>
        </div>

        <div class="admin-card stat-card">
          <div class="stat-icon" style="--icon-color: #ec4899;">
            <i class="ph-fill ph-trend-up"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Avg per Day</div>
            <div class="stat-value">${Math.round(stats.totalEvents / 30)}</div>
            <div class="stat-subtitle">Events/day</div>
          </div>
        </div>
      </div>
    `;

    // Render events breakdown table
    const eventsTableHTML = `
      <div class="admin-card">
        <div style="padding: var(--admin-space-xl);">
          <div class="chart-title" style="margin-bottom: var(--admin-space-lg);">
            <div class="chart-icon" style="--icon-color-1: #8b5cf6; --icon-color-2: #ec4899;">
              <i class="ph-fill ph-list-bullets"></i>
            </div>
            <span>All Events (${topEvents.length} types)</span>
          </div>

          <div class="events-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            ${topEvents.map((event, index) => {
              const percentage = (event.count / stats.totalEvents * 100).toFixed(1);
              const rank = index + 1;
              const iconClass = posthog.getEventIcon(event.event);
              const eventName = posthog.formatEventName(event.event);

              return `
                <div class="event-card" style="background: var(--admin-glass); border-radius: var(--admin-radius-md); padding: 1.25rem; border: 1px solid var(--admin-border); position: relative; overflow: hidden;">
                  <!-- Rank Badge -->
                  <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: var(--admin-accent-cyan); color: var(--admin-bg-primary); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                    ${rank}
                  </div>

                  <!-- Event Icon and Name -->
                  <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: var(--admin-radius-md); background: linear-gradient(135deg, var(--admin-accent-cyan), var(--admin-accent-purple)); display: flex; align-items: center; justify-content: center;">
                      <i class="${iconClass}" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; margin-bottom: 0.25rem;">${eventName}</div>
                      <div style="font-size: 0.75rem; color: var(--admin-text-muted); font-family: 'JetBrains Mono', monospace;">${event.event}</div>
                    </div>
                  </div>

                  <!-- Event Count -->
                  <div style="margin-bottom: 0.75rem;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--admin-accent-cyan);">${event.count.toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Total Occurrences</div>
                  </div>

                  <!-- Percentage Bar -->
                  <div style="position: relative; height: 8px; background: var(--admin-bg-secondary); border-radius: 999px; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--admin-accent-cyan), var(--admin-accent-purple)); width: ${percentage}%; transition: width 0.3s ease;"></div>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--admin-text-muted); margin-top: 0.5rem; text-align: right;">
                    ${percentage}% of all events
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Render recent activity feed
    const recentActivityHTML = `
      <div class="admin-card" style="margin-top: 2rem;">
        <div style="padding: var(--admin-space-xl);">
          <div class="chart-title" style="margin-bottom: var(--admin-space-lg);">
            <div class="chart-icon" style="--icon-color-1: #10b981; --icon-color-2: #06b6d4;">
              <i class="ph-fill ph-activity"></i>
            </div>
            <span>Live Activity Feed (Last ${recentActivity.length} events)</span>
          </div>

          <div class="activity-feed admin-scrollbar" style="max-height: 600px; overflow-y: auto;">
            ${renderActivityFeed(recentActivity)}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = overviewHTML + eventsTableHTML + recentActivityHTML;

  } catch (error) {
    console.error('[Events Section] Error loading events:', error);
    container.innerHTML = `
      <div class="admin-card" style="padding: var(--admin-space-xl);">
        <div style="text-align: center; color: var(--admin-accent-red);">
          <i class="ph ph-warning-circle" style="font-size: 3rem;"></i>
          <p style="margin-top: 1rem;">Failed to load events</p>
          <p style="font-size: 0.875rem; opacity: 0.7;">${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Calculate event statistics
 */
function calculateEventStats(events) {
  const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
  const uniqueEvents = events.length;
  const mostCommon = events.length > 0 ? events[0].event : 'none';
  const mostCommonCount = events.length > 0 ? events[0].count : 0;

  return {
    totalEvents,
    uniqueEvents,
    mostCommon,
    mostCommonCount
  };
}

/**
 * Render activity feed
 */
function renderActivityFeed(activities) {
  if (activities.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">
        <i class="ph ph-empty" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No recent activity</p>
      </div>
    `;
  }

  return activities.map((activity, index) => {
    const iconClass = posthog.getEventIcon(activity.event);
    const eventName = posthog.formatEventName(activity.event);
    const timeAgo = formatTimeAgo(activity.timestamp);

    return `
      <div class="activity-item" style="
        padding: 1rem;
        border-bottom: 1px solid var(--admin-border);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: background 0.2s;
      "
      onmouseover="this.style.background='rgba(255,255,255,0.02)'"
      onmouseout="this.style.background='transparent'">
        <!-- Icon -->
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--admin-accent-cyan), var(--admin-accent-purple)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <i class="${iconClass}" style="font-size: 1.25rem; color: white;"></i>
        </div>

        <!-- Content -->
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${eventName}</div>
          <div style="font-size: 0.75rem; color: var(--admin-text-muted);">
            ${activity.properties && activity.properties.title ? activity.properties.title : activity.event}
          </div>
        </div>

        <!-- Time -->
        <div style="font-size: 0.75rem; color: var(--admin-text-muted); white-space: nowrap; flex-shrink: 0;">
          ${timeAgo}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 30) return `${seconds}s ago`;
  return 'Just now';
}
