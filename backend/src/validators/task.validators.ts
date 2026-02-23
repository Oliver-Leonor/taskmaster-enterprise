import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

export const taskIdParamsSchema = z.object({
  id: mongoId,
});

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.enum(["todo", "in_progress", "done"]).optional(),
  q: z.string().min(1).max(200).optional(),

  sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),

  // exclude/include/only deleted
  deleted: z.enum(["exclude", "include", "only"]).default("exclude"),
});
