import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { databaseReady } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);

export function healthCheck(_req, res) {
  const connected = databaseReady();
  return res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'degraded', database: connected ? 'connected' : 'disconnected' });
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { 'img-src': ["'self'", 'data:', 'blob:', 'https:'] } } }));
app.use(cors({ origin(origin, callback) {
  if (!origin || corsOrigins.includes(origin)) return callback(null, true);
  const error = new Error('Origen no permitido por CORS.');
  error.status = 403;
  return callback(error);
} }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', healthCheck);
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviceRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
