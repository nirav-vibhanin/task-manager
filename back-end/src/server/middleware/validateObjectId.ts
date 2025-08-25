import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorResponder } from '../utils/response.js';

export const validateObjectId = (paramName: string) => (req: Request, res: Response, next: NextFunction) => {
  const id = (req.params as any)[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorResponder(res, 400, `Invalid id parameter: ${paramName}`);
  }
  next();
};
