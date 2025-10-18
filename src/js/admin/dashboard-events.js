/**
 * Admin Dashboard - Events Section
 * Displays all events with counts and statistics using modern design system
 */

import * as posthog from "./posthog-client.js";

/**
 * Render events section with breakdown and statistics
 */
export async function renderEventsSection() {
  const container = document.getElementById("events-section");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="analytics-grid">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon total-events">
              <i class="ph-fill ph-lightning" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">Loading...</span>
              <span class="stat-label">Total Events</span>
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
    // Get top events and recent activity
    const [topEvents, recentActivity] = await Promise.all([
      posthog.getTopEvents(30, 20),
      posthog.getRecentActivity(100)
    ]);

    // Calculate event statistics
    const stats = calculateEventStats(topEvents);

    // Update the stats in the existing analytics section
    updateEventStats(stats);
    
    // Populate the events table
    populateEventsTable(recentActivity);
    
    // Update the events count in the analytics section
    updateEventsCount(stats);

  } catch (error) {
    console.error("[Events Section] Error loading events:", error);
    showEventsError(error);
  }
}

/**
 * Update event statistics in the analytics section
 */
function updateEventStats(stats) {
  const totalEventsEl = document.getElementById('total-events-count');
  const sessionEventsEl = document.getElementById('session-events-count');
  const musicEventsEl = document.getElementById('music-events-count');

  if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents.toLocaleString();
  if (sessionEventsEl) sessionEventsEl.textContent = stats.sessionEvents || 0;
  if (musicEventsEl) sessionEventsEl.textContent = stats.musicEvents || 0;
}

/**
 * Update events count in the main analytics section
 */
function updateEventsCount(stats) {
  // This will be handled by the main analytics section
  console.log("[Events] Stats updated:", stats);
}

/**
 * Populate events table with modern design
 */
function populateEventsTable(events) {
  const eventsTable = document.getElementById('events-table');
  if (!eventsTable) return;

  eventsTable.innerHTML = events.map(event => {
    const iconClass = posthog.getEventIcon(event.event);
    const eventName = posthog.formatEventName(event.event);
    const timeAgo = formatTimeAgo(event.timestamp);
    const eventType = getEventType(event.event);

    return `
      <div class="event-row" onclick="showEventDetails('${event.event}', ${JSON.stringify(event).replace(/"/g, '&quot;')})">
        <div class="event-icon">
          <i class="ph-fill ph-${iconClass}" aria-hidden="true"></i>
        </div>
        <div class="event-info">
          <div class="event-name">${eventName}</div>
          <div class="event-details">
            <span class="event-status ${eventType}">${eventType}</span>
            <span class="event-time">${timeAgo}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Show event details in a modal
 */
function showEventDetails(eventName, eventData) {
  // This could open a modal with detailed event information
  console.log('Event details:', eventName, eventData);
  
  // For now, just show an alert - in the future this could open a modal
  alert(`Event: ${eventName}\nTime: ${formatTimeAgo(eventData.timestamp)}\nProperties: ${JSON.stringify(eventData.properties, null, 2)}`);
}

/**
 * Get event type for styling
 */
function getEventType(eventName) {
  if (eventName.includes('session') || eventName.includes('workout')) return 'active';
  if (eventName.includes('music') || eventName.includes('play')) return 'active';
  if (eventName.includes('error') || eventName.includes('failed')) return 'inactive';
  return 'active';
}

/**
 * Show error state
 */
function showEventsError(error) {
  const container = document.getElementById("events-section");
  if (!container) return;

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="table-card">
        <div class="table-header">
          <h3>Event Analytics</h3>
        </div>
        <div class="table-container">
          <div style="text-align: center; padding: 3rem; color: var(--error-500);">
            <i class="ph ph-warning-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Failed to load events</h3>
            <p style="color: var(--text-tertiary); font-size: 0.875rem;">${error.message}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Calculate event statistics with enhanced data
 */
function calculateEventStats(events) {
  const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
  const uniqueEvents = events.length;
  const mostCommon = events.length > 0 ? events[0].event : "none";
  const mostCommonCount = events.length > 0 ? events[0].count : 0;
  
  // Calculate session and music events
  const sessionEvents = events.filter(e => 
    e.event.includes('session') || e.event.includes('workout')
  ).reduce((sum, e) => sum + e.count, 0);
  
  const musicEvents = events.filter(e => 
    e.event.includes('music') || e.event.includes('play') || e.event.includes('song')
  ).reduce((sum, e) => sum + e.count, 0);

  return {
    totalEvents,
    uniqueEvents,
    mostCommon,
    mostCommonCount,
    sessionEvents,
    musicEvents
  };
}

/**
 * Make showEventDetails globally available
 */
window.showEventDetails = showEventDetails;

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
  return "Just now";
}
