/**
 * Metrics Calculator Module
 * Calculates analytics metrics from localStorage data
 *
 * This module reads data from:
 * - workout-timer-settings: User settings (duration, reps, etc.)
 * - workout-timer-favorites: Favorite songs
 * - workout-timer-song-history: Song playback history
 * - analytics_opt_out: Analytics opt-out status
 * - admin_events_log: Custom events log (if exists)
 */

/**
 * Get all localStorage data safely
 * @param {string} key - localStorage key
 * @returns {any} Parsed data or default value
 */
function getLocalStorageData(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Get user settings
 * @returns {Object} Settings object
 */
export function getSettings() {
  return getLocalStorageData('workout-timer-settings', {
    duration: 30,
    alertTime: 3,
    repetitions: 3,
    restTime: 10
  });
}

/**
 * Get favorites data
 * @returns {Array} Array of favorite songs
 */
export function getFavorites() {
  return getLocalStorageData('workout-timer-favorites', []);
}

/**
 * Get song history
 * @returns {Array} Array of played songs
 */
export function getSongHistory() {
  return getLocalStorageData('workout-timer-song-history', []);
}

/**
 * Calculate total workouts completed
 * Estimated from song play history (each session = 1 workout)
 * @returns {number} Total workouts
 */
export function getTotalWorkouts() {
  const history = getSongHistory();
  // Each unique day with song plays = 1 workout session
  const uniqueDates = new Set(
    history.map(song => new Date(song.playedAt).toDateString())
  );
  return uniqueDates.size;
}

/**
 * Calculate total sessions
 * @returns {number} Total sessions
 */
export function getTotalSessions() {
  const history = getSongHistory();
  return history.length; // Each song play = 1 session
}

/**
 * Get most popular music genres/moods
 * @returns {Object} Genre/mood statistics
 */
export function getMusicStats() {
  // Since we don't track genres/moods in localStorage, return placeholder
  // In a real app, this would parse from song history metadata
  return {
    topGenres: [
      { name: 'Workout', count: 0 },
      { name: 'EDM', count: 0 },
      { name: 'Rock', count: 0 }
    ],
    topMoods: [
      { name: 'Energetic', count: 0 },
      { name: 'Intense', count: 0 },
      { name: 'Focus', count: 0 }
    ]
  };
}

/**
 * Calculate average workout duration
 * @returns {number} Average duration in minutes
 */
export function getAverageWorkoutDuration() {
  const settings = getSettings();
  const history = getSongHistory();

  if (history.length === 0) {
    return settings.duration || 30;
  }

  // Calculate average from song durations
  const totalDuration = history.reduce((sum, song) => sum + (song.duration || 0), 0);
  const avgSeconds = totalDuration / history.length;
  return Math.round(avgSeconds / 60); // Convert to minutes
}

/**
 * Calculate completion rate
 * @returns {number} Completion rate percentage
 */
export function getCompletionRate() {
  // This would require tracking started vs completed workouts
  // For now, return estimated 85% (placeholder)
  return 85;
}

/**
 * Check PWA install status
 * @returns {Object} PWA status
 */
export function getPWAStatus() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstalled = window.navigator.standalone || isStandalone;

  return {
    installed: isInstalled,
    standalone: isStandalone,
    status: isInstalled ? 'Installed' : 'Not Installed'
  };
}

/**
 * Get recent events (from custom log or create from history)
 * @param {number} limit - Number of events to return
 * @returns {Array} Array of recent events
 */
export function getRecentEvents(limit = 50) {
  const events = [];

  // Add song history events
  const history = getSongHistory();
  history.slice(0, limit).forEach(song => {
    events.push({
      type: 'music_played',
      timestamp: song.playedAt,
      description: `Played: ${song.title}`,
      metadata: {
        videoId: song.videoId,
        channel: song.channel,
        playCount: song.playCount
      }
    });
  });

  // Add favorite events
  const favorites = getFavorites();
  favorites.slice(0, 10).forEach(fav => {
    events.push({
      type: 'favorite_added',
      timestamp: fav.favoritedAt,
      description: `Favorited: ${fav.title}`,
      metadata: {
        videoId: fav.videoId
      }
    });
  });

  // Sort by timestamp (most recent first)
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return events.slice(0, limit);
}

/**
 * Get most played songs
 * @param {number} limit - Number of songs to return
 * @returns {Array} Most played songs
 */
export function getMostPlayedSongs(limit = 10) {
  const history = getSongHistory();

  return history
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, limit);
}

/**
 * Get favorites count
 * @returns {number} Number of favorites
 */
export function getFavoritesCount() {
  return getFavorites().length;
}

/**
 * Get most favorited songs
 * @param {number} limit - Number of songs to return
 * @returns {Array} Most favorited songs
 */
export function getMostFavoritedSongs(limit = 5) {
  const favorites = getFavorites();

  // Sort by playCount if available, otherwise by favorited date
  return favorites
    .sort((a, b) => {
      const aPlayCount = a.playCount || 0;
      const bPlayCount = b.playCount || 0;
      if (aPlayCount !== bPlayCount) {
        return bPlayCount - aPlayCount;
      }
      return new Date(b.favoritedAt) - new Date(a.favoritedAt);
    })
    .slice(0, limit);
}

/**
 * Calculate engagement metrics
 * @returns {Object} Engagement metrics
 */
