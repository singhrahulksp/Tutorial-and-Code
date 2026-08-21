import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/authRoutes';
import { adminRouter } from './server/routes/adminRoutes';
import { publicRouter } from './server/routes/publicRoutes';
import { csrfProtection } from './server/middleware/csrfMiddleware';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. HTTP Security Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://images.unsplash.com',
            'https://*.googleusercontent.com',
            'https://*.firebasestorage.app',
          ],
          connectSrc: [
            "'self'",
            'https://*.googleapis.com',
            'https://*.firebaseio.com',
            'wss://*.firebaseio.com',
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
            'https://firestore.googleapis.com',
          ],
          frameAncestors: ["'self'", 'https://ai.studio', 'https://*.google.com'],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Cookie Parser
  app.use(cookieParser(process.env.SESSION_SECRET || 'techpulse-secure-session-key'));

  // 3. JSON and URL-encoded body parser with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. CSRF Protection Middleware
  app.use(csrfProtection);

  // 5. API Routes
  app.use('/api/admin', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);

  // 6. Global Error Handling Middleware (Never leak stack traces in production)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[UNHANDLED_SERVER_ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      error: 'An internal server error occurred.',
    });
  });

  // 7. Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER_START] Tutorials & Code CMS running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
