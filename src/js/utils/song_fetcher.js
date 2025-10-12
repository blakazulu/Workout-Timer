// Node 18+ (built-in fetch). Run: YT_API_KEY=... node song_fetcher.js

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

// Get directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load API key from environment variable
const API_KEY = process.env.YT_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing YT_API_KEY environment variable.");
  console.error("Set it with: export YT_API_KEY=your_api_key_here");
  process.exit(1);
}

// ---------- CONFIG ----------
const WANT_PER_CATEGORY = 10;
const MIN_SECONDS = 30 * 60; // ≥ 30 minutes per your requirement
const MIN_VIEWS = 10_000;    // ensure real traction
const REFRESH_DAYS = 30;     // auto refresh window for policy compliance
// Output to src/js/data directory
const DATA_DIR = path.resolve(__dirname, "..", "data");
const CACHE_FILE = path.join(DATA_DIR, "workout_music_cache.json"); // holds timestamps + items
const OUTPUT_FILE = path.join(DATA_DIR, "workout_music.json");      // clean output for your app

// Rate-limit + budget (YouTube Data API v3)
const RATE = {
  delayMsBetweenRequests: 250,   // adjust if you want gentler pacing
  dailyBudgetUnits: 9000,        // stop before 10,000 default quota
  // Cost estimates: search.list = 100 units, videos.list = 1 unit.
  // (Matches Google’s published table; tweak if your project differs.)
  costs: {search: 100, videos: 1}
};

// ---------- CATEGORY QUERIES ----------
const categories = {
  // MOODS
  "beast mode workout music": [
    "beast mode workout mix 1 hour",
    "beast mode gym music 60 minutes",
    "aggressive workout music 1h mix"
  ],
  "intense workout music": [
    "intense workout music 1 hour",
    "hard techno workout mix 1 hour",
    "extreme gym training music 60 minutes"
  ],
  "energetic workout music": [
    "energetic workout music 1 hour",
    "high energy gym music 60 minutes",
    "running workout mix 1 hour"
  ],
  "power workout music": [
    "power lifting workout mix 1 hour",
    "strength training music 60 minutes",
    "powerful gym music mix 1 hour"
  ],
  "aggressive workout music": [
    "aggressive workout music 1 hour",
    "beast mode trap gym mix 1 hour",
    "hardstyle workout mix 60 minutes"
  ],
  "pump up workout music": [
    "pump up workout mix 1 hour",
    "hype gym music 60 minutes",
    "motivational workout music 1 hour"
  ],
  "focus workout music": [
    "focus training music 1 hour",
    "instrumental workout mix 60 minutes",
    "no vocals gym music 1 hour"
  ],
  "motivational workout music": [
    "motivational workout music 1 hour",
    "gym motivation mix 60 minutes",
    "motivational speech music 1 hour"
  ],

  // GENRES
  "edm workout music": [
    "EDM workout mix 1 hour",
    "dance workout mix 60 minutes",
    "cyberpunk workout music 1 hour"
  ],
  "rock workout music": [
    "rock workout mix 1 hour",
    "alternative rock gym mix 60 minutes",
    "badass rock playlist 1 hour"
  ],
  "hip hop workout music": [
    "hip hop workout mix 1 hour",
    "rap gym music 60 minutes",
    "trap workout mix 1 hour"
  ],
  "metal workout music": [
    "metal workout mix 1 hour",
    "hard rock gym music 60 minutes",
    "power metal workout 1 hour"
  ],
  "trap workout music": [
    "trap workout mix 1 hour",
    "aggressive trap gym music 60 minutes",
    "phonk trap workout 1 hour"
  ],
  "dubstep workout music": [
    "dubstep workout mix 1 hour",
    "bass workout mix 60 minutes",
    "riddim workout 1 hour"
  ],
  "hardstyle workout music": [
    "hardstyle workout mix 1 hour",
    "euphoric hardstyle gym 60 minutes",
    "raw hardstyle workout 1 hour"
  ],
  "techno workout music": [
    "techno workout mix 1 hour",
    "hard techno gym 60 minutes",
    "industrial techno workout 1 hour"
  ],
  "phonk workout music": [
    "phonk workout mix 1 hour",
    "drift phonk gym 60 minutes",
    "phonk trap workout 1 hour"
  ],
  "drum and bass workout music": [
    "drum and bass workout mix 1 hour",
    "dnb gym music 60 minutes",
    "neurofunk workout 1 hour"
  ]
};

