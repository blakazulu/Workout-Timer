# Automated Music Library Updates

## Overview

Your workout music library (`workout_music.json`) updates **automatically every Sunday at 2 AM UTC** via GitHub Actions.

No manual work required! Just set up once and it runs forever.

## How It Works

### The Automatic Flow

```
Every Sunday at 2 AM UTC
    ↓
GitHub Actions runs
    ↓
Executes: node src/js/utils/song_fetcher.js
    ↓
Fetches fresh YouTube music (18 categories)
    ↓
Updates workout_music.json
    ↓
Commits & pushes to GitHub
    ↓
Netlify detects commit
    ↓
Auto-rebuilds & deploys
    ↓
Users get fresh music! 🎵
```

### What Gets Updated

The script updates these files:

- `src/js/data/workout_music.json` - Music library used by your app
- `src/js/data/workout_music_cache.json` - Cache to reduce API costs

**Categories updated:**

- 8 Moods: Beast Mode, Intense, Energetic, Power, Aggressive, Pump Up, Focus, Motivated
- 10 Genres: EDM, Rock, Hip Hop, Metal, Trap, Dubstep, Hardstyle, Techno, Phonk, DnB

**Per category:** 10 verified workout music videos (30+ minutes each)

## One-Time Setup

### Step 1: Add GitHub Secret

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click "**New repository secret**"
4. Name: `YT_API_KEY`
5. Value: Your YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/apis/credentials))
6. Click "**Add secret**"

### Step 2: Enable GitHub Actions Write Permissions

1. Repository **Settings** → **Actions** → **General**
2. Scroll to "**Workflow permissions**"
3. Select "**Read and write permissions**"
4. Check "**Allow GitHub Actions to create and approve pull requests**"
5. Click "**Save**"

### Step 3: Push the Workflow File

The workflow is already created at `.github/workflows/update-music.yml`

Just commit and push:

```bash
git add .github/workflows/update-music.yml
git commit -m "Add automated weekly music updates"
git push origin main
```

**That's it!** The workflow will start running every Sunday at 2 AM UTC.

## Workflow File

Location: `.github/workflows/update-music.yml`

### Schedule

```yaml
schedule:
  - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
```

### What It Does

1. Checks out your repository
2. Sets up Node.js 18
3. Installs dependencies (`npm install`)
4. Runs the song fetcher with your API key
5. Commits changes (if any)
6. Pushes back to GitHub

### Commit Message Format

```
🎵 Auto-update workout music library

Updated by scheduled GitHub Actions workflow
```

## Manual Trigger

Want to update music NOW instead of waiting for Sunday?

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select "**Update Workout Music**" workflow
4. Click "**Run workflow**" button
5. Click the green "**Run workflow**" button

Music will update in ~5 minutes!

## Song Fetcher Script

Location: `src/js/utils/song_fetcher.js`

### What It Does

**Fetches from YouTube:**

- Searches for workout music using curated queries
- Filters videos: 30+ min, 10K+ views, not live/upcoming
- Verifies all videos work and have visible stats
- Downloads thumbnails and metadata

**Smart Caching:**

- Keeps cache for 30 days per category
- Only refreshes stale categories
- Reduces API quota usage by 90%

**Rate Limiting:**

