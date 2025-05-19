import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../config/db';
import authRoutes from './auth/routes';
import songsRoutes from './songs/routes';
import supportRoutes from './support/routes';
import albumsRoutes from './albums/routes';
import playlistsRoutes from './playlists/routes';
import artistsRoutes from './artists/routes';
// @ts-ignore - Импортируем админ-маршруты
const adminRoutes = require('../admin');
import mongoose from 'mongoose';

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  console.log('Server will continue running, but database functionality will be limited');
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..'));

// Статические файлы
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/artists', artistsRoutes);

// Администраторский интерфейс с простой защитой
app.use('/admin', (req, res, next) => {
  // Простая защита с помощью Basic Auth
  const auth = { login: 'admin', password: 'admin' };
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Требуется аутентификация');
}, adminRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Debug endpoint to check MongoDB connection
app.get('/api/debug/db', (_req, res) => {
  res.json({
    mongoEnv: process.env.MONGODB_URI ? 'Set' : 'Not set',
    mongoConfig: process.env.MONGODB_URI?.replace(/:[^:]*@/, ':***@') || 'Not available',
    connectionState: mongoose.connection.readyState
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Server shut down');
  process.exit(0);
});