// ---------- UTILS ----------
const delay = ms => new Promise(r => setTimeout(r, ms));

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function iso8601ToSeconds(iso) {
  const re = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const m = re.exec(iso || "");
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

function buildThumb(videoId) {
  // mqdefault.jpg is reliable; upgrade to sddefault/maxresdefault if you prefer.
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// ---------- RATE LIMITER + BUDGET ----------
const budget = {
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

async function ytGet(url, params, costTag, retries = 3) {
  const cost = costTag === "search" ? RATE.costs.search : RATE.costs.videos;
  return withPacing(cost, async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const usp = new URLSearchParams({key: API_KEY, ...params});
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

async function searchVideosForQuery(q, pageToken = null) {
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
  return ytGet(SEARCH_ENDPOINT, params, "search");
}

async function fetchVideosDetails(ids) {
  if (!ids.length) return [];
  const params = {
    part: "contentDetails,statistics,snippet,liveStreamingDetails",
    id: ids.join(",")
  };
  const json = await ytGet(VIDEOS_ENDPOINT, params, "videos");
  return json.items || [];
}

// ---------- FILTERS ----------
function isUpcomingOrLive(snippet, liveDetails) {
  const lbc = snippet?.liveBroadcastContent; // "none" | "live" | "upcoming"
  if (lbc && lbc !== "none") return true;

  // If stream info exists but has no actualEndTime, exclude (live or scheduled).
  if (liveDetails && !liveDetails.actualEndTime) return true;

  return false;
}

function hasVisibleStats(stat) {
  if (!stat) return false;
  const views = Number(stat.viewCount || 0);
  const likesVisible = stat.likeCount !== undefined && stat.likeCount !== null;
  return views >= MIN_VIEWS && likesVisible;
}

function mapToOutput(item) {
  const id = item.id;
  return {
    title: item.snippet?.title || "Unknown",
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: buildThumb(id),
    duration: iso8601ToSeconds(item.contentDetails?.duration || ""),
    artist: item.snippet?.channelTitle || "Unknown",
    type: "mix",
    _fetchedAt: nowIso() // kept only in cache; stripped from final output
  };
}

// ---------- FETCHER ----------
async function fetchCategory(categoryName, queries) {
  const collected = [];
  const seen = new Set();

  for (const q of queries) {
    let page = null;
    for (let i = 0; i < 3 && collected.length < WANT_PER_CATEGORY; i++) {
      const s = await searchVideosForQuery(q, page);
      const ids = (s.items || [])
        .map(v => v.id?.videoId)
        .filter(Boolean)
        .filter(id => !seen.has(id));

      ids.forEach(id => seen.add(id));

      // Batch details to minimize cost
      const details = await fetchVideosDetails(ids);
      for (const item of details) {
        if (collected.length >= WANT_PER_CATEGORY) break;

        const snippet = item.snippet;
        const stats = item.statistics;
        const live = item.liveStreamingDetails;

        if (isUpcomingOrLive(snippet, live)) continue;

        const dur = iso8601ToSeconds(item.contentDetails?.duration || "");
        if (dur < MIN_SECONDS) continue;

        if (!hasVisibleStats(stats)) continue;

        collected.push(mapToOutput(item));
      }
      page = s.nextPageToken || null;
      if (!page) break;
    }
    if (collected.length >= WANT_PER_CATEGORY) break;
  }

  return collected;
}

// ---------- CACHE ----------
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return {_meta: {version: 1, createdAt: nowIso(), lastRunAt: null}, categories: {}};
  }
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const data = JSON.parse(raw);
    // ensure shape
    if (!data._meta) data._meta = {version: 1, createdAt: nowIso(), lastRunAt: null};
    if (!data.categories) data.categories = {};
    return data;
  } catch {
    return {_meta: {version: 1, createdAt: nowIso(), lastRunAt: null}, categories: {}};
  }
}

function saveCache(cache) {
  cache._meta.lastRunAt = nowIso();
  cache._meta.budgetUsedUnits = budget.used;
  cache._meta.budgetLimitUnits = budget.limit;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function categoryIsStale(catObj) {
  if (!catObj || !catObj.updatedAt) return true;
  const updated = new Date(catObj.updatedAt).getTime();
  const cutoff = new Date(daysAgoIso(REFRESH_DAYS)).getTime();
  return updated < cutoff;
}

function stripPrivateFieldsForOutput(items) {
  // drop _fetchedAt in final app JSON
  return items.map(({_fetchedAt, ...rest}) => rest);
}

// ---------- MAIN ----------
async function main() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
    console.log(`📁 Created data directory: ${DATA_DIR}`);
  }

  const cache = loadCache();
  const resultForApp = {};

  for (const [categoryName, queries] of Object.entries(categories)) {
    let needFetch = true;
    let cachedItems = cache.categories[categoryName]?.items || [];

    if (!categoryIsStale(cache.categories[categoryName])) {
      // Not stale: keep cached, but if fewer than target, try topping up
      if (cachedItems.length >= WANT_PER_CATEGORY) {
        needFetch = false;
      }
    }

    let finalItems;
    if (needFetch) {
      console.log(`↻ Refreshing: ${categoryName}`);
      const fresh = await fetchCategory(categoryName, queries);

      // If we had some fresh + some recent cached (optional merge logic):
      // Here we just use fresh results (ensures all entries are ≤30 days old after refresh).
      finalItems = fresh.slice(0, WANT_PER_CATEGORY);

      cache.categories[categoryName] = {
        updatedAt: nowIso(),
        items: finalItems
      };
    } else {
      console.log(`✓ Using cache: ${categoryName}`);
      finalItems = cachedItems.slice(0, WANT_PER_CATEGORY);
    }

    resultForApp[categoryName] = stripPrivateFieldsForOutput(finalItems);
  }

  // Persist cache and clean app-facing file
  saveCache(cache);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultForApp, null, 2), "utf-8");

  console.log(`\nSaved app JSON: ${OUTPUT_FILE}`);
  console.log(`Saved cache     : ${CACHE_FILE}`);
  console.log(`Estimated quota used: ${budget.used}/${budget.limit} units`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