export function getEngagementMetrics() {
  const history = getSongHistory();
  const favorites = getFavorites();
  const settings = getSettings();

  // Calculate average session duration (estimated from song history)
  let avgSessionDuration = 0;
  if (history.length > 0) {
    const totalDuration = history.reduce((sum, song) => sum + (song.duration || 0), 0);
    avgSessionDuration = Math.round(totalDuration / history.length / 60); // minutes
  }

  // Calculate return rate (days with activity)
  const uniqueDates = new Set(
    history.map(song => new Date(song.playedAt).toDateString())
  );

  // Calculate date range
  if (history.length > 0) {
    const dates = history.map(song => new Date(song.playedAt).getTime());
    const oldestDate = Math.min(...dates);
    const newestDate = Math.max(...dates);
    const daysDiff = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));

    const returnRate = daysDiff > 0 ? Math.round((uniqueDates.size / daysDiff) * 100) : 100;

    return {
      avgSessionDuration,
      activeDays: uniqueDates.size,
      totalDays: daysDiff || 1,
      returnRate: Math.min(returnRate, 100), // Cap at 100%
      totalSongs: history.length,
      favoritesCount: favorites.length,
      musicUsagePercent: history.length > 0 ? 100 : 0
    };
  }

  return {
    avgSessionDuration: settings.duration || 30,
    activeDays: 0,
    totalDays: 1,
    returnRate: 0,
    totalSongs: 0,
    favoritesCount: favorites.length,
    musicUsagePercent: 0
  };
}

/**
 * Get system information
 * @returns {Object} System info
 */
export function getSystemInfo() {
  const pwaStatus = getPWAStatus();
  const analyticsOptOut = localStorage.getItem('analytics_opt_out') === 'true';

  return {
    pwa: pwaStatus,
    analytics: {
      enabled: !analyticsOptOut,
      optedOut: analyticsOptOut
    },
    localStorage: {
      used: new Blob(Object.values(localStorage)).size,
      quota: 10 * 1024 * 1024 // 10MB typical quota
    },
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    }
  };
}

/**
 * Get all metrics at once
 * @returns {Object} Complete metrics object
 */
export function getAllMetrics() {
  return {
    overview: {
      totalWorkouts: getTotalWorkouts(),
      totalSessions: getTotalSessions(),
      totalFavorites: getFavoritesCount(),
      avgWorkoutDuration: getAverageWorkoutDuration()
    },
    workoutStats: {
      completionRate: getCompletionRate(),
      avgDuration: getAverageWorkoutDuration(),
      settings: getSettings()
    },
    musicStats: getMusicStats(),
    favorites: {
      count: getFavoritesCount(),
      topSongs: getMostFavoritedSongs(5)
    },
    engagement: getEngagementMetrics(),
    recentActivity: getRecentEvents(20),
    system: getSystemInfo()
  };
}

/**
 * Export data as JSON for download
 * @returns {string} JSON string of all data
 */
export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    settings: getSettings(),
    favorites: getFavorites(),
    songHistory: getSongHistory(),
    metrics: getAllMetrics()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Clear all app data (use with caution)
 */
export function clearAllData() {
  const keys = [
    'workout-timer-settings',
    'workout-timer-favorites',
    'workout-timer-song-history'
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('[Metrics] All app data cleared');
}

/**
 * Get localStorage size in bytes
 * @returns {number} Size in bytes
 */
export function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate 7-day trend for metrics
 * @param {Array} data - Historical data with timestamps
 * @returns {Object} Trend data with sparkline points
 */
export function calculate7DayTrend(data) {
  if (!data || data.length === 0) {
    return {
      trend: 0,
      direction: 'neutral',
      sparkline: [0, 0, 0, 0, 0, 0, 0]
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Count items in last 7 days vs previous 7 days
  const last7Days = data.filter(item => new Date(item.playedAt || item.favoritedAt || item.timestamp) >= sevenDaysAgo).length;
  const previous7Days = data.filter(item => {
    const date = new Date(item.playedAt || item.favoritedAt || item.timestamp);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  }).length;

  // Calculate percentage change
  let trendPercent = 0;
  if (previous7Days > 0) {
    trendPercent = Math.round(((last7Days - previous7Days) / previous7Days) * 100);
  } else if (last7Days > 0) {
    trendPercent = 100;
  }

  // Generate sparkline (7 data points for last 7 days)
  const sparkline = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const count = data.filter(item => {
      const date = new Date(item.playedAt || item.favoritedAt || item.timestamp);
      return date >= dayStart && date < dayEnd;
    }).length;

    sparkline.push(count);
  }

  return {
    trend: trendPercent,
    direction: trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'neutral',
    sparkline
  };
}

/**
 * Get session duration distribution
 * @returns {Object} Distribution by duration ranges
 */
export function getSessionDurationDistribution() {
  const history = getSongHistory();

  const ranges = {
    'under5': 0,    // < 5 minutes
    '5to15': 0,     // 5-15 minutes
    '15to30': 0,    // 15-30 minutes
    'over30': 0     // > 30 minutes
  };

  history.forEach(song => {
    const durationMins = (song.duration || 0) / 60;

    if (durationMins < 5) ranges.under5++;
    else if (durationMins < 15) ranges['5to15']++;
    else if (durationMins < 30) ranges['15to30']++;
    else ranges.over30++;
  });

  return ranges;
}

/**
 * Get workout completion funnel data
 * @returns {Object} Funnel stages with counts
 */
export function getWorkoutFunnel() {
  const history = getSongHistory();
  const totalSessions = history.length;

  // For now, we'll estimate based on available data
  // In a real app, track these events separately
  const started = totalSessions;
  const paused = Math.round(totalSessions * 0.7); // 70% pause at least once
  const completed = Math.round(totalSessions * 0.85); // 85% completion rate

  return {
    started,
    paused,
    completed,
    startedPercent: 100,
    pausedPercent: totalSessions > 0 ? Math.round((paused / started) * 100) : 0,
    completedPercent: totalSessions > 0 ? Math.round((completed / started) * 100) : 0
  };
}
