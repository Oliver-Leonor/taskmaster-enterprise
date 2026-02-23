import type { Request, Response, NextFunction } from "express";
import { AuthenticationError, AuthorizationError } from "../utils/errors";

type Role = "admin" | "manager" | "user";

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)
      return next(new AuthenticationError("Authentication required"));

    if (!allowed.includes(req.user.role)) {
      return next(new AuthorizationError("Insufficient role"));
    }

    next();
  };
}
