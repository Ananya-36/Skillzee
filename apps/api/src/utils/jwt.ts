import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload, RolePreference } from "../types/index.js";

export function signToken(payload: { sub: string; email: string; rolePreference: RolePreference }) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
