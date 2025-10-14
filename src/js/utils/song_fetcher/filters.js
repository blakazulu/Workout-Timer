import {MIN_VIEWS} from "./config.js";

// ---------- UTILS ----------
export const delay = ms => new Promise(r => setTimeout(r, ms));

export function nowIso() {
  return new Date().toISOString();
}

export function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function iso8601ToSeconds(iso) {
  const re = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const m = re.exec(iso || "");
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

export function buildThumb(videoId) {
  // mqdefault.jpg is reliable; upgrade to sddefault/maxresdefault if you prefer.
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// ---------- FILTERS ----------
export function isUpcomingOrLive(snippet, liveDetails) {
  const lbc = snippet?.liveBroadcastContent; // "none" | "live" | "upcoming"
  if (lbc && lbc !== "none") return true;

  // If stream info exists but has no actualEndTime, exclude (live or scheduled).
  if (liveDetails && !liveDetails.actualEndTime) return true;

  return false;
}

export function hasVisibleStats(stat) {
  if (!stat) return false;
  const views = Number(stat.viewCount || 0);
  const likesVisible = stat.likeCount !== undefined && stat.likeCount !== null;
  return views >= MIN_VIEWS && likesVisible;
}

export function mapToOutput(item) {
  const id = item.id;
  return {
    title: item.snippet?.title || "Unknown",
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: buildThumb(id),
    duration: iso8601ToSeconds(item.contentDetails?.duration || ""),
    channel: item.snippet?.channelTitle || "Unknown",
    type: "mix",
    _fetchedAt: nowIso() // kept only in cache; stripped from final output
  };
}

export function stripPrivateFieldsForOutput(items) {
  // drop _fetchedAt in final app JSON
  return items.map(({_fetchedAt, ...rest}) => rest);
}
