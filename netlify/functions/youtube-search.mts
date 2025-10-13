import type { Context, Config } from "@netlify/functions";

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  url: string;
}

/**
 * Parse ISO 8601 duration to seconds
 * @param duration - ISO 8601 duration string (e.g., "PT1H30M45S")
 * @returns Duration in seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Search YouTube videos and return results with full details
 */
export default async (req: Request, context: Context) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Get API key from environment
  const apiKey = Netlify.env.get("YT_API_KEY");
  if (!apiKey) {
    console.error("YT_API_KEY environment variable not set");
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Parse query parameters
  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const maxResults = parseInt(url.searchParams.get("maxResults") || "5", 10);

  if (!query || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Step 1: Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoDuration=long&q=${encodeURIComponent(query)}&` +
      `maxResults=${maxResults}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("YouTube Search API error:", searchResponse.status, errorText);
      return new Response(JSON.stringify({
        error: "YouTube API error",
        details: searchResponse.statusText
      }), {
        status: searchResponse.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Step 2: Get video details (duration, view count, etc.)
    const videoIds = searchData.items.map(item => item.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      console.error("YouTube Videos API error:", detailsResponse.status);
      // Continue without details if this fails
    }

    const detailsData: YouTubeVideoDetailsResponse = detailsResponse.ok
      ? await detailsResponse.json()
      : { items: [] };

    // Step 3: Combine search results with details
    const results: VideoResult[] = searchData.items.map(item => {
      const videoId = item.id.videoId;
      const details = detailsData.items.find(d => d.id === videoId);

      return {
        id: videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || "",
        duration: details?.contentDetails.duration || "PT0S",
        durationSeconds: details ? parseDuration(details.contentDetails.duration) : 0,
        viewCount: details?.statistics.viewCount || "0",
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    });

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error("Error searching YouTube:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/youtube-search"
};
