/**
 * Admin Dashboard Controller - Modern 2025 Redesign
 * Chart.js integration with clean, modern visualizations
 */

import {logout} from "./auth.js";
import * as metrics from "./metrics-calculator.js";
import * as posthogData from "./posthog-data.js";
import {initializeUserModal, renderUsersSection} from "./dashboard-users.js";
import {renderEventsSection} from "./dashboard-events.js";

// Chart instances
let charts = {
  activity: null,
  genre: null,
  topSongs: null,
  duration: null
};

// Dashboard state
let refreshInterval = null;
const REFRESH_RATE = 30000; // 30 seconds

/**
 * Initialize the admin dashboard
 */
export function initDashboard() {
  console.log("[Admin Dashboard] Initializing modern dashboard...");

  // Log dashboard view to PostHog
  posthogData.logDashboardView();

  // Initialize user modal event listeners
  initializeUserModal();

  // Load and render dashboard
  renderDashboard();

  // Start auto-refresh
  startAutoRefresh();

  // Set up event listeners
  setupEventListeners();

  console.log("[Admin Dashboard] Dashboard initialized");
}

/**
 * Render the complete dashboard
 */
export async function renderDashboard() {
  console.log("[Admin Dashboard] ========== STARTING renderDashboard ==========");
  try {
    console.log("[Admin Dashboard] Getting metrics...");
    const allMetrics = metrics.getAllMetrics();
    console.log("[Admin Dashboard] Metrics retrieved:", allMetrics);

    // Render each section
    console.log("[Admin Dashboard] Rendering metrics cards...");
    renderMetricsCards(allMetrics.overview);
    console.log("[Admin Dashboard] Rendering activity chart...");
    renderActivityChart(allMetrics);
    console.log("[Admin Dashboard] Rendering genre chart...");
    renderGenreChart(allMetrics.musicStats);
    console.log("[Admin Dashboard] Rendering top songs chart...");
    renderTopSongsChart(allMetrics);
    console.log("[Admin Dashboard] Rendering duration chart...");
    renderDurationChart(allMetrics);
    console.log("[Admin Dashboard] Rendering recent activity...");
    renderRecentActivity(allMetrics.recentActivity);
    console.log("[Admin Dashboard] Rendering system info...");
    renderSystemInfo(allMetrics.system);
    console.log("[Admin Dashboard] Rendering PostHog panel...");
    renderPostHogPanel();

    // Render PostHog user and event sections
    console.log("[Admin Dashboard] About to render users section...");
    await renderUsersSection();
    console.log("[Admin Dashboard] Users section complete!");

    console.log("[Admin Dashboard] About to render events section...");
    await renderEventsSection();
    console.log("[Admin Dashboard] Events section complete!");

    // Update last sync time
    console.log("[Admin Dashboard] Updating sync time...");
    updateSyncTime();

    console.log("[Admin Dashboard] ========== COMPLETED renderDashboard ==========");
  } catch (error) {
    console.error("[Admin Dashboard] ========== ERROR in renderDashboard ==========");
    console.error("[Admin Dashboard] Error:", error);
    console.error("[Admin Dashboard] Error stack:", error.stack);
  }
}

/**
 * Render key metrics cards at the top
 */
function renderMetricsCards(overview) {
  const container = document.getElementById("metrics-grid");
  if (!container) return;

  const history = metrics.getSongHistory();
  const favorites = metrics.getFavorites();

  // Calculate unique songs
  const uniqueSongs = new Set(history.map(s => s.videoId || s.id)).size;

  const metrics_data = [
    {
      label: "Total Sessions",
      value: (overview.totalSessions || 0).toLocaleString(),
      icon: "ph-activity",
      color: "#3b82f6",
      trend: calculateTrend(history, 7)
    },
    {
      label: "Total Workouts",
      value: (overview.totalWorkouts || 0).toLocaleString(),
      icon: "ph-barbell",
      color: "#8b5cf6",
      trend: null
    },
    {
      label: "Favorite Tracks",
      value: (overview.totalFavorites || 0).toLocaleString(),
      icon: "ph-heart",
      color: "#ec4899",
      trend: calculateTrend(favorites, 7)
    },
    {
      label: "Avg Duration",
      value: `${overview.avgWorkoutDuration || 0}min`,
      icon: "ph-timer",
      color: "#10b981",
      trend: null
    }
  ];

  container.innerHTML = metrics_data.map(stat => `
    <div class="stat-card fade-in" style="--stat-color: ${stat.color};">
      <div class="stat-header">
        <div class="stat-icon" style="background: linear-gradient(135deg, ${stat.color}, ${stat.color}80);">
          <i class="ph-fill ${stat.icon}" aria-hidden="true"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stat.value}</span>
          <span class="stat-label">${stat.label}</span>
        </div>
      </div>
      ${stat.trend !== null ? `
        <div class="stat-change ${stat.trend > 0 ? "positive" : stat.trend < 0 ? "negative" : "neutral"}">
          <i class="ph-fill ${stat.trend > 0 ? "ph-trend-up" : stat.trend < 0 ? "ph-trend-down" : "ph-minus"}" aria-hidden="true"></i>
          <span>${stat.trend > 0 ? "+" : ""}${stat.trend}% vs last week</span>
        </div>
      ` : ""}
    </div>
  `).join("");
}