- 250ms delay between API calls
- Daily budget: 9,000 units (under YouTube's 10,000 limit)
- Automatically stops if quota would be exceeded

### Configuration

Edit `src/js/utils/song_fetcher.js` to customize:

```javascript
// Lines 20-36
const WANT_PER_CATEGORY = 10;       // Songs per category
const MIN_SECONDS = 30 * 60;        // Minimum duration (30 min)
const MIN_VIEWS = 10_000;           // Minimum view count
const REFRESH_DAYS = 30;            // Cache duration

const RATE = {
  delayMsBetweenRequests: 250,      // Rate limit delay
  dailyBudgetUnits: 9000,           // Daily quota limit
};
```

### Add More Categories

Edit the `categories` object (lines 38-133):

```javascript
const categories = {
  "chill workout music": [
    "chill workout mix 1 hour",
    "lo-fi workout music 60 minutes",
    "relaxing gym music 1 hour"
  ],
  // Add more...
}
```

Then update `music-library.js` to recognize the new category.

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. Click on latest "Update Workout Music" run
3. View logs to see:
    - Which categories were refreshed
    - How many videos were fetched
    - API quota used
    - Any errors

### Check Commits

Look for automated commits in your repository:

```
🎵 Auto-update workout music library
github-actions[bot] committed 2 hours ago
```

### Check API Quota

Monitor your YouTube API quota:
https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

**Daily limit:** 10,000 units
**Typical usage:** 1,000-3,000 units per run (with caching)

## Cost Analysis

### API Quota Usage

**First run (no cache):**

- 18 categories × ~5 searches = 90 searches
- 90 searches × 100 units = 9,000 units
- ~200 video details × 1 unit = 200 units
- **Total: ~9,200 units**

**Subsequent runs (with 30-day cache):**

- Only stale categories refresh
- Typical: ~5 categories refreshed
- **Total: ~1,000-3,000 units**

**Free quota:** 10,000 units per day ✅

### Storage & Bandwidth

**File sizes:**

- `workout_music.json`: ~130 KB
- `workout_music_cache.json`: ~160 KB

**Git repo impact:** Minimal (text files compress well)

**Netlify bandwidth:** ~300 KB per deploy (negligible)

## Troubleshooting

### Workflow Not Running

**Check:**

1. GitHub Actions enabled (Settings → Actions)
2. Write permissions granted (Settings → Actions → General)
3. `YT_API_KEY` secret added (Settings → Secrets)
4. Workflow file pushed to `.github/workflows/`

### "Missing YT_API_KEY" Error

**Solution:**

1. Go to repository Settings → Secrets → Actions
2. Verify `YT_API_KEY` secret exists
3. Value should be your YouTube API key (starts with `AIza...`)

### "Quota exceeded" Error

**Solutions:**

1. Wait 24 hours (quota resets daily)
2. Reduce `WANT_PER_CATEGORY` to 5 in `song_fetcher.js`
3. Increase `REFRESH_DAYS` to 60 (refresh less often)
4. Request quota increase from Google

### Workflow Runs But No Commit

**This is normal!**

- If music hasn't changed, no commit is created
- Check logs: "✓ Using cache: [category name]"
- Only stale categories (>30 days) trigger updates

### "Permission denied" When Pushing

**Solution:**

1. Repository Settings → Actions → General
2. "Workflow permissions" → "Read and write permissions"
3. Check "Allow GitHub Actions to create PRs"
4. Save

## Advanced Usage

### Run Locally

Test the script on your machine:

```bash
# Set API key
export YT_API_KEY=your_youtube_api_key_here

# Run script
node src/js/utils/song_fetcher.js
```

Output files:

- `src/js/data/workout_music.json`
- `src/js/data/workout_music_cache.json`

### Change Schedule

Edit `.github/workflows/update-music.yml`:

```yaml
schedule:
  # Every day at 3 AM
  - cron: '0 3 * * *'

  # Every Monday and Friday at 6 PM
  - cron: '0 18 * * 1,5'

  # Twice a month (1st and 15th at noon)
  - cron: '0 12 1,15 * *'
```

[Cron schedule generator](https://crontab.guru/)

### Disable Automatic Updates

Comment out or remove the schedule:

```yaml
# Disable automatic runs, keep manual trigger
# schedule:
#   - cron: '0 2 * * 0'

workflow_dispatch:  # Keep manual trigger
```

### Test Workflow Changes

1. Edit `.github/workflows/update-music.yml`
2. Temporarily change schedule to run soon:
   ```yaml
   # Run in 5 minutes (check current UTC time)
   - cron: '15 14 * * *'
   ```
3. Push changes
4. Wait for workflow to run
5. Check results
6. Change schedule back to Sunday 2 AM

## Benefits

### ✅ For Users

- Always fresh workout music
- 180 curated videos (18 categories × 10 each)
- All videos 30+ minutes long
- High-quality, popular content (10K+ views)

### ✅ For You

- Zero maintenance
- Fully automatic
- Free (GitHub Actions + YouTube API)
- Smart caching reduces costs
- Version controlled (git history)

### ✅ For the App

- Fast loading (static JSON file)
- Offline support (PWA caches it)
- No runtime dependencies
- Simple import: `import songData from './workout_music.json'`

## FAQ

**Q: Can I run it more than once per week?**
A: Yes! Change the cron schedule or trigger manually anytime.

**Q: Will old videos be kept?**
A: No, the cache refreshes with new popular videos every 30 days.

**Q: What if a video gets deleted?**
A: The next run will replace it with a fresh working video.

**Q: Can I add my own videos?**
A: Yes! Edit `workout_music.json` manually and commit. (Will be overwritten on next auto-update)

**Q: Does this cost money?**
A: No! GitHub Actions and YouTube API are free (within quotas).

**Q: Can I see what changed?**
A: Yes! Check the git diff in the auto-commit to see which videos changed.

**Q: What if the workflow fails?**
A: GitHub emails you. Check the logs and fix the issue (usually quota or API key).

---

**Questions or Issues?**
Check the workflow logs in GitHub Actions or the inline comments in `song_fetcher.js`.
