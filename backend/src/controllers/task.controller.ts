import type { Request, Response, NextFunction } from "express";
import * as TaskService from "../services/task.service";

function toTaskJson(t: any) {
  return {
    id: String(t._id),
    ownerId: String(t.ownerId),
    title: t.title,
    status: t.status,
    deletedAt: t.deletedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await TaskService.createTask(req.user!, req.body);
    res.status(201).json({ task: toTaskJson(task) });
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await TaskService.listTasks(req.user!, req.query as any);
    res.json({
      page: result.page,
      limit: result.limit,
      total: result.total,
      items: result.items.map(toTaskJson),
    });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await TaskService.getTaskById(req.user!, id);
    res.json({ task: toTaskJson(task) });
  } catch (e) {
    next(e);
  }
}

export async function updateById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ifUnmodifiedSince = req.header("if-unmodified-since") ?? undefined;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await TaskService.updateTaskById(req.user!, id, req.body, {
      ifUnmodifiedSince,
    });
    res.json({ task: toTaskJson(task) });
  } catch (e) {
    next(e);
  }
}

export async function deleteById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await TaskService.deleteTaskById(req.user!, id);
    res.json({ task: toTaskJson(task) });
  } catch (e) {
    next(e);
  }
}

export async function restoreById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await TaskService.restoreTaskById(req.user!, id);
    res.json({ task: toTaskJson(task) });
  } catch (e) {
    next(e);
  }
}
