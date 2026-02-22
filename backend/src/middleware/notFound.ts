// backend/src/middleware/notFound.ts
import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError("Route not found"));
}
