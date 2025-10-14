import path from "node:path";
import {fileURLToPath} from "node:url";

// Get directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- CONFIG ----------
export const WANT_PER_CATEGORY = 10;
export const MIN_SECONDS = 30 * 60; // ≥ 30 minutes per your requirement
export const MIN_VIEWS = 10_000;    // ensure real traction
export const REFRESH_DAYS = 30;     // auto refresh window for policy compliance

// Output to src/js/data directory
const DATA_DIR = path.resolve(__dirname, "..", "..", "data");
export const CACHE_FILE = path.join(DATA_DIR, "workout_music_cache.json"); // holds timestamps + items
export const OUTPUT_FILE = path.join(DATA_DIR, "workout_music.json");      // clean output for your app
export const DATA_DIR_PATH = DATA_DIR;

// Rate-limit + budget (YouTube Data API v3)
export const RATE = {
  delayMsBetweenRequests: 250,   // adjust if you want gentler pacing
  dailyBudgetUnits: 9000,        // stop before 10,000 default quota
  // Cost estimates: search.list = 100 units, videos.list = 1 unit.
  // (Matches Google's published table; tweak if your project differs.)
  costs: {search: 100, videos: 1}
};

// ---------- CATEGORY QUERIES ----------
export const categories = {
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
