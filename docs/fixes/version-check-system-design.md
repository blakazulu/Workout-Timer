# Version Check System Design

**Date:** 2025-10-13
**Status:** Design Phase
**Goal:** Implement robust version checking with backend verification and force update capability

## Current State Analysis

### Version Tracking Issues
1. **Inconsistent Versions:**
   - HTML: hardcoded "v1.0.4" in index.html:149
   - package.json: "1.0.0"
   - No single source of truth

2. **No Version Verification:**
   - Service worker only detects file changes
   - No client-server version comparison
   - Users might run stale code even after deployment

3. **Silent Updates:**
   - `registerType: 'autoUpdate'` updates silently
   - No way to force immediate update
   - Relies on service worker detecting changes

## Proposed Solution: Hybrid Version Check System

### Architecture Overview

```
┌─────────────┐
│ package.json│ ← Single Source of Truth
└──────┬──────┘
       │
       ├─ Build Time ────────┐
       │                     │
       ↓                     ↓
┌──────────────┐      ┌─────────────┐
│   index.html │      │version.json │
│ <meta ver..> │      │ (public/)   │
└──────────────┘      └─────────────┘
       │                     │
       │      App Load       │
       │   ┌──────────┐      │
       └──→│  Client  │←─────┘
           │  (app.js)│
           └────┬─────┘
                │
                ↓
          Check Version
                │
     ┌──────────┼──────────┐
     │          │          │
  Match      Mismatch   Error
     │          │          │
     ↓          ↓          ↓
  Continue   Force      Retry
            Update

```

### Implementation Components

## 1. Build-Time Version Injection

### A. Update package.json (Single Source of Truth)
```json
{
  "name": "cycle",
  "version": "1.0.4",  ← Update from 1.0.0
  "buildVersion": "auto"  ← Generated: YYYYMMDD.HHMMSS
}
```

### B. Create Build Script (`scripts/generate-version.js`)
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));

const version = packageJson.version;
const buildTime = new Date().toISOString();
const buildVersion = buildTime.replace(/[-:T.]/g, '').slice(0, 14); // YYYYMMDDHHMMSS

const versionData = {
  version,        // 1.0.4
  buildVersion,   // 20251013143022
  buildTime,      // 2025-10-13T14:30:22.123Z
  environment: process.env.NODE_ENV || 'production'
};

// Write version.json to public folder
fs.writeFileSync(
  path.resolve(__dirname, '../public/version.json'),
  JSON.stringify(versionData, null, 2)
);

console.log(`✓ Generated version.json: ${version} (build: ${buildVersion})`);
```

### C. Update Vite Config to Inject Version
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  plugins: [
    VitePWA({
      // ... existing config
    })
  ]
});
```

### D. Update package.json Scripts
```json
{
  "scripts": {
    "dev": "node scripts/generate-version.js && vite",
    "build": "node scripts/generate-version.js && vite build",
    "preview": "vite preview"
  }
}
```

## 2. Client-Side Version Checking

### A. Create Version Check Module (`src/js/utils/version-check.js`)

