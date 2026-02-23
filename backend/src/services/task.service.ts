import { NotFoundError, ValidationError } from "../utils/errors";
import * as TaskRepo from "../repositories/task.repository";

type Role = "admin" | "manager" | "user";
type Actor = { id: string; role: Role };

type SortBy = "createdAt" | "updatedAt" | "title";
type SortDir = "asc" | "desc";
type DeletedMode = "exclude" | "include" | "only";

function isPrivileged(role: Role) {
  return role === "admin" || role === "manager";
}

function toSort(sortBy: SortBy, sortDir: SortDir) {
  const dir = sortDir === "asc" ? 1 : -1;
  return { [sortBy]: dir } as Record<string, 1 | -1>;
}

export async function createTask(
  actor: Actor,
  input: { title: string; status?: TaskRepo.TaskStatus },
) {
  return TaskRepo.createTask({
    ownerId: actor.id,
    title: input.title,
    status: input.status,
  });
}

export async function getTaskById(actor: Actor, taskId: string) {
  const baseFilter: Record<string, unknown> = { _id: taskId, deletedAt: null };
  if (!isPrivileged(actor.role)) baseFilter.ownerId = actor.id;

  const task = await TaskRepo.findTask(baseFilter);
  if (!task) throw new NotFoundError("Task not found");
  return task;
}

export async function updateTaskById(
  actor: Actor,
  taskId: string,
  input: { title?: string; status?: TaskRepo.TaskStatus },
) {
  const update: Record<string, unknown> = {};
  if (typeof input.title !== "undefined") update.title = input.title;
  if (typeof input.status !== "undefined") update.status = input.status;

  if (Object.keys(update).length === 0)
    throw new ValidationError("No fields to update");

  const filter: Record<string, unknown> = { _id: taskId, deletedAt: null };
  if (!isPrivileged(actor.role)) filter.ownerId = actor.id;

  const updated = await TaskRepo.updateTask(filter, { $set: update });
  if (!updated) throw new NotFoundError("Task not found");
  return updated;
}

export async function deleteTaskById(actor: Actor, taskId: string) {
  // user can delete own; manager/admin can delete any
  const filter: Record<string, unknown> = { _id: taskId, deletedAt: null };
  if (!isPrivileged(actor.role)) filter.ownerId = actor.id;

  const deleted = await TaskRepo.softDeleteTask(filter, actor.id);
  if (!deleted) throw new NotFoundError("Task not found");
  return deleted;
}

export async function restoreTaskById(actor: Actor, taskId: string) {
  if (!isPrivileged(actor.role))
    throw new ValidationError("Only admin/manager can restore tasks");

  const restored = await TaskRepo.restoreTask({ _id: taskId });
  if (!restored) throw new NotFoundError("Task not found");
  return restored;
}

export async function listTasks(
  actor: Actor,
  input: {
    page: number;
    limit: number;
    status?: TaskRepo.TaskStatus;
    q?: string;
    sortBy: SortBy;
    sortDir: SortDir;
    deleted: DeletedMode;
  },
) {
  const filter: Record<string, unknown> = {};

  // owner scoping
  if (!isPrivileged(actor.role)) {
    filter.ownerId = actor.id;
    filter.deletedAt = null; // users never see deleted tasks
  } else {
    // admin/manager can choose deleted mode
    if (input.deleted === "exclude") filter.deletedAt = null;
    if (input.deleted === "only") filter.deletedAt = { $ne: null };
    // include => no deletedAt filter
  }

  if (input.status) filter.status = input.status;
  if (input.q) filter.title = { $regex: input.q, $options: "i" };

  const skip = (input.page - 1) * input.limit;
  const sort = toSort(input.sortBy, input.sortDir);

  const [items, total] = await Promise.all([
    TaskRepo.listTasks({ filter, sort, skip, limit: input.limit }),
    TaskRepo.countTasks(filter),
  ]);

  return {
    page: input.page,
    limit: input.limit,
    total,
    items,
  };
}
