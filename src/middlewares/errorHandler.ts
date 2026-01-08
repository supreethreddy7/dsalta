import type { Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { HttpError } from '../errors';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // TSOA validation errors
  if (err instanceof ValidateError) {
    return res.status(400).json({
      message: 'Validation Failed',
      details: err?.fields,
    });
  }

  // Typed HTTP errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Internal Server Error',
  });
}
