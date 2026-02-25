export class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 422, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = '资源已存在') {
    super(message, 409);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = '无权访问该资源') {
    super(message, 403);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = '身份验证失败') {
    super(message, 401);
  }
}

export const assertOwnership = (entityUserId, currentUserId) => {
  if (!entityUserId || entityUserId !== currentUserId) {
    throw new AuthorizationError('无权操作他人数据');
  }
};

export const handleZodError = (error) => {
  if (error?.issues) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ValidationError('参数校验失败', details);
  }
  throw error;
};
