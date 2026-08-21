import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request } from 'express';

// Configuration Constants
export const BCRYPT_SALT_ROUNDS = 12;
export const IDLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes idle expiration
export const ABSOLUTE_SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours max lifetime
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

// Default Admin Password Hash (bcrypt cost 12 for initial setup if env is unset)
// Generated securely for initial boot: 'AdminPass@2026!#'
const INITIAL_FALLBACK_BCRYPT_HASH =
  '$2a$12$Nlm5y7l7lR6q4s9sKkZ36.qgK9MvYn9q2X9pU0n0d9R0x5s0z9k5e';

export interface AdminSessionRecord {
  sessionId: string;
  adminId: string;
  role: 'admin';
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

export interface RateLimitEntry {
  failedAttempts: number;
  lockoutUntil: number | null;
  lastAttemptAt: number;
}

// In-Memory Server-Side Stores
const sessions = new Map<string, AdminSessionRecord>();
const loginRateLimits = new Map<string, RateLimitEntry>();

// Active password hash in server memory (initialized from env or fallback)
let currentAdminPasswordHash: string =
  process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim().length > 0
    ? process.env.ADMIN_PASSWORD_HASH.trim()
    : INITIAL_FALLBACK_BCRYPT_HASH;

// Clean up expired sessions periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt || now - session.lastActivity > IDLE_TIMEOUT_MS) {
      sessions.delete(sessionId);
    }
  }
  for (const [key, entry] of loginRateLimits.entries()) {
    if (entry.lockoutUntil && now > entry.lockoutUntil && now - entry.lastAttemptAt > 60 * 60 * 1000) {
      loginRateLimits.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Security Logging Helper (Strictly omits secrets and credentials)
 */
export function logSecurityEvent(
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOCKOUT_TRIGGERED'
    | 'LOGOUT'
    | 'SESSION_EXPIRED'
    | 'PASSKEY_CHANGED'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'ARTICLE_MUTATION'
    | 'SETTINGS_MUTATION',
  details: { ip?: string; adminId?: string; resourceId?: string; reason?: string; attemptCount?: number }
) {
  const timestamp = new Date().toISOString();
  console.log(
    `[SECURITY_AUDIT] ${timestamp} [${eventType}] - ` +
      `IP: ${details.ip || 'unknown'} | ` +
      `Admin: ${details.adminId || 'none'} | ` +
      (details.resourceId ? `Resource: ${details.resourceId} | ` : '') +
      (details.reason ? `Reason: ${details.reason} | ` : '') +
      (details.attemptCount !== undefined ? `Attempts: ${details.attemptCount}` : '')
  );
}

/**
 * Client IP Extractor
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Server-Side Rate Limiter for Login
 */
export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  lockoutRemainingSeconds?: number;
  remainingAttempts?: number;
} {
  const now = Date.now();
  const entry = loginRateLimits.get(ip);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS };
  }

  // Check if currently locked out
  if (entry.lockoutUntil && now < entry.lockoutUntil) {
    const remainingSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { allowed: false, lockoutRemainingSeconds: remainingSeconds, remainingAttempts: 0 };
  }

  // If lockout expired, reset
  if (entry.lockoutUntil && now >= entry.lockoutUntil) {
    loginRateLimits.delete(ip);
    return { allowed: true, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - entry.failedAttempts);
  return { allowed: true, remainingAttempts: remaining };
}

export function recordFailedLogin(ip: string): { lockoutUntil: number | null; remainingAttempts: number; lockoutSeconds?: number } {
  const now = Date.now();
  const current = loginRateLimits.get(ip) || { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: now };
  const failedAttempts = current.failedAttempts + 1;
  let lockoutUntil = current.lockoutUntil;
  let lockoutSeconds: number | undefined;

  if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    lockoutUntil = now + LOCKOUT_DURATION_MS;
    lockoutSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    logSecurityEvent('LOCKOUT_TRIGGERED', { ip, attemptCount: failedAttempts });
  }

  loginRateLimits.set(ip, {
    failedAttempts,
    lockoutUntil,
    lastAttemptAt: now,
  });

  const remaining = Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - failedAttempts);
  return { lockoutUntil, remainingAttempts: remaining, lockoutSeconds };
}

export function recordSuccessfulLogin(ip: string): void {
  loginRateLimits.delete(ip);
}

/**
 * Password Verification using bcrypt
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, currentAdminPasswordHash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Update Admin Password Hash (bcrypt cost 12)
 */
export async function updateAdminPassword(newPassword: string): Promise<void> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  currentAdminPasswordHash = await bcrypt.hash(newPassword, salt);
}

/**
 * Session Lifecycle Management
 */
export function createSession(adminId: string, req: Request): AdminSessionRecord {
  // Generate 256-bit cryptographically secure session identifier
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();

  const session: AdminSessionRecord = {
    sessionId,
    adminId,
    role: 'admin',
    createdAt: now,
    lastActivity: now,
    expiresAt: now + ABSOLUTE_SESSION_LIFETIME_MS,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  };

  sessions.set(sessionId, session);
  return session;
}

export function validateSession(sessionId?: string): AdminSessionRecord | null {
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const now = Date.now();

  // Check absolute session lifetime
  if (now > session.expiresAt) {
    sessions.delete(sessionId);
    logSecurityEvent('SESSION_EXPIRED', { adminId: session.adminId, reason: 'Absolute timeout reached' });
    return null;
  }

  // Check idle timeout
  if (now - session.lastActivity > IDLE_TIMEOUT_MS) {
    sessions.delete(sessionId);
    logSecurityEvent('SESSION_EXPIRED', { adminId: session.adminId, reason: 'Idle timeout reached' });
    return null;
  }

  // Slide idle activity window
  session.lastActivity = now;
  return session;
}

export function revokeSession(sessionId?: string): void {
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
}

export function revokeAllSessionsForAdmin(): void {
  sessions.clear();
}
