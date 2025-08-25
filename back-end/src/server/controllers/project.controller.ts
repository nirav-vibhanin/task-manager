import httpStatus from 'http-status';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { successResponder, errorResponder } from '../utils/response.js';
import { MESSAGES } from "../utils/messages.js";
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const payload = { ...req.body, createdBy: req.user!.id };
    const project = await Project.create(payload);
    return successResponder(res, httpStatus.CREATED, { project, message: MESSAGES.PROJECT.CREATED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.BAD_REQUEST, err.message);
  }
};

export const getProjects = async (req: AuthRequest, res: Response ) => {
  try {
    const { q, status, sort = 'asc', page = '1', limit = '20' } = req.query as any;
    const filter: any = { createdBy: req.user!.id };
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (status) filter.status = status;

    const sortOpt = { startDate: sort === 'desc' ? -1 : 1 } as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [items, total] = await Promise.all([
      Project.find(filter).sort(sortOpt).skip((pageNum - 1) * limitNum).limit(limitNum),
      Project.countDocuments(filter)
    ]);

    return successResponder(res, httpStatus.OK, { items, total, page: pageNum, limit: limitNum });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;
    const project = await Project.findOne({ _id: id, createdBy: req.user!.id });
    if (!project) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.PROJECT.NOT_FOUND);
    const tasks = await Task.find({ project: project._id });
    return successResponder(res, httpStatus.OK, { project, tasks });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export const updateProject = async (req: AuthRequest, res: Response ) => {
  try {
    const { id } = req.params as any;
    const project = await Project.findOneAndUpdate({ _id: id, createdBy: req.user!.id }, req.body, { new: true });
    if (!project) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.PROJECT.NOT_FOUND);
    return successResponder(res, httpStatus.OK, { project, message: MESSAGES.PROJECT.UPDATED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.BAD_REQUEST, err.message);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;
    const project = await Project.findOneAndDelete({ _id: id, createdBy: req.user!.id });
    if (!project) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.PROJECT.NOT_FOUND);
    await Task.deleteMany({ project: id });
    return successResponder(res, httpStatus.OK, { message: MESSAGES.PROJECT.DELETED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};
