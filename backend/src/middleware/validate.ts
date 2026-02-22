// backend/src/middleware/validate.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

type RequestPart = "body" | "query" | "params";

export function validate(part: RequestPart, schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return next(new ValidationError("Invalid request", details));
    }

    // overwrite with parsed/typed values
    (req as any)[part] = result.data;
    next();
  };
}
