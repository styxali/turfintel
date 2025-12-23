import { Request, Response, NextFunction } from 'express';
import {
  DomainError,
  ValidationError,
  RaceNotFoundError,
  HorseNotFoundError,
  ExternalApiError,
  CacheError,
  DatabaseError
} from '../../../shared/errors/DomainErrors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[ERROR]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: true,
      type: 'ValidationError',
      message: err.message,
      fields: err.fields
    });
  }

  // Not found errors
  if (err instanceof RaceNotFoundError || err instanceof HorseNotFoundError) {
    return res.status(404).json({
      error: true,
      type: err.name,
      message: err.message
    });
  }

  // External API errors
  if (err instanceof ExternalApiError) {
    return res.status(502).json({
      error: true,
      type: 'ExternalApiError',
      message: err.message,
      service: err.service
    });
  }

  // Cache errors (non-critical, log but don't fail)
  if (err instanceof CacheError) {
    console.warn('[CACHE ERROR]', err.message);
    return res.status(500).json({
      error: true,
      type: 'CacheError',
      message: 'Cache operation failed, but request may succeed'
    });
  }

  // Database errors
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      error: true,
      type: 'DatabaseError',
      message: 'Database operation failed'
    });
  }

  // Generic domain errors
  if (err instanceof DomainError) {
    return res.status(400).json({
      error: true,
      type: err.name,
      message: err.message
    });
  }

  // Unknown errors
  return res.status(500).json({
    error: true,
    type: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
}
