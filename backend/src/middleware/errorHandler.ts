import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../config/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const anyErr = err as any;

  // malformed JSON body -> 400
  if (
    anyErr?.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && anyErr?.status === 400)
  ) {
    logger.warn("Malformed JSON body", { requestId: req.requestId });
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Malformed JSON body" },
    });
  }

  // Known, expected errors
  if (err instanceof AppError) {
    logger.warn("AppError", {
      requestId: req.requestId,
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // ✅ Unknown errors: log message + stack so we can debug
  const name = anyErr?.name;
  const message = anyErr?.message;
  const stack = anyErr?.stack;

  logger.error("Unhandled error", {
    requestId: req.requestId,
    name,
    message,
    stack,
  });

  // Helpful dev response (still safe enough for local)
  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProd ? "Something went wrong." : message || "Internal error",
      requestId: req.requestId,
    },
  });
}
