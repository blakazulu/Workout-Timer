/**
 * YouTube Search Utility
 * Provides live search functionality with autocomplete
 */

/**
 * Check if input is a YouTube URL
 * @param {string} input - User input
 * @returns {boolean} True if input is a YouTube URL
 */
export function isYouTubeUrl(input) {
  if (!input || typeof input !== "string") return false;

  const trimmed = input.trim().toLowerCase();

  // Check for common YouTube URL patterns
  return (
    trimmed.includes("youtube.com/watch") ||
    trimmed.includes("youtu.be/") ||
    trimmed.includes("youtube.com/embed") ||
    trimmed.includes("youtube.com/v/") ||
    (trimmed.startsWith("http") && trimmed.includes("youtube"))
  );
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Fetch autocomplete suggestions from YouTube
 * Uses the unofficial YouTube autocomplete API (no key required)
 * @param {string} query - Search query
 * @returns {Promise<Array<string>>} Array of suggestion strings
 */
export async function fetchAutocompleteSuggestions(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodedQuery}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn("Autocomplete API returned non-OK status:", response.status);
      return [];
    }

    const data = await response.json();

    // YouTube autocomplete returns: [query, [suggestions]]
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1].slice(0, 8); // Return max 8 suggestions
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch autocomplete suggestions:", error);
    return [];
  }
}

/**
 * Search YouTube videos using the Data API v3
 * NOTE: This requires an API key. For client-side usage without exposing the key,
 * you would need a backend proxy. For now, we'll use the iframe search approach.
 *
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of video objects
 */
export async function searchYouTubeVideos(query, maxResults = 5) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // For now, we'll use autocomplete suggestions and construct video search URLs
    // This avoids needing an API key on the client side
    const suggestions = await fetchAutocompleteSuggestions(query);

    // Format suggestions as search results
    // Each suggestion will trigger a YouTube search when clicked
    return suggestions.map((suggestion, index) => ({
      id: `suggestion-${index}`,
      title: suggestion,
      type: "suggestion",
      query: suggestion,
      thumbnail: null, // No thumbnail for suggestions
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion)}`
    }));
  } catch (error) {
    console.error("Failed to search YouTube videos:", error);
    return [];
  }
}

/**
 * Search for actual YouTube videos with full details
 * Uses the Netlify serverless function to keep API key secure
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of video objects with thumbnails, duration, etc.
 */
export async function searchYouTubeVideosDetailed(query, maxResults = 5) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(`/api/youtube-search?q=${encodedQuery}&maxResults=${maxResults}`);

    if (!response.ok) {
      console.error("YouTube search API error:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    // Format results for the dropdown
    return data.results.map(video => ({
      id: video.id,
      title: video.title,
      description: video.channelTitle,
      thumbnail: video.thumbnail,
      duration: video.durationSeconds || 0,
      viewCount: video.viewCount,
      url: video.url,
      type: "video"
    }));
  } catch (error) {
    console.error("Failed to search YouTube videos:", error);
    return [];
  }
}

/**
 * Alternative: Search for actual video data using iframe search
 * This creates search result items that will open YouTube search
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of search result objects
 */
export async function searchVideosWithSuggestions(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const suggestions = await fetchAutocompleteSuggestions(query);

  // Format as clickable search results
  return suggestions.map((suggestion, index) => ({
    id: `search-${index}`,
    title: suggestion,
    description: "YouTube Search",
    thumbnail: null,
    type: "search",
    searchQuery: suggestion
  }));
}

/**
 * Extract video ID from YouTube URL for thumbnail generation
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
export function extractVideoId(url) {
  if (!url) return null;

  try {
    // Handle youtube.com/watch?v= format
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    }

    // Handle youtu.be/ format
    if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match ? match[1] : null;
    }

    // Handle youtube.com/embed/ format
    if (url.includes("youtube.com/embed/")) {
      const match = url.match(/youtube\.com\/embed\/([^?&]+)/);
      return match ? match[1] : null;
    }
  } catch (error) {
    console.error("Failed to extract video ID:", error);
  }

  return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} Thumbnail URL
 */
export function getVideoThumbnail(videoId, quality = "mqdefault") {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
