import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Safe read methods bypass CSRF check
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Public newsletter subscription and view counter endpoints are public
  if (
    req.path === '/api/newsletter/subscribe' ||
    req.path.startsWith('/api/posts/') && req.path.endsWith('/views') ||
    req.path === '/api/health'
  ) {
    return next();
  }

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers['host'];

  // If custom header x-requested-with or x-admin-csrf is present (standard SPA AJAX protection)
  const hasCustomHeader = Boolean(req.headers['x-requested-with'] || req.headers['x-admin-action']);

  if (hasCustomHeader) {
    return next();
  }

  // Check Origin
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host) {
        return next();
      }
    } catch {
      // ignore
    }
  }

  // Check Referer
  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) {
        return next();
      }
    } catch {
      // ignore
    }
  }

  // If running in development / test without host mismatch
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  res.status(403).json({
    success: false,
    error: 'Cross-Site Request Forgery (CSRF) validation failed. Forbidden request origin.',
  });
}
