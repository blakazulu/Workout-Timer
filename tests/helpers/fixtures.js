/**
 * Test Fixtures for CYCLE Workout Timer
 * Mock data for consistent testing
 */

/**
 * Mock song data for testing
 */
export const MOCK_SONGS = [
  {
    id: "test-video-1",
    title: "Epic Workout Mix 1",
    channelTitle: "Test Channel",
    genre: "edm",
    mood: "energetic",
    thumbnail: "https://i.ytimg.com/vi/test-video-1/default.jpg"
  },
  {
    id: "test-video-2",
    title: "Rock Workout Session",
    channelTitle: "Rock Channel",
    genre: "rock",
    mood: "aggressive",
    thumbnail: "https://i.ytimg.com/vi/test-video-2/default.jpg"
  },
  {
    id: "test-video-3",
    title: "Hip Hop Energy",
    channelTitle: "Hip Hop Channel",
    genre: "hiphop",
    mood: "focused",
    thumbnail: "https://i.ytimg.com/vi/test-video-3/default.jpg"
  },
  {
    id: "test-video-4",
    title: "Electronic Vibes",
    channelTitle: "Electronic Channel",
    genre: "electronic",
    mood: "uplifting",
    thumbnail: "https://i.ytimg.com/vi/test-video-4/default.jpg"
  },
  {
    id: "test-video-5",
    title: "Motivational Metal",
    channelTitle: "Metal Channel",
    genre: "metal",
    mood: "aggressive",
    thumbnail: "https://i.ytimg.com/vi/test-video-5/default.jpg"
  }
];

/**
 * Mock favorites list (updated to match current API)
 * New API stores array of full song objects, not just video IDs
 */
export const MOCK_FAVORITES = [
  {
    videoId: "test-video-1",
    title: "Epic Workout Mix 1",
    channel: "Test Channel",
    duration: 180,
    url: "https://youtube.com/watch?v=test-video-1",
    thumbnail: "https://img.youtube.com/vi/test-video-1/mqdefault.jpg",
    favoritedAt: new Date("2025-01-15T10:00:00Z").toISOString()
  },
  {
    videoId: "test-video-3",
    title: "Hip Hop Energy",
    channel: "Hip Hop Channel",
    duration: 200,
    url: "https://youtube.com/watch?v=test-video-3",
    thumbnail: "https://img.youtube.com/vi/test-video-3/mqdefault.jpg",
    favoritedAt: new Date("2025-01-15T11:00:00Z").toISOString()
  },
  {
    videoId: "test-video-5",
    title: "Motivational Metal",
    channel: "Metal Channel",
    duration: 220,
    url: "https://youtube.com/watch?v=test-video-5",
    thumbnail: "https://img.youtube.com/vi/test-video-5/mqdefault.jpg",
    favoritedAt: new Date("2025-01-15T12:00:00Z").toISOString()
  }
];

/**
 * Mock timer configuration
 */
export const MOCK_TIMER_CONFIG = {
  workTime: 40,
  restTime: 20,
  sets: 8,
  soundsEnabled: true,
  volume: 70
};

/**
 * Mock app state for testing
 */
export const MOCK_APP_STATE = {
  timer: {
    isRunning: false,
    isPaused: false,
    currentTime: 40,
    currentSet: 1,
    totalSets: 8,
    phase: "work", // 'work' | 'rest' | 'complete'
    workTime: 40,
    restTime: 20
  },
  music: {
    isPlaying: false,
    currentTrack: null,
    volume: 50,
    mode: "youtube" // 'youtube' | 'shuffle'
  },
  settings: {
    soundsEnabled: true,
    wakeLockEnabled: true,
    genre: "all",
    mood: "all"
  }
};

/**
 * Mock workout music library (simplified version)
 */
export const MOCK_MUSIC_LIBRARY = {
  edm: {
    energetic: MOCK_SONGS.filter(s => s.genre === "edm")
  },
  rock: {
    aggressive: MOCK_SONGS.filter(s => s.genre === "rock")
  },
  hiphop: {
    focused: MOCK_SONGS.filter(s => s.genre === "hiphop")
  },
  electronic: {
    uplifting: MOCK_SONGS.filter(s => s.genre === "electronic")
  },
  metal: {
    aggressive: MOCK_SONGS.filter(s => s.genre === "metal")
  }
};

/**
 * Mock localStorage data (updated with correct keys)
 */
export const MOCK_LOCAL_STORAGE = {
  "workout-timer-favorites": JSON.stringify(MOCK_FAVORITES),
  "timer-config": JSON.stringify(MOCK_TIMER_CONFIG),
  "app-state": JSON.stringify(MOCK_APP_STATE),
  "music-library": JSON.stringify(MOCK_MUSIC_LIBRARY)
};

/**
 * Timer state snapshots for different scenarios
 */
export const TIMER_STATES = {
  initial: {
    isRunning: false,
    isPaused: false,
    currentTime: 40,
    currentSet: 1,
    totalSets: 8,
    phase: "work"
  },
  running: {
    isRunning: true,
    isPaused: false,
    currentTime: 35,
    currentSet: 3,
    totalSets: 8,
    phase: "work"
  },
  paused: {
    isRunning: false,
    isPaused: true,
    currentTime: 25,
    currentSet: 5,
    totalSets: 8,
    phase: "rest"
  },
  completed: {
    isRunning: false,
    isPaused: false,
    currentTime: 0,
    currentSet: 8,
    totalSets: 8,
    phase: "complete"
  }
};

/**
 * Sound effect files
 */
export const SOUND_FILES = {
  start: "/sounds/start.mp3",
  countdown: "/sounds/countdown.mp3",
  rest: "/sounds/rest.mp3",
  complete: "/sounds/complete.mp3",
  halfway: "/sounds/halfway.mp3"
};

/**
 * Test user data for PostHog tracking tests
 */
export const MOCK_USER = {
  id: "test-user-123",
  distinctId: "test-distinct-id",
  properties: {
    totalWorkouts: 5,
    favoriteGenre: "edm",
    avgWorkoutDuration: 320 // seconds
  }
};

/**
 * Viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: {width: 375, height: 667}, // iPhone SE
  mobileLarge: {width: 414, height: 896}, // iPhone 11 Pro Max
  tablet: {width: 768, height: 1024}, // iPad
  desktop: {width: 1280, height: 720}, // Desktop
  desktopLarge: {width: 1920, height: 1080} // Large Desktop
};

/**
 * Test timeouts
 */
export const TIMEOUTS = {
  short: 1000,
  medium: 3000,
  long: 5000,
  veryLong: 10000
};
