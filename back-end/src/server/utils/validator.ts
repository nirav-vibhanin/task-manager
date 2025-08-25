import { AnyObjectSchema } from 'yup';
import { Request, Response, NextFunction } from 'express';
import { errorResponder } from './response.js';

export const validate = (schema: AnyObjectSchema, path: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.validate(req[path], { abortEarly: false, stripUnknown: true });
      (req as any)[path] = data;
      next();
    } catch (err: any) {
      return errorResponder(res, 400, 'Validation error', err.errors);
    }
  };
