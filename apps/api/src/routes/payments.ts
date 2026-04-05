import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";

const router = Router();

const simulateSchema = z.object({
  bookingId: z.string().min(1),
  provider: z
    .enum(["Razorpay / UPI Simulation", "UPI Collect Simulation", "SkillSwap Wallet Simulation"])
    .default("Razorpay / UPI Simulation")
});

router.get(
  "/wallet",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.sub).select("wallet name rolePreference");
    const payments = await Payment.find({
      $or: [{ payer: req.user!.sub }, { payee: req.user!.sub }]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("booking", "status scheduledAt")
      .lean();

    res.json({
      user,
      payments
    });
  })
);

router.post(
  "/simulate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = simulateSchema.parse(req.body);
    const booking = await Booking.findById(input.bookingId);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      { status: "PAID", provider: input.provider },
      { new: true }
    );
    booking.paymentStatus = "PAID";
    await booking.save();

    res.json(payment);
  })
);

export default router;
