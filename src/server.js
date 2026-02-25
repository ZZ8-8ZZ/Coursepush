import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { appConfig, validateEnv } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

if (appConfig.nodeEnv === 'production') {
  validateEnv();
} else {
  try {
    validateEnv();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[config] ${error.message}`);
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(appConfig.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(appConfig.apiPrefix, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = appConfig.port;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`CoursePush Admin API listening on http://localhost:${port}`);
});

export default app;