/**
 * Calculate trend percentage compared to previous period
 */
function calculateTrend(data, days) {
  if (!data || data.length === 0) return 0;

  const now = Date.now();
  const daysAgo = now - (days * 24 * 60 * 60 * 1000);
  const twiceDaysAgo = now - (days * 2 * 24 * 60 * 60 * 1000);

  const currentPeriod = data.filter(item => {
    const timestamp = new Date(item.timestamp || item.playedAt || item.favoritedAt || item.addedAt).getTime();
    return timestamp >= daysAgo;
  }).length;

  const previousPeriod = data.filter(item => {
    const timestamp = new Date(item.timestamp || item.playedAt || item.favoritedAt || item.addedAt).getTime();
    return timestamp >= twiceDaysAgo && timestamp < daysAgo;
  }).length;

  if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
}

/**
 * Render activity over time chart (line chart)
 */
function renderActivityChart(allMetrics) {
  const canvas = document.getElementById("activity-chart");
  if (!canvas) return;

  // Destroy existing chart
  if (charts.activity) {
    charts.activity.destroy();
  }

  // Get last 7 days of data
  const days = 7;
  const labels = [];
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString("en-US", {month: "short", day: "numeric"}));

    // Count activities for this day
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

    const count = metrics.getSongHistory().filter(item =>
      item.timestamp >= dayStart && item.timestamp <= dayEnd
    ).length;

    data.push(count);
  }

  const ctx = canvas.getContext("2d");
  charts.activity = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Sessions",
        data: data,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "#3b82f6",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => `${item.parsed.y} sessions`
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
            drawBorder: false
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
            drawBorder: false
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11
            },
            precision: 0
          }
        }
      }
    }
  });
}

/**
 * Render genre distribution chart (doughnut chart)
 */
function renderGenreChart(musicStats) {
  const canvas = document.getElementById("genre-chart");
  if (!canvas) return;

  if (charts.genre) {
    charts.genre.destroy();
  }

  // Get real genre data from song history
  const history = metrics.getSongHistory();
  const genreCounts = {};

  history.forEach(song => {
    const genre = song.genre || "Unknown";
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  // Convert to array and sort
  const genreData = Object.entries(genreCounts)
    .map(([genre, count]) => ({genre, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7); // Top 7 genres

  // Fallback if no data
  if (genreData.length === 0) {
    genreData.push(
      {genre: "Workout", count: 1},
      {genre: "EDM", count: 1},
      {genre: "Rock", count: 1}
    );
  }

  const labels = genreData.map(g => g.genre);
  const data = genreData.map(g => g.count);
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#ef4444"
  ];

  const ctx = canvas.getContext("2d");
  charts.genre = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: "#0a0e27",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#cbd5e1",
            padding: 15,
            font: {
              size: 11
            },
            usePointStyle: true,
            pointStyle: "circle"
          }
        },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "#3b82f6",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (item) => `${item.label}: ${item.parsed} plays`
          }
        }
      }
    }
  });
}

/**
 * Render top songs chart (horizontal bar chart)
 */
