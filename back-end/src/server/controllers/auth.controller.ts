import httpStatus from 'http-status';
import User from '../models/User.js';
import { successResponder, errorResponder } from '../utils/response.js';
import jwt, { SignOptions } from 'jsonwebtoken';
import { MESSAGES } from '../utils/messages.js';
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, gender } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return errorResponder(res, httpStatus.BAD_REQUEST, MESSAGES.AUTH.EMAIL_EXISTS);

    const user = await User.create({ name, email, password, gender });
    return successResponder(res, httpStatus.CREATED, { id: user._id, email: user.email, name: user.name });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponder(res, httpStatus.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);

    const ok = await user.comparePassword(password);
    if (!ok) return errorResponder(res, httpStatus.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);

    // Ensure expiresIn matches the expected type (number | StringValue)
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const expiresIn: SignOptions['expiresIn'] = expiresInEnv
      ? (expiresInEnv as unknown as SignOptions['expiresIn'])
      : '7d';

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn }
    );

    return successResponder(res, httpStatus.OK, { token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};
