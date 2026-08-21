/**
 * Client-Side Security & API Helper Utilities for Tutorials and Code CMS
 *
 * NOTE: All authentication verification, password hashing (bcrypt), session lifecycle,
 * and rate limiting are strictly enforced server-side.
 */

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: {
    id: string;
    role: string;
    name: string;
  };
  sessionExpiresAt?: number;
}

export interface LoginResult {
  success: boolean;
  authenticated?: boolean;
  error?: string;
  lockoutSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Perform server-authoritative admin login
 */
export async function loginAdminServer(password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'login',
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed.',
        lockoutSeconds: data.lockoutSeconds,
        remainingAttempts: data.remainingAttempts,
      };
    }

    return {
      success: true,
      authenticated: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error during login request.',
    };
  }
}

/**
 * Check active admin session from server (HttpOnly cookie)
 */
export async function checkAdminSessionServer(): Promise<AuthSessionResponse> {
  try {
    const res = await fetch('/api/admin/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-admin-action': 'session-check',
      },
    });

    if (!res.ok) {
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: Boolean(data.authenticated),
      user: data.user,
      sessionExpiresAt: data.sessionExpiresAt,
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Invalidate admin session on server and clear cookie
 */
export async function logoutAdminServer(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'logout',
      },
    });
  } catch {
    // Ignore network error on logout
  }
}

/**
 * Update admin passkey on server
 */
export async function changeAdminPasskeyServer(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/change-passkey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'change-passkey',
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update administrator passkey.',
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error updating passkey.',
    };
  }
}

/**
 * Sanitizes URLs to prevent `javascript:`, `data:` and malicious schemes in links.
 */
export function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Allow relative URLs starting with / or #
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow only http and https protocols
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    // Malformed URL
  }

  return '#';
}

/**
 * Escapes HTML entities to prevent raw HTML execution in text fields.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
