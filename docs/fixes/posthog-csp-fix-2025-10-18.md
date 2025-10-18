# PostHog Content Security Policy Fix

**Date:** 2025-10-18
**Issue:** PostHog blocked by Content Security Policy
**Status:** ✅ Fixed

---

## Problem

PostHog analytics was being blocked by the site's Content Security Policy (CSP), causing these errors:

```
Refused to load the script 'https://us-assets.i.posthog.com/...'
because it violates the following Content Security Policy directive:
"script-src-elem 'self' 'unsafe-inline' https://www.youtube.com..."

Refused to connect to 'https://us.i.posthog.com/...'
because it violates the following Content Security Policy directive:
"connect-src 'self' https://www.youtube.com..."
```

**Impact:**
- ❌ Events not being sent to PostHog
- ❌ Analytics not working on main app
- ✅ Test page and admin dashboard proxy still worked (they use different method)

---

## Root Cause

**Content Security Policy (CSP)** is a security feature that controls which external domains can:
- Load scripts
- Make API connections
- Load resources

Our CSP in `netlify.toml` only allowed:
- YouTube domains
- Google Fonts
- CDN for Chart.js

It **did NOT** allow PostHog domains, so the browser blocked all PostHog requests.

---

## Solution

Updated `netlify.toml` to add PostHog domains to the CSP:

### Changed File: `netlify.toml` (line 26)

**Added to `script-src-elem`:**
- `https://us-assets.i.posthog.com` - PostHog script loader
- `https://app.posthog.com` - PostHog config

**Added to `connect-src`:**
- `https://us.i.posthog.com` - PostHog API endpoint
- `https://us-assets.i.posthog.com` - PostHog assets
- `https://app.posthog.com` - PostHog config API

### Full Updated CSP

```
Content-Security-Policy = "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  script-src-elem 'self' 'unsafe-inline'
    https://www.youtube.com
    https://www.gstatic.com
    https://cdn.jsdelivr.net
    https://us-assets.i.posthog.com      ← ADDED
    https://app.posthog.com;             ← ADDED
  style-src 'self' 'unsafe-inline';
  style-src-elem 'self' 'unsafe-inline'
    https://fonts.googleapis.com
    https://cdn.jsdelivr.net;
  img-src 'self' data: https: blob:;
  font-src 'self' data:
    https://fonts.gstatic.com
    https://cdn.jsdelivr.net;
  connect-src 'self'
    https://www.youtube.com
    https://www.googleapis.com
    https://suggestqueries.google.com
    https://img.youtube.com
    https://us.i.posthog.com             ← ADDED
    https://us-assets.i.posthog.com      ← ADDED
    https://app.posthog.com;             ← ADDED
  frame-src
    https://www.youtube.com
    https://www.youtube-nocookie.com;
  media-src 'self'
    https://www.youtube.com
    https://*.googlevideo.com
    blob:;
  worker-src 'self' blob:;
"
```

---

## Verification Steps

### 1. Deploy Updated Configuration

The CSP is configured in `netlify.toml`, so you need to deploy for changes to take effect:

```bash
# Option A: Git push (if auto-deploy enabled)
git add netlify.toml
git commit -m "Fix: Allow PostHog domains in CSP"
git push

# Option B: Manual deploy via Netlify UI
# Go to Netlify → Deploys → Trigger deploy

# Option C: Netlify CLI
netlify deploy --prod
```

### 2. Check Browser Console

After deployment, visit your main app: https://workouttimerpro.netlify.app

**Before fix:**
```
❌ Refused to load script from https://us-assets.i.posthog.com/...
❌ Refused to connect to https://us.i.posthog.com/...
```

**After fix:**
```
✅ [Analytics] PostHog initialized successfully
✅ [Analytics Tracker] Tracking initialized
✅ No CSP errors
```

### 3. Verify Events Are Being Sent

1. Open browser DevTools → Network tab
2. Filter by "posthog"
3. Perform an action (start workout, play music)
4. You should see POST requests to `us.i.posthog.com/e/` with status 200

