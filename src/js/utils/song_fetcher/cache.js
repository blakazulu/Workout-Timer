import fs from "node:fs";
import { CACHE_FILE, REFRESH_DAYS } from "./config.js";
import { budget } from "./youtube-api.js";
import { nowIso, daysAgoIso } from "./filters.js";

// ---------- CACHE ----------
export function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return { _meta: { version: 1, createdAt: nowIso(), lastRunAt: null }, categories: {} };
  }
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const data = JSON.parse(raw);
    // ensure shape
    if (!data._meta) data._meta = { version: 1, createdAt: nowIso(), lastRunAt: null };
    if (!data.categories) data.categories = {};
    return data;
  } catch {
    return { _meta: { version: 1, createdAt: nowIso(), lastRunAt: null }, categories: {} };
  }
}

export function saveCache(cache) {
  cache._meta.lastRunAt = nowIso();
  cache._meta.budgetUsedUnits = budget.used;
  cache._meta.budgetLimitUnits = budget.limit;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export function categoryIsStale(catObj) {
  if (!catObj || !catObj.updatedAt) return true;
  const updated = new Date(catObj.updatedAt).getTime();
  const cutoff = new Date(daysAgoIso(REFRESH_DAYS)).getTime();
  return updated < cutoff;
}
