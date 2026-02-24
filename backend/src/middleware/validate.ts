// backend/src/middleware/validate.ts
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

type RequestPart = "body" | "query" | "params";

function replaceObjectContents(target: any, source: any) {
  // keep same object reference (avoids assigning to getter-only req.query)
  if (target && typeof target === "object") {
    for (const k of Object.keys(target)) delete target[k];
    Object.assign(target, source);
    return;
  }
  // fallback if target isn't an object (rare)
  target = source;
}

export function validate(part: RequestPart, schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const current = (req as any)[part];

    const result = schema.safeParse(current);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return next(new ValidationError("Invalid request", details));
    }

    const parsed = result.data;

    // ✅ DO NOT do: (req as any)[part] = parsed;  (breaks for req.query in Express 5)
    // Instead, mutate the existing object in-place:
    const target = (req as any)[part];
    if (target && typeof target === "object") {
      for (const k of Object.keys(target)) delete target[k];
      Object.assign(target, parsed);
    } else {
      // for completeness; body/params typically are objects anyway
      (req as any)[part] = parsed;
    }

    next();
  };
}
