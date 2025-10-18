/**
 * Admin Authentication Module
 * Handles password protection for the admin dashboard
 *
 * SECURITY NOTE: This is a basic password protection system intended for
 * development/demo purposes only. In production, use proper authentication
 * with server-side validation, bcrypt hashing, and JWT tokens.
 *
 * Password: "123" (stored as SHA-256 hash for basic obfuscation)
 * Session persists until browser close (sessionStorage)
 */

const AUTH_SESSION_KEY = 'admin_authenticated';
const AUTH_TIMESTAMP_KEY = 'admin_auth_timestamp';

// SHA-256 hash of "123" password for basic obfuscation
// Generated via: echo -n "123" | sha256sum
const PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

/**
 * Hash a password using SHA-256
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Check if user is currently authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
  try {
    const authToken = sessionStorage.getItem(AUTH_SESSION_KEY);
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);

    if (!authToken || !timestamp) {
      return false;
    }

    // Check if auth token is valid (simple check)
    const isValid = authToken === 'true';

    // Optional: Add session timeout (e.g., 2 hours)
    const authTime = parseInt(timestamp, 10);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;

    if (now - authTime > twoHours) {
      logout();
      return false;
    }

    return isValid;
  } catch (error) {
    console.error('[Admin Auth] Error checking authentication:', error);
    return false;
  }
}

/**
 * Authenticate with password
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} Authentication result
 */
export async function authenticate(password) {
  try {
    const hashedInput = await hashPassword(password);

    if (hashedInput === PASSWORD_HASH) {
      // Set authentication token in sessionStorage
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());

      console.log('[Admin Auth] Authentication successful');
      return true;
    } else {
      console.warn('[Admin Auth] Authentication failed - invalid password');
      return false;
    }
  } catch (error) {
    console.error('[Admin Auth] Error during authentication:', error);
    return false;
  }
}

/**
 * Log out and clear authentication
 */
export function logout() {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
    console.log('[Admin Auth] Logged out');
  } catch (error) {
    console.error('[Admin Auth] Error during logout:', error);
  }
}

/**
 * Get authentication timestamp
 * @returns {number|null} Timestamp of authentication
 */
export function getAuthTimestamp() {
  try {
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('[Admin Auth] Error getting auth timestamp:', error);
    return null;
  }
}

/**
 * Get session duration in minutes
 * @returns {number} Session duration in minutes
 */
export function getSessionDuration() {
  const timestamp = getAuthTimestamp();
  if (!timestamp) return 0;

  const now = Date.now();
  const durationMs = now - timestamp;
  return Math.floor(durationMs / 1000 / 60);
}