```javascript
/**
 * Version Check Utility
 * Compares client version with server version and forces update if mismatch
 */

// Embedded version (injected at build time)
const CLIENT_VERSION = __APP_VERSION__;
const CLIENT_BUILD_TIME = __BUILD_TIME__;

// Check interval (default: 5 minutes for active users)
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

let checkIntervalId = null;

/**
 * Fetch server version from version.json
 * @returns {Promise<Object>} Server version data
 */
async function fetchServerVersion() {
  try {
    const response = await fetch('/version.json', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch server version:', error);
    throw error;
  }
}

/**
 * Compare versions
 * @param {string} clientVer - Client version
 * @param {string} serverVer - Server version
 * @returns {boolean} True if versions match
 */
function versionsMatch(clientVer, serverVer) {
  // Normalize versions (remove 'v' prefix if present)
  const normalizeVersion = (v) => v.replace(/^v/, '').trim();
  return normalizeVersion(clientVer) === normalizeVersion(serverVer);
}

/**
 * Force service worker update and reload
 */
async function forceUpdate() {
  console.log('🔄 Forcing app update...');

  try {
    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Clear localStorage (except user data)
    const preserveKeys = ['cycleSettings', 'cycleHistory'];
    const dataToPreserve = {};
    preserveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) dataToPreserve[key] = value;
    });

    localStorage.clear();

    // Restore preserved data
    Object.entries(dataToPreserve).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Reload with cache busting
    window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
  } catch (error) {
    console.error('Failed to force update:', error);
    // Fallback: simple reload
    window.location.reload(true);
  }
}

/**
 * Check version and update if needed
 * @param {boolean} showNotification - Whether to show notification to user
 * @returns {Promise<Object>} Check result
 */
export async function checkVersion(showNotification = false) {
  try {
    const serverData = await fetchServerVersion();
    const serverVersion = serverData.version;
    const serverBuildTime = serverData.buildTime;

    console.log('📋 Version Check:', {
      client: CLIENT_VERSION,
      clientBuild: CLIENT_BUILD_TIME,
      server: serverVersion,
      serverBuild: serverBuildTime
    });

    const match = versionsMatch(CLIENT_VERSION, serverVersion);

    if (!match) {
      console.warn('⚠️ Version mismatch detected!');
      console.warn(`Client: ${CLIENT_VERSION} | Server: ${serverVersion}`);

      if (showNotification) {
        // Show user-friendly notification
        const shouldUpdate = confirm(
          `🔄 New version available!\n\n` +
          `Current: v${CLIENT_VERSION}\n` +
          `Latest: v${serverVersion}\n\n` +
          `Update now to get the latest features and fixes?`
        );

        if (shouldUpdate) {
          await forceUpdate();
        }
      } else {
        // Force update without notification
        await forceUpdate();
      }

      return { match: false, action: 'updated' };
    }

    console.log('✓ Version up to date:', CLIENT_VERSION);
    return { match: true, action: 'none' };

  } catch (error) {
    console.error('Version check failed:', error);
    return { match: null, action: 'error', error };
  }
}

/**
 * Start periodic version checking
 * @param {number} intervalMs - Check interval in milliseconds
 */
export function startVersionChecking(intervalMs = CHECK_INTERVAL_MS) {
  // Stop existing interval
  stopVersionChecking();

  // Initial check (without notification)
  checkVersion(false);

  // Periodic checks
  checkIntervalId = setInterval(() => {
    checkVersion(false);
  }, intervalMs);

  console.log(`✓ Version checking started (interval: ${intervalMs / 1000}s)`);
}

/**
 * Stop periodic version checking
 */
export function stopVersionChecking() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

/**
 * Get current client version info
 * @returns {Object} Version info
 */
export function getVersionInfo() {
  return {
    version: CLIENT_VERSION,
    buildTime: CLIENT_BUILD_TIME
  };
}
```

### B. Integrate into App (`src/js/app.js`)

```javascript
// Add to imports
import { startVersionChecking, checkVersion, getVersionInfo } from './utils/version-check.js';

// Modify init() function
function init() {
  // ... existing initialization code ...

  // Start version checking
  startVersionChecking();

  // Log version info
  const versionInfo = getVersionInfo();
  console.log(`🚀 CYCLE v${versionInfo.version} (${versionInfo.buildTime})`);

  // ... rest of initialization ...
}
```

### C. Add Manual Check Button (Optional)

Add to HTML (in header next to Install button):
```html
<button class="btn-version-check" id="versionCheckBtn" title="Check for updates">
  <i class="ph-bold ph-arrows-clockwise"></i>
  <span class="version-text">v1.0.4</span>
</button>
```

Add to event listeners:
```javascript
const versionCheckBtn = $("#versionCheckBtn");
if (versionCheckBtn) {
  versionCheckBtn.addEventListener("click", async () => {
    const versionInfo = getVersionInfo();
    versionCheckBtn.innerHTML = '<i class="ph-bold ph-spinner"></i> Checking...';
    versionCheckBtn.disabled = true;

    try {
      await checkVersion(true); // Show notification
    } finally {
      versionCheckBtn.innerHTML = `<i class="ph-bold ph-arrows-clockwise"></i>
                                    <span class="version-text">v${versionInfo.version}</span>`;
      versionCheckBtn.disabled = false;
    }
  });
}
```

## 3. Backend/Netlify Integration

### Option A: Static version.json (Simpler)
- Generated during build by `scripts/generate-version.js`
- Deployed with app
- No server-side logic needed
- ✅ **Recommended for this project**

### Option B: Netlify Function (Advanced)
Create `netlify/functions/version.js`:
```javascript
export default async function handler(request, context) {
  // Could read from environment variable or database
  const version = process.env.APP_VERSION || '1.0.4';

  return new Response(JSON.stringify({
    version,
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    environment: process.env.CONTEXT || 'production'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
```

Update `netlify.toml`:
```toml
[build.environment]
  APP_VERSION = "1.0.4"  # Or read from package.json in build script
```

## 4. Testing Strategy

### Manual Testing
1. **Deploy with v1.0.4**
   - Verify version.json served correctly
   - Check console logs for version
   - Confirm no version mismatch

2. **Simulate version mismatch**
   - Edit local version in Vite define
   - Run dev server
   - Should detect mismatch and force update

3. **Test update flow**
   - Open app in browser
   - Deploy new version to Netlify
   - Wait for check interval (or click manual check button)
   - Should show notification or auto-update
   - Verify page reloads with new version

