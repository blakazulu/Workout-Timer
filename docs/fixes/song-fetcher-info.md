# Song Fetcher Utility

The `song_fetcher.js` script automatically fetches and curates workout music from YouTube using the YouTube Data API v3.

## Features

- **Smart Filtering**: Only includes videos that are:
    - 30+ minutes long
    - Have 10,000+ views
    - Are not live streams or upcoming premieres
    - Have visible like counts

- **Intelligent Caching**:
    - Caches results for 30 days to minimize API usage
    - Only refreshes stale categories
    - Stores metadata in `workout_music_cache.json`

- **Quota Management**:
    - Stays within 9,000 units per day (YouTube's default is 10,000)
    - Estimates costs: search = 100 units, videos = 1 unit
    - Rate limiting with 250ms delay between requests

- **Error Handling**:
    - Automatic retry with exponential backoff (2s, 4s, 6s)
    - Distinguishes between client errors (don't retry) and server errors (retry)
    - Comprehensive logging with emoji indicators

## Setup

### 1. Get a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

### 2. Configure Environment Variables

#### For Local Development

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your API key:

```env
YT_API_KEY=your_actual_youtube_api_key_here
```

#### For GitHub Actions (Automated Weekly Updates)

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `YT_API_KEY`
5. Value: Your YouTube API key
6. Click "Add secret"

#### For Netlify (Optional - for manual runs)

1. Go to your Netlify site dashboard
2. Site settings → Environment variables
3. Add variable:
    - Key: `YT_API_KEY`
    - Value: Your YouTube API key

## Usage

### Manual Execution

Run locally with:

```bash
export YT_API_KEY=your_api_key_here
node src/js/utils/song_fetcher.js
```

Or using .env file:

```bash
# Install dotenv-cli if needed
npm install -g dotenv-cli

# Run with .env
dotenv -e .env node src/js/utils/song_fetcher.js
```

### Automated Weekly Updates

The script runs automatically every **Sunday at 2 AM UTC** via GitHub Actions.

The workflow:

1. Checks out the repository
2. Installs Node.js 18
3. Runs the song fetcher
4. Commits and pushes updated music files if changes detected

**Manual trigger**: Go to Actions → Update Workout Music → Run workflow

## Output Files

- **`src/js/data/workout_music.json`**: Clean JSON for the app (no metadata)
- **`src/js/data/workout_music_cache.json`**: Full cache with timestamps and metadata

## Configuration

Edit `song_fetcher.js` to customize:

```javascript
// CONFIG section (lines 19-36)
const WANT_PER_CATEGORY = 10;       // Videos per category
const MIN_SECONDS = 30 * 60;        // Minimum duration (30 min)
const MIN_VIEWS = 10_000;           // Minimum view count
const REFRESH_DAYS = 30;            // Cache expiration (days)

const RATE = {
  delayMsBetweenRequests: 250,      // Rate limiting delay
  dailyBudgetUnits: 9000,           // Daily quota budget
  costs: { search: 100, videos: 1 } // API cost estimates
};
```

## Categories

The script fetches music for:

**Moods**: Beast Mode, Intense, Energetic, Power, Aggressive, Pump Up, Focus, Motivational

**Genres**: EDM, Rock, Hip Hop, Metal, Trap, Dubstep, Hardstyle, Techno, Phonk, Drum & Bass

Edit the `categories` object (lines 38-133) to add/remove categories.

## Troubleshooting

### "Missing YT_API_KEY environment variable"

- Make sure you've set the environment variable:
  ```bash
  export YT_API_KEY=your_key_here
  ```
- Or created a `.env` file with the key

### "Quota budget exceeded"

- Wait 24 hours for quota to reset
- Reduce `WANT_PER_CATEGORY` or `dailyBudgetUnits`
- Check [Quota usage](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)

### "YouTube API error: 403"

- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Verify your API key is valid and has permissions

### GitHub Actions fails to push

- Ensure GitHub Actions has write permissions:
    - Settings → Actions → General → Workflow permissions
    - Select "Read and write permissions"

## Cost Estimates

With default settings (20 categories, 10 videos each):

- ~20 searches × 100 units = 2,000 units
- ~200 video details × 1 unit = 200 units
- **Total**: ~2,200 units per full refresh (well within 9,000 limit)

Cached runs use 0 units unless categories are stale (>30 days).

## License

MIT
