import { Response } from 'express';

export const successResponder = (res: Response, status: number, data: any) => {
  return res.status(status).json({ status, data });
};

export const errorResponder = (
  res: Response,
  status: number,
  message: string,
  errors?: any
) => {
  return res.status(status).json({ status, message, errors });
};
