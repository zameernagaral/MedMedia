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
import { mysqlDb } from './data/mysqlDb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on MedMedia API' });
});

app.listen(PORT, () => {
  console.log(`[MedMedia] Backend Server listening at http://localhost:${PORT}`);
});

export default app;
