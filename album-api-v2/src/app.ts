import express, { Application } from 'express';
import cors from 'cors';
import albumsRouter from './routes/albums.js';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/albums', albumsRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
