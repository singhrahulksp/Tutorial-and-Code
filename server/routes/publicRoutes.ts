import { Router, Request, Response } from 'express';
import { serverStore } from '../serverStore';
import { NewsletterSubscribeSchema } from '../validation/schemas';

export const publicRouter = Router();

// GET /api/health
publicRouter.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tutorials-and-code-api',
  });
});

// GET /api/posts
publicRouter.get('/posts', (req: Request, res: Response): void => {
  const { category, tag, author, status } = req.query;

  // By default public API only serves published articles
  let posts = serverStore.getPublishedPosts();

  if (category && typeof category === 'string') {
    posts = posts.filter((p) => p.category === category);
  }
  if (tag && typeof tag === 'string') {
    posts = posts.filter((p) => p.tags.includes(tag));
  }
  if (author && typeof author === 'string') {
    posts = posts.filter((p) => p.authorId === author);
  }

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// GET /api/posts/:slug
publicRouter.get('/posts/:slug', (req: Request, res: Response): void => {
  const { slug } = req.params;
  const post = serverStore.getPostBySlug(slug);

  if (!post || post.status !== 'published') {
    res.status(404).json({
      success: false,
      error: 'Article not found or not published',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// POST /api/posts/:id/views
publicRouter.post('/posts/:id/views', (req: Request, res: Response): void => {
  const { id } = req.params;
  serverStore.incrementViews(id);
  res.status(200).json({
    success: true,
  });
});

// GET /api/categories
publicRouter.get('/categories', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: serverStore.getCategories(),
  });
});

// GET /api/authors
publicRouter.get('/authors', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: serverStore.getAuthors(),
  });
});

// GET /api/settings
publicRouter.get('/settings', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: serverStore.getSiteSettings(),
  });
});

// POST /api/newsletter/subscribe
publicRouter.post('/newsletter/subscribe', (req: Request, res: Response): void => {
  const validation = NewsletterSubscribeSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid email address',
    });
    return;
  }

  const { email } = validation.data;
  const result = serverStore.addSubscriber(email);

  res.status(200).json({
    success: true,
    message: result.alreadySubscribed
      ? 'You are already subscribed to the technical dispatch!'
      : 'Thank you for subscribing to Tutorials & Code!',
  });
});
