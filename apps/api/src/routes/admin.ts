import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";

const router = Router();

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [users, skills, bookings, payments, topSkills] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$amount" },
            platformRevenue: { $sum: "$commission" }
          }
        }
      ]),
      Skill.find().sort({ bookingsCount: -1, ratingAverage: -1 }).limit(5).lean()
    ]);

    res.json({
      users,
      skills,
      bookings,
      grossRevenue: payments[0]?.grossRevenue ?? 0,
      platformRevenue: payments[0]?.platformRevenue ?? 0,
      topSkills
    });
  })
);

export default router;
