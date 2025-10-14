// Node 18+ (built-in fetch). Run: YT_API_KEY=... node src/js/utils/song_fetcher/index.js

import fs from "node:fs";
import {
  WANT_PER_CATEGORY,
  MIN_SECONDS,
  categories,
  OUTPUT_FILE,
  DATA_DIR_PATH
} from "./config.js";
import { searchVideosForQuery, fetchVideosDetails, budget } from "./youtube-api.js";
import { loadCache, saveCache, categoryIsStale } from "./cache.js";
import {
  isUpcomingOrLive,
  hasVisibleStats,
  mapToOutput,
  iso8601ToSeconds,
  nowIso,
  stripPrivateFieldsForOutput
} from "./filters.js";

// Load API key from environment variable
const API_KEY = process.env.YT_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing YT_API_KEY environment variable.");
  console.error("Set it with: export YT_API_KEY=your_api_key_here");
  process.exit(1);
}

// ---------- FETCHER ----------
async function fetchCategory(categoryName, queries) {
  const collected = [];
  const seen = new Set();

  for (const q of queries) {
    let page = null;
    for (let i = 0; i < 3 && collected.length < WANT_PER_CATEGORY; i++) {
      const s = await searchVideosForQuery(API_KEY, q, page);
      const ids = (s.items || [])
        .map(v => v.id?.videoId)
        .filter(Boolean)
        .filter(id => !seen.has(id));

      ids.forEach(id => seen.add(id));

      // Batch details to minimize cost
      const details = await fetchVideosDetails(API_KEY, ids);
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

// ---------- MAIN ----------
async function main() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR_PATH)) {
    fs.mkdirSync(DATA_DIR_PATH, { recursive: true });
    console.log(`📁 Created data directory: ${DATA_DIR_PATH}`);
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
  console.log(`Saved cache     : ${cache._meta ? 'workout_music_cache.json' : ''}`);
  console.log(`Estimated quota used: ${budget.used}/${budget.limit} units`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