function renderTopSongsChart(allMetrics) {
  const canvas = document.getElementById("top-songs-chart");
  if (!canvas) return;

  if (charts.topSongs) {
    charts.topSongs.destroy();
  }

  // Get top songs from history
  const history = metrics.getSongHistory();

  // Count plays per song
  const songCounts = {};
  history.forEach(song => {
    const id = song.videoId || song.id || song.title;
    if (!songCounts[id]) {
      songCounts[id] = {
        title: song.title || "Unknown",
        playCount: 0
      };
    }
    songCounts[id].playCount++;
  });

  // Convert to array and sort
  const topSongs = Object.values(songCounts)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5);

  // Fallback if no data
  if (topSongs.length === 0) {
    topSongs.push(
      {title: "No songs yet", playCount: 0}
    );
  }

  const labels = topSongs.map(s => {
    const maxLength = 30;
    return s.title.length > maxLength ? s.title.substring(0, maxLength) + "..." : s.title;
  });
  const data = topSongs.map(s => s.playCount);

  const ctx = canvas.getContext("2d");
  charts.topSongs = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Plays",
        data: data,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(16, 185, 129, 0.9)"
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "#10b981",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items) => topSongs[items[0].dataIndex].title,
            label: (item) => `${item.parsed.x} plays`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
            drawBorder: false
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11
            },
            precision: 0
          }
        },
        y: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: "#cbd5e1",
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

/**
 * Render session duration distribution chart (bar chart)
 */
function renderDurationChart(allMetrics) {
  const canvas = document.getElementById("duration-chart");
  if (!canvas) return;

  if (charts.duration) {
    charts.duration.destroy();
  }

  // Get duration buckets
  const history = metrics.getSongHistory();
  const buckets = {
    "< 5 min": 0,
    "5-10 min": 0,
    "10-20 min": 0,
    "20-30 min": 0,
    "30+ min": 0
  };

  history.forEach(item => {
    const duration = item.duration || 0;
    const minutes = duration / 60;

    if (minutes < 5) buckets["< 5 min"]++;
    else if (minutes < 10) buckets["5-10 min"]++;
    else if (minutes < 20) buckets["10-20 min"]++;
    else if (minutes < 30) buckets["20-30 min"]++;
    else buckets["30+ min"]++;
  });

  const labels = Object.keys(buckets);
  const data = Object.values(buckets);

  const ctx = canvas.getContext("2d");
  charts.duration = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Sessions",
        data: data,
        backgroundColor: "rgba(6, 182, 212, 0.7)",
        borderColor: "#06b6d4",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(6, 182, 212, 0.9)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.9)",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "#06b6d4",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (item) => `${item.parsed.y} sessions`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: "#cbd5e1",
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
            drawBorder: false
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11
            },
            precision: 0
          }
        }
      }
    }
  });
}

/**
 * Render recent activity timeline
 */
