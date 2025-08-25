import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../utils/validator.js';
import * as yup from 'yup';
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from '../controllers/project.controller.js';

const router = Router();

const projectSchema = yup.object({
  name: yup.string().required().min(3),
  description: yup.string().max(1000).optional(),
  startDate: yup.date().required(),
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be >= Start Date').optional(),
  status: yup.mixed<'Pending' | 'In Progress' | 'Completed'>().oneOf(['Pending', 'In Progress', 'Completed']).default('Pending')
});

const querySchema = yup.object({
  q: yup.string().optional(),
  status: yup.mixed<'Pending' | 'In Progress' | 'Completed'>().oneOf(['Pending', 'In Progress', 'Completed']).optional(),
  sort: yup.mixed<'asc' | 'desc'>().oneOf(['asc', 'desc']).optional(),
  page: yup.string().optional(),
  limit: yup.string().optional()
});

router.get('/', auth, validate(querySchema, 'query'), getProjects);
router.get('/:id', auth, getProjectById);
router.post('/', auth, validate(projectSchema), createProject);
router.put('/:id', auth, validate(projectSchema), updateProject);
router.delete('/:id', auth, deleteProject);

export default router;
