import { Request, Response, NextFunction } from 'express';

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests for debugging and monitoring
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Logging middleware for request/response tracking
  // Debug logging removed - use structured logging in production
  next();
};

