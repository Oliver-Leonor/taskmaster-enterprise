import { TaskModel } from "../models/task.model";

export type TaskStatus = "todo" | "in_progress" | "done";

export async function createTask(input: {
  ownerId: string;
  title: string;
  status?: TaskStatus;
}) {
  return TaskModel.create({
    ownerId: input.ownerId,
    title: input.title,
    status: input.status ?? "todo",
  });
}

export async function findTask(filter: Record<string, unknown>) {
  return TaskModel.findOne(filter).exec();
}

export async function updateTask(
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
) {
  return TaskModel.findOneAndUpdate(filter, update, { new: true }).exec();
}

export async function softDeleteTask(
  filter: Record<string, unknown>,
  deletedBy: string,
) {
  return TaskModel.findOneAndUpdate(
    filter,
    { $set: { deletedAt: new Date(), deletedBy } },
    { new: true },
  ).exec();
}

export async function restoreTask(filter: Record<string, unknown>) {
  return TaskModel.findOneAndUpdate(
    filter,
    { $set: { deletedAt: null, deletedBy: null } },
    { new: true },
  ).exec();
}

export async function listTasks(opts: {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}) {
  return TaskModel.find(opts.filter)
    .sort(opts.sort)
    .skip(opts.skip)
    .limit(opts.limit)
    .exec();
}

export async function countTasks(filter: Record<string, unknown>) {
  return TaskModel.countDocuments(filter).exec();
}
