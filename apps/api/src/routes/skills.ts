import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Review } from "../models/Review.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";
import { getRecommendedSkillsForUser } from "../services/recommendation.service.js";

const router = Router();

const createSkillSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().positive(),
  durationMinutes: z.coerce.number().min(15),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  location: z.string().optional().default(""),
  sessionType: z.enum(["GOOGLE_MEET", "IN_APP"]),
  meetLink: z.string().url().optional().or(z.literal("")).default(""),
  availability: z.array(z.string()).default([]),
  seats: z.coerce.number().min(1).default(1)
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, mode, maxPrice, sort = "trending" } = req.query;
    const query: Record<string, unknown> = {};

    if (q) {
      query.$or = [
        { title: { $regex: String(q), $options: "i" } },
        { description: { $regex: String(q), $options: "i" } },
        { tags: { $regex: String(q), $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (mode) {
      query.mode = mode;
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      trending: { bookingsCount: -1, ratingAverage: -1 },
      rating: { ratingAverage: -1, ratingCount: -1 },
      price_asc: { price: 1 },
      latest: { createdAt: -1 }
    };

    const skills = await Skill.find(query)
      .sort(sortMap[String(sort)] ?? sortMap.trending)
      .populate("trainer", "name avatarUrl college trainerProfile")
      .lean();

    res.json(skills);
  })
);

router.get(
  "/trending",
  asyncHandler(async (_req, res) => {
    const skills = await Skill.find()
      .sort({ isFeatured: -1, bookingsCount: -1, ratingAverage: -1 })
      .limit(6)
      .populate("trainer", "name avatarUrl college trainerProfile")
      .lean();

    res.json(skills);
  })
);

router.get(
  "/recommended",
  requireAuth,
  asyncHandler(async (req, res) => {
    const skills = await getRecommendedSkillsForUser(req.user!.sub);
    res.json(skills);
  })
);

router.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    const trainers = await User.find({
      "trainerProfile.completedSessions": { $gt: 0 }
    })
      .sort({
        "trainerProfile.averageRating": -1,
        points: -1
      })
      .limit(8)
      .select("name avatarUrl college trainerProfile badges points bio")
      .lean();

    res.json(trainers);
  })
);

router.get(
  "/:skillId",
  asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.skillId)
      .populate("trainer", "name email phone avatarUrl college bio trainerProfile badges")
      .lean();

    if (!skill) {
      throw new AppError("Skill not found", 404);
    }

    const reviews = await Review.find({ skill: skill._id })
      .sort({ createdAt: -1 })
      .populate("learner", "name avatarUrl college")
      .lean();

    res.json({ skill, reviews });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole(["TRAINER", "BOTH"]),
  asyncHandler(async (req, res) => {
    const input = createSkillSchema.parse(req.body);
    const skill = await Skill.create({
      ...input,
      trainer: req.user!.sub
    });

    const populated = await skill.populate("trainer", "name avatarUrl college trainerProfile");
    res.status(201).json(populated);
  })
);

router.post(
  "/:skillId/favorite",
  requireAuth,
  asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.skillId);

    if (!skill) {
      throw new AppError("Skill not found", 404);
    }

    const user = await User.findById(req.user!.sub);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isFavorite = user.favoriteSkills.some((favorite) => String(favorite) === req.params.skillId);

    if (isFavorite) {
      user.favoriteSkills = user.favoriteSkills.filter((favorite) => String(favorite) !== req.params.skillId);
      skill.savesCount = Math.max(0, skill.savesCount - 1);
    } else {
      user.favoriteSkills.push(skill._id);
      skill.savesCount += 1;
    }

    await Promise.all([user.save(), skill.save()]);

    res.json({
      favorited: !isFavorite,
      savesCount: skill.savesCount
    });
  })
);

export default router;
