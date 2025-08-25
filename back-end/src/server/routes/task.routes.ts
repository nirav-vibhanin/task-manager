import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../utils/validator.js';
import * as yup from 'yup';
import { createTask, deleteTask, getTasksByProject, updateTask, getTaskById } from '../controllers/task.controller.js';

const router = Router();

// Validation schemas
const createTaskSchema = yup.object({
  project: yup.string().required(),
  title: yup.string().required().min(3),
  description: yup.string().max(500).optional(),
  dueDate: yup.date().min(new Date(), 'Due date must be >= today').optional(),
  status: yup.mixed<'Pending' | 'In Progress' | 'Completed'>().oneOf(['Pending', 'In Progress', 'Completed']).default('Pending')
});

// For updates, allow partial payload; do not require 'project'
const updateTaskSchema = yup.object({
  project: yup.string().optional(),
  title: yup.string().min(3).optional(),
  description: yup.string().max(500).optional(),
  dueDate: yup.date().min(new Date(), 'Due date must be >= today').optional(),
  status: yup.mixed<'Pending' | 'In Progress' | 'Completed'>().oneOf(['Pending', 'In Progress', 'Completed']).optional()
});

router.get('/project/:projectId', auth, getTasksByProject);
router.get('/:id', auth, getTaskById);
router.post('/', auth, validate(createTaskSchema), createTask);
router.put('/:id', auth, validate(updateTaskSchema), updateTask);
router.patch('/:id', auth, validate(updateTaskSchema), updateTask);
router.delete('/:id', auth, deleteTask);

export default router;