function renderRecentActivity(recentActivity) {
  const container = document.getElementById("recent-activity");
  const countElement = document.getElementById("activity-count");

  if (!container) return;

  const activities = recentActivity.slice(0, 20);
  if (countElement) {
    countElement.textContent = `Showing ${activities.length} recent activities`;
  }

  if (activities.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="text-align: center; padding: 2rem; opacity: 0.5;">
        <i class="ph ph-clipboard" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.3;"></i>
        No recent activity
      </div>
    `;
    return;
  }

  container.innerHTML = activities.map(activity => {
    const timeAgo = getTimeAgo(new Date(activity.timestamp).getTime());
    const icon = getActivityIcon(activity.type);
    const color = getActivityColor(activity.type);

    // Extract info from description or metadata
    const description = activity.description || "Activity";
    const eventType = activity.type === "music_played" ? "played" :
      activity.type === "favorite_added" ? "favorited" :
        activity.type;

    return `
      <div class="activity-item">
        <div class="activity-icon" style="background: linear-gradient(135deg, ${color}, ${color}80);">
          <i class="${icon}" aria-hidden="true"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${description}</div>
          <div class="activity-description">${eventType}</div>
        </div>
        <div class="activity-time">${timeAgo}</div>
      </div>
    `;
  }).join("");
}

/**
 * Get activity icon based on action type
 */
function getActivityIcon(type) {
  const icons = {
    "music_played": "ph-fill ph-play-circle",
    "favorite_added": "ph-fill ph-heart",
    "search": "ph-fill ph-magnifying-glass",
    "shuffle": "ph-fill ph-shuffle",
    "played": "ph-fill ph-play-circle",
    "favorited": "ph-fill ph-heart"
  };
  return icons[type] || "ph-fill ph-activity";
}

/**
 * Get activity color based on action type
 */
function getActivityColor(type) {
  const colors = {
    "music_played": "#3b82f6",
    "favorite_added": "#ec4899",
    "search": "#8b5cf6",
    "shuffle": "#10b981",
    "played": "#3b82f6",
    "favorited": "#ec4899"
  };
  return colors[type] || "#64748b";
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Render system information panel
 */
function renderSystemInfo(system) {
  const container = document.getElementById("system-info");
  if (!container) return;

  const pwaStatus = system.pwa?.status || "Not Installed";
  const analyticsStatus = system.analytics?.enabled ? "Enabled" : "Disabled";
  const storageUsed = formatBytes(system.localStorage?.used || 0);

  container.innerHTML = `
    <div class="system-info-item">
      <span class="system-info-label">PWA Status</span>
      <span class="system-info-value">${pwaStatus}</span>
    </div>
    <div class="system-info-item">
      <span class="system-info-label">Analytics</span>
      <span class="system-info-value ${analyticsStatus === "Enabled" ? "enabled" : "disabled"}">${analyticsStatus}</span>
    </div>
    <div class="system-info-item">
      <span class="system-info-label">Storage</span>
      <span class="system-info-value mono">${storageUsed}</span>
    </div>
  `;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

/**
 * Render PostHog integration panel
 */
function renderPostHogPanel() {
  const container = document.getElementById("posthog-panel");
  const statusDot = document.getElementById("posthog-status");

  if (!container) return;

  // Get PostHog analytics data
  const analytics = posthogData.getPostHogAnalytics();

  if (analytics.available) {
    statusDot?.classList.remove("offline");
    statusDot?.classList.add("online");

    const session = analytics.session || {};
    const config = analytics.config || {};

    container.innerHTML = `
      <div class="system-info-item">
        <span class="system-info-label">Status</span>
        <span class="system-info-value enabled">${analytics.status}</span>
      </div>
      <div class="system-info-item">
        <span class="system-info-label">Session ID</span>
        <span class="system-info-value mono">${session.sessionId ? session.sessionId.substring(0, 12) + "..." : "N/A"}</span>
      </div>
      <div class="system-info-item">
        <span class="system-info-label">Recording</span>
        <span class="system-info-value ${config.sessionRecording ? "enabled" : "disabled"}">${config.sessionRecording ? "Active" : "Inactive"}</span>
      </div>
      <div class="system-info-item">
        <span class="system-info-label">Tracked Events</span>
        <span class="system-info-value">${analytics.trackedEvents?.length || 0} types</span>
      </div>
    `;
  } else {
    statusDot?.classList.remove("online");
    statusDot?.classList.add("offline");

    container.innerHTML = `
      <div class="text-center" style="text-align: center; padding: 1rem; opacity: 0.5;">
        <i class="ph ph-warning-circle" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem; opacity: 0.3;"></i>
        ${analytics.reason || "Not connected"}
      </div>
    `;
  }
}

/**
 * Update sync time display
 */
function updateSyncTime() {
  const syncElement = document.getElementById("last-sync");
  if (syncElement) {
    const now = new Date().toLocaleTimeString();
    syncElement.querySelector("span:last-child").textContent = `Last synced: ${now}`;
  }
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    console.log("[Admin Dashboard] Auto-refreshing...");
    renderDashboard();
  }, REFRESH_RATE);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      const icon = refreshBtn.querySelector("i");
      icon.style.animation = "spin 0.5s linear";
      setTimeout(() => {
        icon.style.animation = "";
      }, 500);

      renderDashboard();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });
  }

  // Export data button
  const exportBtn = document.getElementById("export-data-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      posthogData.logAdminAction("export_data");
      exportDashboardData();
    });
  }

  // PostHog link button
  const posthogBtn = document.getElementById("posthog-link-btn");
  if (posthogBtn) {
    posthogBtn.addEventListener("click", () => {
      posthogData.logAdminAction("open_posthog_dashboard");
      window.open("https://app.posthog.com", "_blank");
    });
  }

  // Clear cache button
  const clearBtn = document.getElementById("clear-cache-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        posthogData.logAdminAction("clear_data");
        clearDashboardData();
      }
    });
  }
}

/**
 * Export dashboard data as JSON
 */
function exportDashboardData() {
  const allMetrics = metrics.getAllMetrics();
  const dataStr = JSON.stringify(allMetrics, null, 2);
  const dataBlob = new Blob([dataStr], {type: "application/json"});

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cycle-analytics-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Clear all dashboard data
 */
function clearDashboardData() {
  localStorage.removeItem("song_history");
  localStorage.removeItem("favorites");

  // Refresh dashboard
  renderDashboard();

  alert("All data has been cleared.");
}

/**
 * Cleanup on page unload
 */
export function cleanup() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Destroy all charts
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
}