### Automated Testing (Future)
```javascript
// tests/version-check.test.js
describe('Version Check', () => {
  it('should detect version mismatch', () => {
    // Mock fetch to return different version
    // Assert that forceUpdate is called
  });

  it('should preserve user data during update', () => {
    // Set localStorage data
    // Trigger forceUpdate
    // Verify data preserved
  });
});
```

## 5. User Experience Considerations

### Update Scenarios

**Scenario 1: Background Update (Silent)**
- User has app open
- New version deploys
- Check interval triggers (5 min)
- Version mismatch detected
- App updates silently in background
- User sees no interruption

**Scenario 2: Manual Check**
- User clicks "Check for Updates" button
- Shows spinner while checking
- If update available: shows notification with change details
- User chooses to update or not
- If yes: clears cache and reloads

**Scenario 3: Stale Cache**
- User hasn't opened app in days
- Opens app with old cached version
- Initial version check on load
- Detects mismatch immediately
- Forces update without notification (silent)
- User sees latest version

### Notification Copy
```
🔄 New version available!

Current: v1.0.3
Latest: v1.0.4

Update now to get the latest features and fixes?

[Cancel] [Update]
```

## 6. Configuration Options

### Environment Variables (Netlify)
```toml
# netlify.toml
[build.environment]
  # Optional: Override version checking behavior
  ENABLE_VERSION_CHECK = "true"
  VERSION_CHECK_INTERVAL = "300000"  # 5 minutes in ms
```

### Feature Flags
```javascript
// src/js/config.js
export const VERSION_CHECK_CONFIG = {
  enabled: true,
  checkInterval: 5 * 60 * 1000,  // 5 minutes
  showNotifications: false,       // Silent updates
  preserveLocalStorage: ['cycleSettings', 'cycleHistory']
};
```

## 7. Rollout Plan

### Phase 1: Infrastructure (Week 1)
- [x] Create version-check-system-design.md
- [ ] Create `scripts/generate-version.js`
- [ ] Update `package.json` version to 1.0.4
- [ ] Create `public/version.json` (template)
- [ ] Update build scripts

### Phase 2: Implementation (Week 1)
- [ ] Create `src/js/utils/version-check.js`
- [ ] Integrate into `src/js/app.js`
- [ ] Update `vite.config.js` with version injection
- [ ] Add version check button to UI (optional)

### Phase 3: Testing (Week 1)
- [ ] Test in development
- [ ] Test version mismatch detection
- [ ] Test force update flow
- [ ] Verify localStorage preservation

### Phase 4: Deployment (Week 2)
- [ ] Deploy to Netlify staging
- [ ] Monitor for 24 hours
- [ ] Deploy to production
- [ ] Monitor version checks in console

### Phase 5: Monitoring (Ongoing)
- [ ] Add analytics tracking for version checks
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Optimize check interval if needed

## 8. Benefits

✅ **For Users:**
- Always get latest features and bug fixes
- No stale cached code
- Smooth update experience
- Optional manual update control

✅ **For Developers:**
- Confidence that users run current version
- Can push critical fixes with certainty
- Easier debugging (know exact version user has)
- Centralized version management

✅ **For Operations:**
- No need to clear CDN cache manually
- Force updates for security patches
- Better version tracking and analytics
- Reduced support burden

## 9. Security Considerations

- ✅ version.json served with no-cache headers
- ✅ Version check uses cache-busting
- ✅ Preserves user data during update
- ✅ Validates server response before acting
- ✅ Handles fetch errors gracefully
- ⚠️ Consider signing version.json to prevent tampering (future enhancement)

## 10. Fallbacks & Error Handling

```javascript
// If version check fails
try {
  await checkVersion();
} catch (error) {
  // Log error but don't block app
  console.error('Version check failed, continuing anyway');
  // App continues to work normally
}

// If force update fails
try {
  await forceUpdate();
} catch (error) {
  // Fallback to simple reload
  window.location.reload(true);
}
```

## Recommendation

**Implement Option A (Static version.json)** because:
1. ✅ Simpler - no server-side logic needed
2. ✅ Faster - direct file fetch, no function cold start
3. ✅ Cheaper - no additional Netlify function costs
4. ✅ Reliable - generated at build time, always in sync
5. ✅ Sufficient - meets all requirements for this project

**Start with silent updates** (no notifications) because:
1. Better UX for workout app - no interruptions
2. Users always have latest version
3. Can add notifications later if needed

## Next Steps

Ready to implement? I can:
1. Create all the files (scripts, version-check module)
2. Update existing files (package.json, vite.config.js, app.js)
3. Add manual check button to UI
4. Test the implementation
5. Update documentation

Should we proceed with implementation?