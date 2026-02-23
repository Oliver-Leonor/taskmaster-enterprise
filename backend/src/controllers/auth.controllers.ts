import type { Request, Response, NextFunction } from "express";
import { loadEnv } from "../config/env";
import * as AuthService from "../services/auth.service";
import type { JwtTtl } from "../services/auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const env = loadEnv();
    const result = await AuthService.register({
      email: req.body.email,
      password: req.body.password,
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: env.JWT_REFRESH_SECRET,
      accessTtl: env.ACCESS_TOKEN_TTL as unknown as JwtTtl,
      refreshTtl: env.REFRESH_TOKEN_TTL as unknown as JwtTtl,
    });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const env = loadEnv();
    const result = await AuthService.login({
      email: req.body.email,
      password: req.body.password,
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: env.JWT_REFRESH_SECRET,
      accessTtl: env.ACCESS_TOKEN_TTL as unknown as JwtTtl,
      refreshTtl: env.REFRESH_TOKEN_TTL as unknown as JwtTtl,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const env = loadEnv();
    const result = await AuthService.refresh({
      refreshToken: req.body.refreshToken,
      jwtRefreshSecret: env.JWT_REFRESH_SECRET,
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
      accessTtl: env.ACCESS_TOKEN_TTL as unknown as JwtTtl,
      refreshTtl: env.REFRESH_TOKEN_TTL as unknown as JwtTtl,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, _next: NextFunction) {
  // requireAuth will guarantee req.user exists
  res.json({ user: req.user });
}
