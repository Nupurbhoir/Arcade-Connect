import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import lobbyRoutes from './routes/lobbyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import statsRoutes from './routes/stats.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('/health', (req, res) => {
    res.json({ ok: true, mongo: mongoose.connection.readyState });
  });

  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/lobby', lobbyRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/stats', statsRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}
