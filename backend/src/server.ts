import path from 'path';
import fs from 'fs';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import pinoHttp from 'pino-http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();


Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

const app = express();
app.disable('x-powered-by'); // hide Express signature
const PORT = env.PORT || 5001;

// Resolve candidate dist paths for web frontend
const candidateDistPaths = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'web/dist'),
  path.resolve(process.cwd(), '../web/dist')
];
const frontendDist = candidateDistPaths.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`[MedMedia] Serving production frontend build from: ${frontendDist}`);
  app.use(express.static(frontendDist));
}

import cookieParser from 'cookie-parser';

// Middleware (support larger payloads for device image uploads)
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(cors({
  origin: corsOrigins.length ? corsOrigins : false,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve local uploads (Must be before Helmet to avoid Cross-Origin-Resource-Policy blocks)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Security Middlewares
app.use(helmet());
app.use(pinoHttp({
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined
}));
app.use(hpp());

// Rate Limiting (Global)
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true
});
redisClient.on('error', (err) => {
  console.warn('[Redis Warning]', err.message);
});

const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as any
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', globalLimiter);


// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MedMedia Healthcare API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Readiness endpoint – checks DB and Redis connectivity
app.get('/api/ready', async (req, res) => {
  try {
    await prisma.$connect();
    await redisClient.ping();
    res.json({ ready: true });
  } catch (err) {
    res.status(500).json({ ready: false, error: (err as any).message });
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
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  res.status(status).json({ success: false, error: { code, message } });
});

// 404 handler (must be after routes and before error handler)
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found on MedMedia API' } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[MedMedia] Backend Server listening at http://localhost:${PORT}`);
  });
}

export default app;
