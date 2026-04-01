import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  college: z.string().min(2),
  password: z.string().min(8),
  bio: z.string().optional().default(""),
  avatarUrl: z.string().url().optional().or(z.literal("")).default(""),
  rolePreference: z.enum(["LEARNER", "TRAINER", "BOTH"]).default("BOTH"),
  interests: z.array(z.string()).optional().default([])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  college: z.string().min(2).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  rolePreference: z.enum(["LEARNER", "TRAINER", "BOTH"]).optional(),
  interests: z.array(z.string()).optional()
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: input.email.toLowerCase() });

    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      ...input,
      email: input.email.toLowerCase(),
      passwordHash,
      badges: input.rolePreference === "TRAINER" ? ["Early Educator"] : ["Curious Learner"]
    });

    const token = signToken({
      sub: String(user._id),
      email: String(user.email),
      rolePreference: user.rolePreference as "LEARNER" | "TRAINER" | "BOTH"
    });

    res.status(201).json({ token, user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() });

    if (!user || !(await bcrypt.compare(input.password, String(user.passwordHash)))) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken({
      sub: String(user._id),
      email: String(user.email),
      rolePreference: user.rolePreference as "LEARNER" | "TRAINER" | "BOTH"
    });

    res.json({ token, user });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.sub).populate("favoriteSkills");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(user);
  })
);

router.patch(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user!.sub, input, {
      new: true
    });

    res.json(user);
  })
);

export default router;
