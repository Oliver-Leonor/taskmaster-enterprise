import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  const id =
    incoming && incoming.trim() ? incoming.trim() : crypto.randomUUID();

  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}
