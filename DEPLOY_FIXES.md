# Deployment Fixes for Live Site

## Issues Fixed

### 1. ✅ Content Security Policy (CSP) - FIXED
**Problem**: YouTube API and Google Fonts were blocked by Netlify's CSP

**Fixed in**: `netlify.toml` (lines 21)

**Changes**:
- Added `https://www.youtube.com` to `script-src` (allows YouTube iframe API)
- Added `https://fonts.googleapis.com` to `style-src` (allows Google Fonts CSS)
- Added `https://fonts.gstatic.com` to `font-src` (allows font files)
- Added `https://img.youtube.com` to `img-src` (allows YouTube thumbnails)
- Added `https://www.googleapis.com` to `connect-src` (allows API calls if needed)

### 2. ✅ PWA Icons - FIXED
**Problem**: Missing PWA icon files causing manifest errors

**Fixed in**:
- `vite.config.js` - Updated to use SVG icon (supported in modern PWAs)
- Created `public/icons/icon.svg` - Simple, themed workout timer icon

**Changes**:
- Simplified from 8 different PNG sizes to 1 SVG icon
- SVG automatically scales to any size needed
- Icon matches app theme (#ff5722 gradient)

### 3. ✅ GitHub Actions Workflow - ADDED
**New Feature**: Automated weekly music library updates

**Added**: `.github/workflows/update-music.yml`

**Features**:
- Runs every Sunday at 2 AM UTC
- Manual trigger available from GitHub Actions tab
- Commits and pushes updated music files automatically
- Includes error reporting and result validation

## What You Need to Do

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix: CSP for YouTube & Google Fonts, PWA icons, add GitHub Actions workflow

- Update Netlify CSP to allow YouTube API and Google Fonts
- Replace PNG icons with scalable SVG icon
- Add weekly automated music library updates via GitHub Actions
- Add security documentation for song fetcher utility"

git push origin main
```

### 2. Add GitHub Secret (Required for GitHub Actions)

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click "**New repository secret**"
4. Name: `YT_API_KEY`
5. Value: Your YouTube Data API v3 key
6. Click "**Add secret**"

### 3. Enable GitHub Actions Write Permissions

1. Go to repository **Settings**
2. **Actions** → **General**
3. Scroll to "**Workflow permissions**"
4. Select "**Read and write permissions**"
5. Check "**Allow GitHub Actions to create and approve pull requests**"
6. Click "**Save**"

### 4. Netlify Will Auto-Deploy

Once you push to main, Netlify will automatically:
- Build the app with the new vite.config.js
- Apply the updated netlify.toml CSP headers
- Include the new SVG icon in the PWA manifest

## Testing After Deploy

### 1. Test YouTube Integration
1. Go to https://workouttimerpro.netlify.app
2. Open DevTools Console (F12)
3. Paste a YouTube URL and click "Load"
4. Check for errors - should see:
   - ✅ "YouTube API ready"
   - ✅ "Player ready"
   - ❌ NO CSP errors

### 2. Test Google Fonts
1. Check DevTools Console
2. Should see NO errors about fonts.googleapis.com

### 3. Test PWA Icon
1. Open Application tab in DevTools
2. Go to "Manifest"
3. Should see the icon with NO errors
4. Icon should display (timer/stopwatch design)

### 4. Test GitHub Actions (Optional)
1. Go to your repo's **Actions** tab
2. Select "**Update Workout Music**"
3. Click "**Run workflow**"
4. Wait for completion
5. Check the workflow logs
6. Verify `src/js/data/workout_music.json` was updated

## Expected Results

### Before Fix:
```
❌ Refused to load https://www.youtube.com/iframe_api (CSP violation)
❌ Refused to load https://fonts.googleapis.com/... (CSP violation)
❌ Error loading icon: icons/icon-144x144.png (404)
❌ YouTube API failed to load
```

### After Fix:
```
✅ YouTube API loaded successfully
✅ Google Fonts loaded
✅ PWA icon loaded
✅ No CSP errors
✅ Video plays normally
```

## Optional: Generate PNG Icons (Future Enhancement)

If you want traditional PNG icons instead of SVG:

1. Use https://realfavicongenerator.net
2. Upload `public/icons/icon.svg`
3. Download the generated icons
4. Place in `public/icons/` directory
5. Update `vite.config.js` with PNG icon sizes

Or use a CLI tool:
```bash
# Install sharp-cli
npm install -g sharp-cli

# Generate all sizes
sharp -i public/icons/icon.svg -o public/icons/icon-72x72.png resize 72 72
sharp -i public/icons/icon.svg -o public/icons/icon-96x96.png resize 96 96
sharp -i public/icons/icon.svg -o public/icons/icon-128x128.png resize 128 128
sharp -i public/icons/icon.svg -o public/icons/icon-144x144.png resize 144 144
sharp -i public/icons/icon.svg -o public/icons/icon-152x152.png resize 152 152
sharp -i public/icons/icon.svg -o public/icons/icon-192x192.png resize 192 192
sharp -i public/icons/icon.svg -o public/icons/icon-384x384.png resize 384 384
sharp -i public/icons/icon.svg -o public/icons/icon-512x512.png resize 512 512
```

## Files Changed

- ✏️ `netlify.toml` - Updated CSP headers
- ✏️ `vite.config.js` - Simplified icon configuration
- ✏️ `.gitignore` - Added .env
- ➕ `public/icons/icon.svg` - New PWA icon
- ➕ `.github/workflows/update-music.yml` - GitHub Actions workflow
- ➕ `.env.example` - Environment variable template
- ➕ `src/js/utils/README.md` - Documentation for song fetcher
- ➕ `DEPLOY_FIXES.md` - This file

## Support

If you still see errors after deploying:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check Netlify deploy logs for build errors
4. Verify the CSP headers are applied using DevTools → Network → Response Headers

---

**Estimated Time to Deploy**: 5 minutes (2 min for GitHub setup, 3 min for Netlify auto-deploy)
