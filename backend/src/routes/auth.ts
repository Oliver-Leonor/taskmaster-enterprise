import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validators";
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
