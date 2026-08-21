import { Router, Request, Response } from 'express';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  verifyPassword,
  createSession,
  validateSession,
  revokeSession,
  updateAdminPassword,
  logSecurityEvent,
  getClientIp,
} from '../auth';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LoginSchema, ChangePasskeySchema } from '../validation/schemas';

export const authRouter = Router();

/**
 * POST /api/admin/login
 * Server-Authoritative Login Endpoint
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const ip = getClientIp(req);

  // 1. Check Rate Limit
  const rateLimitStatus = checkLoginRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Account access is temporarily locked. Please try again in ${rateLimitStatus.lockoutRemainingSeconds} seconds.`,
      lockoutSeconds: rateLimitStatus.lockoutRemainingSeconds,
    });
    return;
  }

  // 2. Validate Request Body
  const validation = LoginSchema.safeParse(req.body);
  if (!validation.success) {
    const failedInfo = recordFailedLogin(ip);
    res.status(400).json({
      success: false,
      error: 'Invalid login request format.',
      remainingAttempts: failedInfo.remainingAttempts,
    });
    return;
  }

  const { password } = validation.data;

  // 3. Verify Password via bcrypt
  const isMatch = await verifyPassword(password);

  if (!isMatch) {
    const failedInfo = recordFailedLogin(ip);
    logSecurityEvent('LOGIN_FAILURE', { ip, attemptCount: MAX_FAILED_LOGIN_ATTEMPTS - failedInfo.remainingAttempts });

    if (failedInfo.lockoutSeconds) {
      res.status(429).json({
        success: false,
        error: `Invalid passkey credentials. Max attempts exceeded. Temporarily locked for ${failedInfo.lockoutSeconds} seconds.`,
        lockoutSeconds: failedInfo.lockoutSeconds,
        remainingAttempts: 0,
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Invalid administrator passkey credentials.',
      remainingAttempts: failedInfo.remainingAttempts,
    });
    return;
  }

  // 4. Success: Reset rate limits, rotate/create session
  recordSuccessfulLogin(ip);
  const session = createSession('admin-root', req);
  logSecurityEvent('LOGIN_SUCCESS', { ip, adminId: 'admin-root' });

  // 5. Issue HttpOnly, Secure, SameSite=Lax cookie
  res.cookie('tp_admin_session', session.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });

  res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: 'admin-root',
      role: 'admin',
      name: 'System Administrator',
    },
  });
});

/**
 * GET /api/admin/session
 * Session Validation & Status Check
 */
authRouter.get('/session', (req: Request, res: Response): void => {
  const sessionCookie = req.cookies?.tp_admin_session;
  let sessionToken = sessionCookie;

  if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
  }

  const session = validateSession(sessionToken);

  if (!session) {
    if (sessionCookie) {
      res.clearCookie('tp_admin_session', { path: '/' });
    }
    res.status(200).json({
      authenticated: false,
    });
    return;
  }

  res.status(200).json({
    authenticated: true,
    user: {
      id: session.adminId,
      role: session.role,
      name: 'System Administrator',
    },
    sessionExpiresAt: session.expiresAt,
  });
});

/**
 * POST /api/admin/logout
 * Session Revocation & Cookie Clearing
 */
authRouter.post('/logout', requireAdminAuth, (req: AuthenticatedRequest, res: Response): void => {
  const sessionCookie = req.cookies?.tp_admin_session;
  let sessionToken = sessionCookie;

  if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
  }

  revokeSession(sessionToken);
  res.clearCookie('tp_admin_session', { path: '/' });

  logSecurityEvent('LOGOUT', {
    ip: getClientIp(req),
    adminId: req.admin?.id,
  });

  res.status(200).json({
    success: true,
    message: 'Admin session terminated successfully.',
  });
});

/**
 * POST /api/admin/change-passkey
 * Server-Side Passkey Update (Argon2/bcrypt)
 */
authRouter.post('/change-passkey', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validation = ChangePasskeySchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid new password format.',
    });
    return;
  }

  const { newPassword } = validation.data;
  await updateAdminPassword(newPassword);

  logSecurityEvent('PASSKEY_CHANGED', {
    ip: getClientIp(req),
    adminId: req.admin?.id,
    reason: 'Passkey hash successfully updated on server',
  });

  res.status(200).json({
    success: true,
    message: 'Administrator passkey updated successfully on server.',
  });
});

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
