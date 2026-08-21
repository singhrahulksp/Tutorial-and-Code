/**
 * Security & Cryptographic Authentication Utilities for Tutorials and Code CMS
 */

const SALT_PREFIX = 'techpulse_cms_auth_v2:';
// Precomputed cryptographic SHA-256 salted hash for default authentication (never plaintext)
const DEFAULT_SALTED_PASSWORD_HASH = 'f913fa9c5674bfa757c07f143c120e380733c3315ca454e13883d75fd21b7106';
const SESSION_STORAGE_KEY = 'techpulse_admin_session_v2';
const RATE_LIMIT_STORAGE_KEY = 'techpulse_login_rate_limit_v2';

// 12-hour session lifetime (in milliseconds)
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
// Max failed attempts before lockout
export const MAX_LOGIN_ATTEMPTS = 5;
// Lockout duration: 5 minutes
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export interface AdminSession {
  token: string;
  authenticated: boolean;
  issuedAt: number;
  expiresAt: number;
  lastActive: number;
}

export interface RateLimitState {
  failedAttempts: number;
  lockoutUntil: number | null;
  lastAttemptAt: number;
}

/**
 * Computes cryptographic SHA-256 hash using the Web Crypto API.
 */
export async function computeHash(text: string, customSalt?: string): Promise<string> {
  const salt = customSalt || SALT_PREFIX;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}${text}`);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback lightweight JS SHA-256 if crypto.subtle is unavailable
  return fallbackSha256(`${salt}${text}`);
}

/**
 * Fallback pure-JS SHA-256 implementation
 */
function fallbackSha256(str: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = str[lengthProperty] * 8;

  let hash = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
  const k = [
    1116353408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221,
    3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580,
    3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    2554220582, 2821834349, 2952996808, 3210305846, 3336571891, 3584528711, 113926993, 338241895,
    666307205, 773529746, 1455774135, 1734327206, 2144134035, 2337777704, 2469669041, 2489588674,
    3060985831, 3141707146, 3562949448, 3826175755, 466465870, 615818324, 1251860012, 1462473824,
    1884784614, 2135624040, 2577011929, 2755776632, 3162837915, 3354054566, 3727764343, 4008162272,
    51597840, 439603099, 706189703, 1104615053, 1403066759, 1782625666, 2191491825, 2385419991
  ];

  let strLength = str[lengthProperty];
  for (i = 0; i < strLength; i++) {
    const charCode = str.charCodeAt(i);
    words[i >> 2] |= (charCode & 0xff) << (24 - (i % 4) * 8);
  }

  words[strLength >> 2] |= 0x80 << (24 - (strLength % 4) * 8);
  words[(((strLength + 8) >> 6) << 4) + 15] = asciiBitLength;

  const w = new Array(64);
  const wordsLen = words.length;

  for (i = 0; i < wordsLen; i += 16) {
    const a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    const e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    let w0 = a, w1 = b, w2 = c, w3 = d, w4 = e, w5 = f, w6 = g, w7 = h;

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[j + i] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(w4, 6) ^ rightRotate(w4, 11) ^ rightRotate(w4, 25);
      const ch = (w4 & w5) ^ (~w4 & w6);
      const temp1 = (w7 + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(w0, 2) ^ rightRotate(w0, 13) ^ rightRotate(w0, 22);
      const maj = (w0 & w1) ^ (w0 & w2) ^ (w1 & w2);
      const temp2 = (s0 + maj) | 0;

      w7 = w6;
      w6 = w5;
      w5 = w4;
      w4 = (w3 + temp1) | 0;
      w3 = w2;
      w2 = w1;
      w1 = w0;
      w0 = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + w0) | 0;
    hash[1] = (hash[1] + w1) | 0;
    hash[2] = (hash[2] + w2) | 0;
    hash[3] = (hash[3] + w3) | 0;
    hash[4] = (hash[4] + w4) | 0;
    hash[5] = (hash[5] + w5) | 0;
    hash[6] = (hash[6] + w6) | 0;
    hash[7] = (hash[7] + w7) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Constant-time string comparison to defend against timing side-channel attacks.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Rate Limiting State Management
 */
export function getRateLimitState(): RateLimitState {
  if (typeof window === 'undefined') {
    return { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: 0 };
  }
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      // If lockout duration has elapsed, clear lockout
      if (state.lockoutUntil && Date.now() > state.lockoutUntil) {
        const cleared: RateLimitState = { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: Date.now() };
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(cleared));
        return cleared;
      }
      return state;
    }
  } catch {
    // Ignore error
  }
  return { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: 0 };
}

export function recordFailedLoginAttempt(): RateLimitState {
  const current = getRateLimitState();
  const failedAttempts = current.failedAttempts + 1;
  let lockoutUntil = current.lockoutUntil;

  if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  const newState: RateLimitState = {
    failedAttempts,
    lockoutUntil,
    lastAttemptAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newState));
  }
  return newState;
}

export function resetFailedLoginAttempts(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  }
}

/**
 * Validates the admin password securely using constant-time salted hash comparison.
 * Plaintext passwords are never stored or evaluated directly.
 */
export async function verifyAdminPassword(
  inputPassword: string,
  customPasswordHash?: string
): Promise<{ success: boolean; reason?: string; remainingAttempts?: number; lockoutUntil?: number | null }> {
  const rateLimit = getRateLimitState();

  // Check if locked out
  if (rateLimit.lockoutUntil && Date.now() < rateLimit.lockoutUntil) {
    const remainingSeconds = Math.ceil((rateLimit.lockoutUntil - Date.now()) / 1000);
    return {
      success: false,
      reason: `Account locked due to multiple failed attempts. Try again in ${remainingSeconds}s.`,
      lockoutUntil: rateLimit.lockoutUntil,
    };
  }

  const inputHash = await computeHash(inputPassword);
  const targetHash = customPasswordHash || DEFAULT_SALTED_PASSWORD_HASH;

  const isMasterMatch = constantTimeEquals(inputHash, targetHash);

  if (isMasterMatch) {
    resetFailedLoginAttempts();
    return { success: true };
  }

  // Failed attempt
  const updatedRateLimit = recordFailedLoginAttempt();
  const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - updatedRateLimit.failedAttempts);

  if (updatedRateLimit.lockoutUntil) {
    const remainingSeconds = Math.ceil((updatedRateLimit.lockoutUntil - Date.now()) / 1000);
    return {
      success: false,
      reason: `Maximum attempts exceeded. Security cooldown active for ${remainingSeconds} seconds.`,
      lockoutUntil: updatedRateLimit.lockoutUntil,
      remainingAttempts: 0,
    };
  }

  return {
    success: false,
    reason: `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before security lockout.`,
    remainingAttempts: remaining,
  };
}

/**
 * Creates a cryptographically random session token with expiry.
 */
export function createAdminSession(): AdminSession {
  const token = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  const now = Date.now();
  const session: AdminSession = {
    token,
    authenticated: true,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    lastActive: now,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Validates the current admin session from storage.
 */
export function getValidAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session: AdminSession = JSON.parse(raw);
    if (!session.authenticated || !session.expiresAt) {
      clearAdminSession();
      return null;
    }

    const now = Date.now();
    // Check if expired
    if (now > session.expiresAt) {
      clearAdminSession();
      return null;
    }

    // Refresh last active timestamp
    session.lastActive = now;
    // Slide expiration if active within reasonable window
    session.expiresAt = now + SESSION_DURATION_MS;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

/**
 * Destroys the active admin session.
 */
export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('techpulse_admin_auth_v1');
  }
}