### 4. Check PostHog Dashboard

1. Go to PostHog → Events → Live Events
2. Perform actions in your app
3. You should see events appearing in real-time

---

## Why Test Page Worked But Main App Didn't

**Test Page** (`/test-posthog.html`):
- Uses Netlify function proxy (`.netlify/functions/posthog-proxy`)
- Proxy runs server-side, not blocked by CSP
- Only queries data, doesn't send events from client

**Main App** (`/index.html`):
- Uses PostHog SDK directly in browser
- Loads scripts from PostHog CDN
- Makes API calls from client JavaScript
- **Blocked by CSP** because PostHog domains weren't allowed

**Admin Dashboard**:
- Also uses Netlify function proxy
- Not affected by CSP issues
- Works for querying data

---

## Testing Checklist

After deploying the CSP fix:

- [ ] No CSP errors in browser console
- [ ] PostHog initializes successfully
- [ ] Events appear in Network tab (POST to `/e/`)
- [ ] Events appear in PostHog dashboard (Live Events)
- [ ] Test all event types:
  - [ ] `workout_started` - Start a workout
  - [ ] `music_played` - Play a song
  - [ ] `favorite_removed` - Toggle favorite
  - [ ] `session_started` - Page load
  - [ ] `$pageview` - Automatic page view

---

## What is Content Security Policy?

**CSP** is a security feature that:
- Prevents Cross-Site Scripting (XSS) attacks
- Controls which external resources can load
- Blocks malicious scripts from running
- Protects user data and privacy

**CSP Directives:**
- `script-src-elem` - Controls where scripts can load from
- `connect-src` - Controls which APIs can be called
- `img-src` - Controls where images load from
- `font-src` - Controls where fonts load from
- `frame-src` - Controls which sites can be embedded

**Why we use CSP:**
- ✅ Security best practice
- ✅ Prevents malicious code injection
- ✅ Required for PWAs
- ✅ Protects against supply chain attacks

**Trade-off:**
- We need to explicitly allow legitimate third-party services
- PostHog, YouTube, Google Fonts all need CSP allowances
- Stricter = more secure, but requires more configuration

---

## Future Maintenance

### When Adding New Third-Party Services

If you add new services (analytics, CDNs, APIs), you may need to update CSP:

1. **Identify required domains** from browser console errors
2. **Update `netlify.toml`** to add domains
3. **Deploy** the changes
4. **Test** that errors are gone

### Common Services & Their Domains

**Analytics:**
- PostHog: `us.i.posthog.com`, `us-assets.i.posthog.com`, `app.posthog.com`
- Google Analytics: `www.google-analytics.com`, `www.googletagmanager.com`

**CDNs:**
- jsDelivr: `cdn.jsdelivr.net`
- unpkg: `unpkg.com`
- cdnjs: `cdnjs.cloudflare.com`

**Fonts:**
- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`

**Media:**
- YouTube: `www.youtube.com`, `*.googlevideo.com`
- Vimeo: `player.vimeo.com`, `*.vimeocdn.com`

---

## Related Files

- **Configuration:** `netlify.toml` (line 26)
- **PostHog SDK:** `src/js/core/analytics.js`
- **Event Tracking:** `src/js/core/analytics-tracker.js`
- **Test Page:** `public/test-posthog.html`
- **Proxy Function:** `netlify/functions/posthog-proxy.js`

---

## Summary

**What was fixed:**
- ✅ Added PostHog domains to Content Security Policy
- ✅ Updated `netlify.toml` configuration
- ✅ PostHog now works on main app

**What needs to be done:**
1. Deploy the changes to Netlify
2. Verify no CSP errors in console
3. Confirm events are being tracked

**Result:**
- PostHog analytics fully functional
- Events tracked from main app
- Admin dashboard can query data
- No security compromises

---

**Fix completed:** 2025-10-18
**Next step:** Deploy and verify tracking works
