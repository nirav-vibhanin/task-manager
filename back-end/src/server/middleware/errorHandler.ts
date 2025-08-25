import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { errorResponder } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (_req: Request, res: Response) => {
  return errorResponder(res, httpStatus.NOT_FOUND, 'Route not found');
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  logger.error(message, { status, stack: err.stack, meta: err.meta });
  return errorResponder(res, status, message, err.errors);
};
