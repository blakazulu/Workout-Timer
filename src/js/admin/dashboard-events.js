/**
 * Admin Dashboard - Events Section
 * Displays all events with counts and statistics using modern design system
 */

import * as posthog from "./posthog-client.js";

/**
 * Render events section with breakdown and statistics
 */
export async function renderEventsSection() {
  console.log("[Events Section] ========== STARTING renderEventsSection ==========");

  const container = document.getElementById("events-section");
  console.log("[Events Section] events-section element:", container);

  if (!container) {
    console.error("[Events Section] events-section element NOT FOUND!");
    return;
  }

  try {
    console.log("[Events Section] Fetching data from PostHog...");

    // Get top events and recent activity
    const [topEvents, recentActivity] = await Promise.all([
      posthog.getTopEvents(30, 20),
      posthog.getRecentActivity(100)
    ]);

    console.log("[Events Section] Fetched topEvents:", topEvents);
    console.log("[Events Section] Fetched recentActivity:", recentActivity);

    // Calculate event statistics
    const stats = calculateEventStats(topEvents);
    console.log("[Events Section] Calculated stats:", stats);

    // Update the stats in the existing analytics section
    updateEventStats(stats);

    // Populate the events table
    populateEventsTable(recentActivity);

    console.log("[Events Section] ========== COMPLETED renderEventsSection ==========");

  } catch (error) {
    console.error("[Events Section] ========== ERROR in renderEventsSection ==========");
    console.error("[Events Section] Error:", error);
    console.error("[Events Section] Error stack:", error.stack);
    showEventsError(error);
  }
}

/**
 * Update event statistics in the analytics section
 */
function updateEventStats(stats) {
  const totalEventsEl = document.getElementById("total-events-count");
  const sessionEventsEl = document.getElementById("session-events-count");
  const musicEventsEl = document.getElementById("music-events-count");

  if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents.toLocaleString();
  if (sessionEventsEl) sessionEventsEl.textContent = stats.sessionEvents.toLocaleString();
  if (musicEventsEl) musicEventsEl.textContent = stats.musicEvents.toLocaleString();
}

/**
 * Populate events table with modern design
 */
function populateEventsTable(events) {
  const eventsTable = document.getElementById("events-table");
  if (!eventsTable) return;

  if (events.length === 0) {
    eventsTable.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
        <i class="ph ph-calendar-blank" style="font-size: 3rem; opacity: 0.3;"></i>
        <p style="margin-top: 1rem;">No events found</p>
      </div>
    `;
    return;
  }

  eventsTable.innerHTML = events.map(event => {
    const iconClass = posthog.getEventIcon(event.event);
    const eventName = posthog.formatEventName(event.event);
    const timeAgo = formatTimeAgo(event.timestamp);
    const eventDetail = event.properties?.title ||
      event.properties?.genre ||
      event.properties?.mood ||
      "";

    return `
      <div class="event-row">
        <div class="event-icon">
          <i class="${iconClass}" aria-hidden="true"></i>
        </div>
        <div class="event-info">
          <div class="event-name">${eventName}</div>
          <div class="event-details">
            <span class="event-time">${timeAgo}</span>
            ${eventDetail ? `<span class="event-subtitle">${eventDetail}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");
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
    e.event.includes("session") || e.event.includes("workout")
  ).reduce((sum, e) => sum + e.count, 0);

  const musicEvents = events.filter(e =>
    e.event.includes("music") || e.event.includes("play") || e.event.includes("song")
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
