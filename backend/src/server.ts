import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import { mysqlDb } from './data/mysqlDb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Middleware (support larger payloads for device image uploads)
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MedMedia Healthcare API',
    mysql: mysqlDb.getStatus(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on MedMedia API' });
});

app.listen(PORT, () => {
  console.log(`[MedMedia] Backend Server listening at http://localhost:${PORT}`);
});

export default app;
