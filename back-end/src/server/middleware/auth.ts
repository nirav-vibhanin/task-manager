import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponder } from '../utils/response.js';
import { MESSAGES } from '../utils/messages.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return errorResponder(res, 401, MESSAGES.COMMON.UNAUTHORIZED);
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (e) {
    return errorResponder(res, 401, 'Invalid token');
  }
};
