import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error Middleware]', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred. Our team has been notified.';

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          code: 'VALIDATION_FAILED',
          message: 'Input validation failed',
          errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
        });
        return;
      }
      next(err);
    }
  };
}
