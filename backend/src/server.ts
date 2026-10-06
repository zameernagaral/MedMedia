import path from 'path';
import fs from 'fs';
import * as Sentry from '@sentry/node';
import pinoHttp from 'pino-http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import hpp from 'hpp';
import prisma from './data/prismaClient';
import { requireRole } from './middleware/role';
import { env } from './config/env';

import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import clipsRoutes from './routes/clips';
import opportunitiesRoutes from './routes/opportunities';
import usersRoutes from './routes/users';
import searchRoutes from './routes/search';
import storiesRoutes from './routes/stories';
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import eventsRoutes from './routes/events';
import resourcesRoutes from './routes/resources';
import settingsRoutes from './routes/settings';
import conversationsRoutes from './routes/conversations';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  tracesSampleRate: 1.0,
});

const app = express();
app.disable('x-powered-by'); // hide Express signature
if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
const PORT = env.PORT;

// Resolve candidate dist paths for web frontend
const candidateDistPaths = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'web/dist'),
  path.resolve(process.cwd(), '../web/dist')
];
const frontendDist = candidateDistPaths.find(p => fs.existsSync(p));

const publicSeoPaths = ['/', '/about', '/privacy', '/terms', '/contact'];
const publicSiteUrl = env.PUBLIC_SITE_URL?.replace(/\/+$/, '');
app.get('/robots.txt', (_req, res) => {
  const sitemapLine = publicSiteUrl ? `Sitemap: ${publicSiteUrl}/sitemap.xml\n` : '';
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /settings\nDisallow: /messages\n${sitemapLine}`);
});
app.get('/sitemap.xml', (_req, res) => {
  if (!publicSiteUrl) {
    return res.status(503).type('text/plain').send('Set PUBLIC_SITE_URL to enable the production sitemap.');
  }
  const urls = publicSeoPaths.map(route => `  <url><loc>${new URL(route, `${publicSiteUrl}/`).toString()}</loc></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

import cookieParser from 'cookie-parser';

// Middleware (support larger payloads for device image uploads)
const corsOrigins = new Set(env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean));
app.use(cors({
  origin: (origin, callback) => {
    // Native clients and server-to-server calls do not send Origin headers.
    if (!origin || corsOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'base-uri': ["'self'"],
      'font-src': ["'self'", 'https:', 'data:'],
      'form-action': ["'self'"],
      'frame-ancestors': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'media-src': ["'self'", 'data:', 'https:'],
      'object-src': ["'none'"],
      'script-src': ["'self'"],
      'script-src-attr': ["'none'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      'connect-src': ["'self'", 'https:']
    }
  }
}));
app.use(pinoHttp({
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined
}));
app.use(hpp());

if (frontendDist) {
  console.log(`[MedMedia] Serving production frontend build from: ${frontendDist}`);
  app.use(express.static(frontendDist));
}
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Rate Limiting (Global)
const redisOptions = {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1
} as const;
const redisClient = env.REDIS_URL
  ? new Redis(env.REDIS_URL, redisOptions)
  : new Redis({
      host: env.REDIS_HOST || '127.0.0.1',
      port: env.REDIS_PORT || 6379,
      password: env.REDIS_PASSWORD || undefined,
      ...redisOptions
    });
redisClient.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[Redis Warning] Redis connection unavailable');
  }
});

const useRedis = env.USE_REDIS;

const globalLimiter = rateLimit({
  store: useRedis
    ? new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as any
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', globalLimiter);


// Healthcheck
const healthcheck = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'online',
    service: 'MedMedia Healthcare API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
app.get('/health', healthcheck);
app.get('/api/health', healthcheck);

// Readiness endpoint – checks DB and Redis connectivity
app.get('/api/ready', async (req, res) => {
  try {
    await prisma.$connect();
    if (useRedis) await redisClient.ping();
    res.json({ ready: true });
  } catch (err) {
    const code = typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code).slice(0, 40)
      : 'UNKNOWN';
    console.error(`[Readiness] dependency check failed (${code})`);
    res.status(503).json({ ready: false });
  }
});

import uploadRoutes from './routes/upload';

// Route mount points
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/conversations', conversationsRoutes);

// Fallback to React index.html for SPA routes (if frontend dist exists)
if (frontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

Sentry.setupExpressErrorHandler(app);

// 404 handler
// Centralized error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  const isServerError = status >= 500;
  const code = isServerError ? 'INTERNAL_ERROR' : (err.code || 'REQUEST_ERROR');
  const message = isServerError ? 'An unexpected error occurred' : (err.message || 'Invalid request');
  res.status(status).json({ success: false, error: { code, message } });
});

// 404 handler (must be after routes and before error handler)
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found on MedMedia API' } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MedMedia] Backend Server listening on port ${PORT}`);
  });
}

export default app;
