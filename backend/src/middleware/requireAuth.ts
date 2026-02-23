import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../utils/errors";

type Role = "admin" | "manager" | "user";

type AccessTokenPayload = {
  sub: string;
  role: Role;
  typ: "access";
  iat?: number;
  exp?: number;
};

export function requireAuth(jwtAccessSecret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return next(new AuthenticationError("Missing Bearer token"));
    }

    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = jwt.verify(token, jwtAccessSecret) as AccessTokenPayload;

      if (!payload?.sub || payload?.typ !== "access" || !payload?.role) {
        return next(new AuthenticationError("Invalid access token"));
      }

      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return next(new AuthenticationError("Invalid or expired access token"));
    }
  };
}
