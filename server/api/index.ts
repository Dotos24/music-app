import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../config/db';
import authRoutes from './auth/routes';
import songsRoutes from './songs/routes';
import playlistsRoutes from './playlists/routes';
import likedSongsRoutes from './liked-songs/routes';
// @ts-ignore - Импортируем админ-маршруты
const adminRoutes = require('../admin');

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к MongoDB
connectDB();

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
app.use('/api/playlists', playlistsRoutes);
app.use('/api/liked-songs', likedSongsRoutes);

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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Server shut down');
  process.exit(0);
});
