import { Request, Response, NextFunction } from 'express';
import { validateSession, logSecurityEvent, getClientIp } from '../auth';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    role: 'admin';
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Extract session token from HttpOnly cookie first, then Authorization header as fallback
  const sessionCookie = req.cookies?.tp_admin_session;
  let sessionToken = sessionCookie;

  if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
  }

  const session = validateSession(sessionToken);

  if (!session) {
    const ip = getClientIp(req);
    logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
      ip,
      reason: 'Missing or expired admin session',
      resourceId: req.originalUrl,
    });

    // Clear stale cookie if present
    if (sessionCookie) {
      res.clearCookie('tp_admin_session', { path: '/' });
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized. An active administrator session is required.',
    });
    return;
  }

  req.admin = {
    id: session.adminId,
    role: session.role,
  };

  next();
}
