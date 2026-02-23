import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

export function createTasksRouter(opts: { jwtAccessSecret: string }) {
  const router = Router();

  // All /tasks routes require login
  router.use(requireAuth(opts.jwtAccessSecret));

  // Example: any authenticated user can list
  router.get("/", (req, res) => {
    res.json({
      message: "tasks list (stub)",
      viewer: req.user,
    });
  });

  // Example: only admin/manager can delete (stub)
  router.delete("/:id", requireRole("admin", "manager"), (req, res) => {
    res.json({
      message: `deleted task ${req.params.id} (stub)`,
      actor: req.user,
    });
  });

  return router;
}
