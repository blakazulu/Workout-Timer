/**
 * PostHog Client-Side Query Module
 *
 * This module provides a clean interface for querying PostHog analytics data
 * directly from the admin dashboard without using localStorage.
 *
 * IMPORTANT: Requires Netlify function proxy to keep API key secure.
 * See: /netlify/functions/posthog-proxy.js
 */

const PROJECT_ID = "235590"; // Your PostHog project ID

/**
 * Query PostHog API via Netlify function proxy
 * @param {Object} query - PostHog query configuration
 * @returns {Promise<Object>} Query results
 */
export async function queryPostHog(query) {
  try {
    const response = await fetch("/.netlify/functions/posthog-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({query})
    });

    if (!response.ok) {
      throw new Error(`PostHog query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("[PostHog Client] Query failed:", error);
    throw error;
  }
}

/**
 * Parse PostHog trend results into simple format
 * @param {Object} results - Raw PostHog results
 * @returns {Object} Simplified data
 */
function parseTrendResults(results) {
  if (!results || !results.results || results.results.length === 0) {
    return {labels: [], datasets: []};
  }

  return {
    labels: results.results[0].labels || results.results[0].days,
    datasets: results.results.map(series => ({
      name: series.label || series.action?.custom_name || series.action?.name,
      data: series.data,
      total: series.count
    }))
  };
}

// ============================================================================
// PRESET QUERIES - Ready-to-use query builders
// ============================================================================

/**
 * Get workout statistics over time
 * @param {number} days - Number of days to query (default: 7)
 * @returns {Promise<Object>} Workout trend data
 */
export async function getWorkoutTrend(days = 7) {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "workout_started",
          custom_name: "Workouts Started",
          math: "total"
        },
        {
          kind: "EventsNode",
          event: "rep_completed",
          custom_name: "Reps Completed",
          math: "total"
        },
        {
          kind: "EventsNode",
          event: "workout_reset",
          custom_name: "Resets",
          math: "total"
        }
      ],
      interval: "day",
      dateRange: {
        date_from: `-${days}d`,
        date_to: null
      },
      trendsFilter: {
        display: "ActionsLineGraph"
      }
    }
  };

  const results = await queryPostHog(query);
  return parseTrendResults(results);
}

/**
 * Get music activity over time
 * @param {number} days - Number of days to query (default: 7)
 * @returns {Promise<Object>} Music trend data
 */
export async function getMusicTrend(days = 7) {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "music_played",
          custom_name: "Songs Played",
          math: "total"
        },
        {
          kind: "EventsNode",
          event: "music_paused",
          custom_name: "Paused",
          math: "total"
        },
        {
          kind: "EventsNode",
          event: "favorite_removed",
          custom_name: "Favorites",
          math: "total"
        }
      ],
      interval: "day",
      dateRange: {
        date_from: `-${days}d`,
        date_to: null
      },
      trendsFilter: {
        display: "ActionsLineGraph"
      }
    }
  };

  const results = await queryPostHog(query);
  return parseTrendResults(results);
}

/**
 * Get daily active users
 * @param {number} days - Number of days to query (default: 30)
 * @returns {Promise<Object>} User activity data
 */
export async function getDailyActiveUsers(days = 30) {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "session_started",
          custom_name: "Daily Active Users",
          math: "dau"  // Daily Active Users calculation
        }
      ],
      interval: "day",
      dateRange: {
        date_from: `-${days}d`,
        date_to: null
      },
      trendsFilter: {
        display: "ActionsLineGraph"
      }
    }
  };

  const results = await queryPostHog(query);
  return parseTrendResults(results);
}

/**
 * Get music genre breakdown
 * @param {number} days - Number of days to query (default: 30)
 * @returns {Promise<Object>} Genre distribution
 */
export async function getMusicGenreBreakdown(days = 30) {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "genre_selected",
          custom_name: "Genre Plays",
          math: "total"
        }
      ],
      breakdownFilter: {
        breakdown: "genre",
        breakdown_type: "event"
      },
      dateRange: {
        date_from: `-${days}d`,
        date_to: null
      },
      trendsFilter: {
        display: "ActionsPie"
      }
    }
  };

  const results = await queryPostHog(query);

  // Format for pie chart
  if (results.results) {
    const genreData = results.results.map(result => ({
      genre: result.breakdown_value || "Unknown",
      count: result.count
    }));

    return {
      labels: genreData.map(d => d.genre),
      data: genreData.map(d => d.count)
    };
  }

  return {labels: [], data: []};
}

/**
 * Get workout completion funnel
 * @returns {Promise<Object>} Funnel data
 */
export async function getWorkoutFunnel() {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "FunnelsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "session_started",
          custom_name: "Session Started"
        },
        {
          kind: "EventsNode",
          event: "workout_started",
          custom_name: "Workout Started"
        },
        {
          kind: "EventsNode",
          event: "rep_completed",
          custom_name: "Rep Completed"
        }
      ],
      funnelsFilter: {
        funnelWindowInterval: 30,
        funnelWindowIntervalUnit: "minute",
        funnelVizType: "steps"
      },
      dateRange: {
        date_from: "-30d",
        date_to: null
      }
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map((step, index) => ({
      step: index + 1,
      name: step.name,
      count: step.count,
      conversionRate: step.conversion_rate || 100
    }));
  }

  return [];
}

/**
 * Get top events (most frequent)
 * @param {number} days - Number of days to query (default: 30)
 * @param {number} limit - Number of top events to return (default: 10)
 * @returns {Promise<Array>} Top events
 */
export async function getTopEvents(days = 30, limit = 10) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          event,
          count() as total
        FROM events
        WHERE timestamp >= now() - interval ${days} day
        GROUP BY event
        ORDER BY total DESC
        LIMIT ${limit}
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map(row => ({
      event: row[0],
      count: row[1]
    }));
  }

  return [];
}

/**
 * Get session duration statistics
 * @param {number} days - Number of days to query (default: 30)
 * @returns {Promise<Object>} Session duration stats
 */
export async function getSessionDurations(days = 30) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          avg(properties.duration) as avg_duration,
          min(properties.duration) as min_duration,
          max(properties.duration) as max_duration,
          median(properties.duration) as median_duration
        FROM events
        WHERE event = 'session_ended'
          AND timestamp >= now() - interval ${days} day
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results && results.results.length > 0) {
    const [avg, min, max, median] = results.results[0];
    return {
      average: Math.round(avg / 60) || 0,      // Convert to minutes
      minimum: Math.round(min / 60) || 0,
      maximum: Math.round(max / 60) || 0,
      median: Math.round(median / 60) || 0
    };
  }

  return {average: 0, minimum: 0, maximum: 0, median: 0};
}

/**
 * Get total counts for key metrics
 * @param {number} days - Number of days to query (default: 30)
 * @returns {Promise<Object>} Key metrics
 */
export async function getKeyMetrics(days = 30) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          countIf(event = 'workout_started') as total_workouts,
          countIf(event = 'rep_completed') as total_reps,
          countIf(event = 'music_played') as total_songs,
          countIf(event = 'favorite_removed') as total_favorites,
          uniq(distinct_id) as unique_users
        FROM events
        WHERE timestamp >= now() - interval ${days} day
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results && results.results.length > 0) {
    const [workouts, reps, songs, favorites, users] = results.results[0];
    return {
      totalWorkouts: workouts || 0,
      totalReps: reps || 0,
      totalSongs: songs || 0,
      totalFavorites: favorites || 0,
      uniqueUsers: users || 0,
      avgRepsPerWorkout: workouts > 0 ? Math.round(reps / workouts) : 0
    };
  }

  return {
    totalWorkouts: 0,
    totalReps: 0,
    totalSongs: 0,
    totalFavorites: 0,
    uniqueUsers: 0,
    avgRepsPerWorkout: 0
  };
}

/**
 * Get recent activity timeline
 * @param {number} limit - Number of recent events (default: 50)
 * @returns {Promise<Array>} Recent events
 */
export async function getRecentActivity(limit = 50) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          event,
          timestamp,
          properties
        FROM events
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map(row => ({
      event: row[0],
      timestamp: row[1],
      properties: row[2]
    }));
  }

  return [];
}

/**
 * Get app visibility stats (foreground vs background)
 * @param {number} days - Number of days to query (default: 7)
 * @returns {Promise<Object>} Visibility stats
 */
export async function getAppVisibilityStats(days = 7) {
  const query = {
    kind: "InsightVizNode",
    source: {
      kind: "TrendsQuery",
      series: [
        {
          kind: "EventsNode",
          event: "app_visible",
          custom_name: "App Visible",
          math: "total"
        },
        {
          kind: "EventsNode",
          event: "app_hidden",
          custom_name: "App Hidden",
          math: "total"
        }
      ],
      interval: "day",
      dateRange: {
        date_from: `-${days}d`,
        date_to: null
      }
    }
  };

  const results = await queryPostHog(query);
  return parseTrendResults(results);
}

/**
 * Get PWA installation stats
 * @param {number} days - Number of days to query (default: 30)
 * @returns {Promise<Object>} PWA stats
 */
export async function getPWAStats(days = 30) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          countIf(event = 'pwa_install_prompt_shown') as prompts_shown,
          countIf(event = 'pwa_installed') as installs,
          countIf(event = 'pwa_launched') as launches
        FROM events
        WHERE timestamp >= now() - interval ${days} day
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results && results.results.length > 0) {
    const [shown, installed, launched] = results.results[0];
    const installRate = shown > 0 ? ((installed / shown) * 100).toFixed(1) : 0;

    return {
      promptsShown: shown || 0,
      installs: installed || 0,
      launches: launched || 0,
      installRate: parseFloat(installRate)
    };
  }

  return {
    promptsShown: 0,
    installs: 0,
    launches: 0,
    installRate: 0
  };
}

// ============================================================================
// COMPOSITE QUERIES - Combine multiple queries for dashboard views
// ============================================================================

/**
 * Get complete dashboard data
 * @returns {Promise<Object>} All dashboard data
 */
export async function getDashboardData() {
  try {
    const [
      keyMetrics,
      workoutTrend,
      musicTrend,
      dailyUsers,
      sessionDurations,
      topEvents,
      recentActivity
    ] = await Promise.all([
      getKeyMetrics(30),
      getWorkoutTrend(7),
      getMusicTrend(7),
      getDailyActiveUsers(30),
      getSessionDurations(30),
      getTopEvents(30, 10),
      getRecentActivity(50)
    ]);

    return {
      metrics: keyMetrics,
      charts: {
        workouts: workoutTrend,
        music: musicTrend,
        users: dailyUsers
      },
      sessions: sessionDurations,
      topEvents,
      recentActivity,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error("[PostHog Client] Failed to load dashboard data:", error);
    throw error;
  }
}

/**
 * Export all available data
 * @returns {Promise<Object>} Complete data export
 */
export async function exportAllData() {
  const [
    dashboardData,
    funnel,
    genres,
    visibility,
    pwaStats
  ] = await Promise.all([
    getDashboardData(),
    getWorkoutFunnel(),
    getMusicGenreBreakdown(30),
    getAppVisibilityStats(30),
    getPWAStats(90)
  ]);

  return {
    exportDate: new Date().toISOString(),
    dashboard: dashboardData,
    funnel,
    genres,
    visibility,
    pwa: pwaStats,
    source: "PostHog Analytics",
    projectId: PROJECT_ID
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format event name for display
 * @param {string} eventName - Raw event name
 * @returns {string} Formatted name
 */
export function formatEventName(eventName) {
  const eventNames = {
    "workout_started": "Workout Started",
    "workout_reset": "Workout Reset",
    "rep_completed": "Rep Completed",
    "music_played": "Music Played",
    "music_paused": "Music Paused",
    "music_stopped": "Music Stopped",
    "favorite_removed": "Favorite Removed",
    "session_started": "Session Started",
    "session_ended": "Session Ended",
    "app_visible": "App Visible",
    "app_hidden": "App Hidden",
    "search_opened": "Search Opened",
    "genre_selected": "Genre Selected",
    "mood_selected": "Mood Selected",
    "$pageview": "Page View",
    "$web_vitals": "Web Vitals"
  };

  return eventNames[eventName] || eventName;
}

/**
 * Get event icon for display
 * @param {string} eventName - Event name
 * @returns {string} Phosphor icon class
 */
export function getEventIcon(eventName) {
  const icons = {
    "workout_started": "ph-play-circle",
    "workout_reset": "ph-arrow-counter-clockwise",
    "rep_completed": "ph-check-circle",
    "music_played": "ph-music-note",
    "music_paused": "ph-pause-circle",
    "music_stopped": "ph-stop-circle",
    "favorite_removed": "ph-star",
    "session_started": "ph-sign-in",
    "session_ended": "ph-sign-out",
    "app_visible": "ph-eye",
    "app_hidden": "ph-eye-slash",
    "search_opened": "ph-magnifying-glass",
    "genre_selected": "ph-tag",
    "mood_selected": "ph-smiley",
    "$pageview": "ph-browsers",
    "$web_vitals": "ph-gauge"
  };

  return icons[eventName] || "ph-circle";
}

/**
 * Get list of users with their activity stats
 * @param {number} days - Number of days to look back (default: 30)
 * @param {number} limit - Maximum number of users to return (default: 100)
 * @returns {Promise<Array>} List of users
 */
export async function getUsers(days = 30, limit = 100) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          distinct_id,
          count() as total_events,
          min(timestamp) as first_seen,
          max(timestamp) as last_seen,
          countIf(event = 'workout_started') as workouts,
          countIf(event = 'music_played') as songs_played,
          countIf(event = 'session_started') as sessions
        FROM events
        WHERE timestamp >= now() - interval ${days} day
        GROUP BY distinct_id
        ORDER BY last_seen DESC
        LIMIT ${limit}
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map(row => ({
      userId: row[0],
      totalEvents: row[1],
      firstSeen: new Date(row[2]),
      lastSeen: new Date(row[3]),
      workouts: row[4],
      songsPlayed: row[5],
      sessions: row[6],
      // Calculate days active
      daysActive: Math.ceil((new Date(row[3]) - new Date(row[2])) / (1000 * 60 * 60 * 24))
    }));
  }

  return [];
}

/**
 * Get user activity timeline for a specific user
 * @param {string} userId - User's distinct_id
 * @param {number} limit - Number of recent events (default: 50)
 * @returns {Promise<Array>} User's event timeline
 */
export async function getUserActivity(userId, limit = 50) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          event,
          timestamp,
          properties
        FROM events
        WHERE distinct_id = '${userId}'
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map(row => ({
      event: row[0],
      timestamp: new Date(row[1]),
      properties: row[2]
    }));
  }

  return [];
}

/**
 * Get user cohort analysis (new vs returning)
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<Object>} Cohort stats
 */
export async function getUserCohorts(days = 30) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          countIf(sessions = 1) as new_users,
          countIf(sessions > 1) as returning_users,
          count() as total_users
        FROM (
          SELECT
            distinct_id,
            countIf(event = 'session_started') as sessions
          FROM events
          WHERE timestamp >= now() - interval ${days} day
          GROUP BY distinct_id
        )
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results && results.results.length > 0) {
    const [newUsers, returningUsers, totalUsers] = results.results[0];
    return {
      newUsers: newUsers || 0,
      returningUsers: returningUsers || 0,
      totalUsers: totalUsers || 0,
      returnRate: totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(1) : 0
    };
  }

  return {newUsers: 0, returningUsers: 0, totalUsers: 0, returnRate: 0};
}

/**
 * Get user engagement levels (power users, active, casual)
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<Object>} Engagement breakdown
 */
export async function getUserEngagement(days = 30) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          countIf(total_events >= 50) as power_users,
          countIf(total_events >= 10 AND total_events < 50) as active_users,
          countIf(total_events < 10) as casual_users
        FROM (
          SELECT
            distinct_id,
            count() as total_events
          FROM events
          WHERE timestamp >= now() - interval ${days} day
          GROUP BY distinct_id
        )
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results && results.results.length > 0) {
    const [powerUsers, activeUsers, casualUsers] = results.results[0];
    const total = powerUsers + activeUsers + casualUsers;

    return {
      powerUsers: powerUsers || 0,
      activeUsers: activeUsers || 0,
      casualUsers: casualUsers || 0,
      total,
      labels: ["Power Users (50+ events)", "Active Users (10-49 events)", "Casual Users (<10 events)"],
      data: [powerUsers || 0, activeUsers || 0, casualUsers || 0]
    };
  }

  return {
    powerUsers: 0,
    activeUsers: 0,
    casualUsers: 0,
    total: 0,
    labels: [],
    data: []
  };
}

/**
 * Get user retention by day
 * @param {number} days - Number of days to analyze (default: 7)
 * @returns {Promise<Array>} Daily user retention
 */
export async function getUserRetention(days = 7) {
  const query = {
    kind: "DataVisualizationNode",
    source: {
      kind: "HogQLQuery",
      query: `
        SELECT
          toDate(timestamp) as date,
          uniq(distinct_id) as unique_users
        FROM events
        WHERE timestamp >= now() - interval ${days} day
        GROUP BY date
        ORDER BY date ASC
      `
    }
  };

  const results = await queryPostHog(query);

  if (results.results) {
    return results.results.map(row => ({
      date: row[0],
      users: row[1]
    }));
  }

  return [];
}

/**
 * Check if PostHog proxy is available
 * @returns {Promise<boolean>} True if proxy is working
 */
export async function checkProxyHealth() {
  try {
    const response = await fetch("/.netlify/functions/posthog-proxy", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        query: {
          kind: "TrendsQuery",
          series: [{event: "$pageview", math: "total"}],
          interval: "day",
          dateRange: {date_from: "-1d"}
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error("[PostHog Client] Proxy health check failed:", error);
    return false;
  }
}
