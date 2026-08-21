import { z } from 'zod';

export const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required').max(256, 'Password exceeds max length'),
});

export const ChangePasskeySchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(256),
});

export const PostCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1500),
  content: z.string().min(10, 'Content must be at least 10 characters').max(1000000),
  category: z.string().min(1, 'Category is required').max(100),
  tags: z.array(z.string().max(50)).max(30).default([]),
  authorId: z.string().min(1, 'Author ID is required').max(100),
  featuredImage: z.string().max(3000000),
  readingTime: z.number().int().min(1).max(300).default(5),
  publishedAt: z.string().min(1),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().optional().default(false),
  seoTitle: z.string().max(300).optional(),
  seoDescription: z.string().max(1500).optional(),
  directAnswer: z.string().max(3000).optional(),
  keyTakeaways: z.array(z.string().max(1000)).max(30).optional(),
  ogImage: z.string().max(3000000).optional(),
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const CategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().max(1000).optional().default(''),
  color: z.string().max(50).optional().default('blue'),
  iconName: z.string().max(50).optional().default('Folder'),
  subtopics: z.array(z.string().max(100)).max(30).optional(),
});

export const CategoryUpdateSchema = CategorySchema.partial();

export const AuthorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  role: z.string().min(1).max(100),
  bio: z.string().min(5).max(3000),
  avatar: z.string().max(3000000),
  twitter: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  website: z.string().max(300).optional(),
});

export const AuthorUpdateSchema = AuthorSchema.partial();

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).optional(),
  description: z.string().max(1500).optional(),
  siteUrl: z.string().max(500).optional(),
  postsPerPage: z.number().int().min(1).max(100).optional(),
  enableNewsletter: z.boolean().optional(),
  enableTrending: z.boolean().optional(),
  twitterHandle: z.string().max(100).optional(),
  githubUrl: z.string().max(500).optional(),
  pageMetaOverrides: z.record(z.string(), z.any()).optional(),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address').max(255),
});

export const ImageUploadSchema = z.object({
  data: z.string().min(1, 'Image data is required'),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(100).optional(),
});
