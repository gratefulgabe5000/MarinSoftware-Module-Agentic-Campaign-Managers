import { Request, Response, NextFunction } from 'express';

/**
 * Custom Error Interface
 */
export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
}

/**
 * Error Handler Middleware
 * Centralized error handling for Express application
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode,
  });

  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

