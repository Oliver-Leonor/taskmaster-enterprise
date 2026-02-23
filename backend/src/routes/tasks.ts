import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import * as TaskController from "../controllers/task.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
  listTasksQuerySchema,
} from "../validators/task.validators";

export function createTasksRouter(opts: { jwtAccessSecret: string }) {
  const router = Router();

  router.use(requireAuth(opts.jwtAccessSecret));

  router.post("/", validate("body", createTaskSchema), TaskController.create);
  router.get("/", validate("query", listTasksQuerySchema), TaskController.list);

  router.get(
    "/:id",
    validate("params", taskIdParamsSchema),
    TaskController.getById,
  );
  router.patch(
    "/:id",
    validate("params", taskIdParamsSchema),
    validate("body", updateTaskSchema),
    TaskController.updateById,
  );
  router.delete(
    "/:id",
    validate("params", taskIdParamsSchema),
    TaskController.deleteById,
  );

  // optional restore endpoint (admin/manager only enforced in service)
  router.post(
    "/:id/restore",
    validate("params", taskIdParamsSchema),
    TaskController.restoreById,
  );

  return router;
}
