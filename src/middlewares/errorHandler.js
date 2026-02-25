import { appConfig } from '../config/env.js';
import { AppError } from '../services/errors.js';

export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: '未找到对应的接口',
      details: null,
    },
  });
};

export const errorHandler = (err, _req, res, _next) => {
  const isKnownError = err instanceof AppError;
  const statusCode = err.statusCode ?? (isKnownError ? 400 : 500);
  const payload = {
    success: false,
    error: {
      message: err.message ?? '服务器内部错误',
      details: err.details ?? null,
    },
  };
  if (!isKnownError && appConfig.nodeEnv !== 'production') {
    payload.error.stack = err.stack;
  }
  res.status(statusCode).json(payload);
};
