import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validate } from '../utils/validator.js';
import * as yup from 'yup';

const router = Router();

const registerSchema = yup.object({
  name: yup.string().required().min(3),
  email: yup.string().required().email(),
  password: yup.string().required().min(6).matches(/\d/, 'Password must include at least 1 number'),
  gender: yup.string().oneOf(['Male', 'Female', 'Other']).required()
});

const loginSchema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6)
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
