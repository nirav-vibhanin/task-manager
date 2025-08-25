import httpStatus from 'http-status';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { successResponder, errorResponder } from '../utils/response.js';
import { MESSAGES } from '../utils/messages.js';
import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { project: projectId } = req.body;
    const project = await Project.findOne({ _id: projectId, createdBy: req.user!.id });
    if (!project) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.PROJECT.NOT_FOUND);

    const existing = await Task.findOne({ project: projectId, title: req.body.title });
    if (existing) return errorResponder(res, httpStatus.BAD_REQUEST, MESSAGES.TASK.TITLE_EXISTS);

    const task = await Task.create(req.body);
    return successResponder(res, httpStatus.CREATED, { task, message: MESSAGES.TASK.CREATED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.BAD_REQUEST, err.message);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;
    const task = await Task.findById(id).populate('project');
    if (!task) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.TASK.NOT_FOUND);
    if ((task.project as any).createdBy.toString() !== req.user!.id) {
      return errorResponder(res, httpStatus.FORBIDDEN, 'Forbidden');
    }
    return successResponder(res, httpStatus.OK, { task });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export const getTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params as any;
    const { q } = req.query as any;
    const project = await Project.findOne({ _id: projectId, createdBy: req.user!.id });
    if (!project) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.PROJECT.NOT_FOUND);

    const search: any = { project: projectId };
    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim(), 'i');
      search.$or = [{ title: rx }, { description: rx }];
    }
    const tasks = await Task.find(search);
    return successResponder(res, httpStatus.OK, { items: tasks });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;
    const task = await Task.findById(id).populate('project');
    if (!task) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.TASK.NOT_FOUND);
    if ((task.project as any).createdBy.toString() !== req.user!.id) {
      return errorResponder(res, httpStatus.FORBIDDEN, 'Forbidden');
    }

    // Do not allow changing the parent project via update
    const { project: _omitProject, ...update } = req.body || {};
    const updated = await Task.findByIdAndUpdate(id, update, { new: true });
    return successResponder(res, httpStatus.OK, { task: updated, message: MESSAGES.TASK.UPDATED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.BAD_REQUEST, err.message);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;
    const task = await Task.findById(id).populate('project');
    if (!task) return errorResponder(res, httpStatus.NOT_FOUND, MESSAGES.TASK.NOT_FOUND);
    if ((task.project as any).createdBy.toString() !== req.user!.id) {
      return errorResponder(res, httpStatus.FORBIDDEN, 'Forbidden');
    }

    await Task.findByIdAndDelete(id);
    return successResponder(res, httpStatus.OK, { message: MESSAGES.TASK.DELETED });
  } catch (err: any) {
    return errorResponder(res, httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};
