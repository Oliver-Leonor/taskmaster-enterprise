import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validators";
import { requireAuth } from "../middleware/requireAuth";
import * as AuthController from "../controllers/auth.controllers";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate("body", registerSchema),
  AuthController.register,
);
authRouter.post("/login", validate("body", loginSchema), AuthController.login);
authRouter.post(
  "/refresh",
  validate("body", refreshSchema),
  AuthController.refresh,
);

export function createAuthRouter(opts: { jwtAccessSecret: string }) {
  const router = Router();

  router.post(
    "/register",
    validate("body", registerSchema),
    AuthController.register,
  );
  router.post("/login", validate("body", loginSchema), AuthController.login);
  router.post(
    "/refresh",
    validate("body", refreshSchema),
    AuthController.refresh,
  );

  // Protected route
  router.get("/me", requireAuth(opts.jwtAccessSecret), AuthController.me);

  return router;
}
