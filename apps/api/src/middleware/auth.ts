import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import type { RolePreference } from "../types/index.js";

function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  req.user = verifyToken(token);
  next();
}

export function requireRole(allowedRoles: RolePreference[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.rolePreference) && req.user.rolePreference !== "BOTH") {
      return next(new AppError("You do not have permission for this action", 403));
    }

    next();
  };
}
