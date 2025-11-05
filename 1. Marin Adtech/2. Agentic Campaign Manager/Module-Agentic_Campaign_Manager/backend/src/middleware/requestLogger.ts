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
  const startTime = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

