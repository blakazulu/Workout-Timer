import { RATE } from "./config.js";
import { delay } from "./filters.js";

// ---------- RATE LIMITER + BUDGET ----------
export const budget = {
  used: 0,
  limit: RATE.dailyBudgetUnits
};

async function withPacing(costUnits, fn) {
  if (budget.used + costUnits > budget.limit) {
    throw new Error(
      `Quota budget exceeded: need ${costUnits} more units but only ${budget.limit - budget.used} left.`
    );
  }
  await delay(RATE.delayMsBetweenRequests);
  const res = await fn();
  budget.used += costUnits;
  return res;
}

// ---------- API CALLS ----------
const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos";

async function ytGet(apiKey, url, params, costTag, retries = 3) {
  const cost = costTag === "search" ? RATE.costs.search : RATE.costs.videos;
  return withPacing(cost, async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const usp = new URLSearchParams({ key: apiKey, ...params });
        const r = await fetch(`${url}?${usp.toString()}`);

        if (!r.ok) {
          const text = await r.text().catch(() => "");

          // Don't retry on client errors (400s) except rate limit
          if (r.status >= 400 && r.status < 500 && r.status !== 429) {
            throw new Error(`YouTube API error: ${r.status} ${r.statusText} - ${text}`);
          }

          // Retry on server errors (500s) and rate limit (429)
          if (attempt < retries) {
            const backoff = attempt * 2000; // 2s, 4s, 6s
            console.warn(`⚠️  Retry ${attempt}/${retries} after ${backoff}ms (status: ${r.status})`);
            await delay(backoff);
            continue;
          }

          throw new Error(`YouTube API error: ${r.status} ${r.statusText} - ${text}`);
        }

        return r.json();
      } catch (error) {
        if (attempt === retries) throw error;
        const backoff = attempt * 2000;
        console.warn(`⚠️  Network error, retry ${attempt}/${retries} after ${backoff}ms`);
        await delay(backoff);
      }
    }
  });
}

export async function searchVideosForQuery(apiKey, q, pageToken = null) {
  const params = {
    part: "snippet",
    type: "video",
    videoDuration: "long", // 20+ min (we'll filter to 30+)
    q,
    maxResults: 50,
    order: "viewCount",
    safeSearch: "none"
  };
  if (pageToken) params.pageToken = pageToken;
  return ytGet(apiKey, SEARCH_ENDPOINT, params, "search");
}

export async function fetchVideosDetails(apiKey, ids) {
  if (!ids.length) return [];
  const params = {
    part: "contentDetails,statistics,snippet,liveStreamingDetails",
    id: ids.join(",")
  };
  const json = await ytGet(apiKey, VIDEOS_ENDPOINT, params, "videos");
  return json.items || [];
}
