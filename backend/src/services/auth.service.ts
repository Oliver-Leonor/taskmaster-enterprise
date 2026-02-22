import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { AuthenticationError, ConflictError } from "../utils/errors";
import {
  createUser,
  findUserByEmail,
  findUserById,
  setRefreshTokenHash,
} from "../repositories/user.repository";

type Role = "admin" | "manager" | "user";
export type JwtTtl = Exclude<SignOptions["expiresIn"], undefined>;

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function signAccessToken(opts: {
  userId: string;
  role: Role;
  secret: Secret;
  ttl: JwtTtl;
}) {
  return jwt.sign(
    { sub: opts.userId, role: opts.role, typ: "access" },
    opts.secret,
    { expiresIn: opts.ttl },
  );
}

export function signRefreshToken(opts: {
  userId: string;
  secret: Secret;
  ttl: JwtTtl;
}) {
  return jwt.sign({ sub: opts.userId, typ: "refresh" }, opts.secret, {
    expiresIn: opts.ttl,
  });
}

export async function register(opts: {
  email: string;
  password: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTtl: JwtTtl;
  refreshTtl: JwtTtl;
}) {
  const existing = await findUserByEmail(opts.email);
  if (existing) throw new ConflictError("Email already registered");

  const passwordHash = await bcrypt.hash(opts.password, 12);
  const user = await createUser({
    email: opts.email,
    passwordHash,
    role: "user",
  });

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: user.role as Role,
    secret: opts.jwtAccessSecret,
    ttl: opts.accessTtl,
  });

  const refreshToken = signRefreshToken({
    userId: String(user._id),
    secret: opts.jwtRefreshSecret,
    ttl: opts.refreshTtl,
  });

  await setRefreshTokenHash(String(user._id), sha256(refreshToken));

  return {
    user: { id: String(user._id), email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function login(opts: {
  email: string;
  password: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTtl: JwtTtl;
  refreshTtl: JwtTtl;
}) {
  const user = await findUserByEmail(opts.email);
  if (!user) throw new AuthenticationError("Invalid email or password");

  const ok = await bcrypt.compare(opts.password, user.passwordHash);
  if (!ok) throw new AuthenticationError("Invalid email or password");

  const accessToken = signAccessToken({
    userId: String(user._id),
    role: user.role as Role,
    secret: opts.jwtAccessSecret,
    ttl: opts.accessTtl,
  });

  const refreshToken = signRefreshToken({
    userId: String(user._id),
    secret: opts.jwtRefreshSecret,
    ttl: opts.refreshTtl,
  });

  await setRefreshTokenHash(String(user._id), sha256(refreshToken));

  return {
    user: { id: String(user._id), email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function refresh(opts: {
  refreshToken: string;
  jwtRefreshSecret: string;
  jwtAccessSecret: string;
  accessTtl: JwtTtl;
  refreshTtl: JwtTtl;
}) {
  let payload: any;
  try {
    payload = jwt.verify(opts.refreshToken, opts.jwtRefreshSecret);
  } catch {
    throw new AuthenticationError("Invalid refresh token");
  }

  if (!payload?.sub || payload?.typ !== "refresh")
    throw new AuthenticationError("Invalid refresh token");

  const user = await findUserById(String(payload.sub));
  if (!user || !user.refreshTokenHash)
    throw new AuthenticationError("Invalid refresh token");

  if (sha256(opts.refreshToken) !== user.refreshTokenHash) {
    throw new AuthenticationError("Refresh token revoked");
  }

  // rotate refresh token
  const newAccessToken = signAccessToken({
    userId: String(user._id),
    role: user.role as Role,
    secret: opts.jwtAccessSecret,
    ttl: opts.accessTtl,
  });

  const newRefreshToken = signRefreshToken({
    userId: String(user._id),
    secret: opts.jwtRefreshSecret,
    ttl: opts.refreshTtl,
  });

  await setRefreshTokenHash(String(user._id), sha256(newRefreshToken));

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(userId: string) {
  await setRefreshTokenHash(userId, null);
}
