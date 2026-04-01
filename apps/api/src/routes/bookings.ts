import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { Review } from "../models/Review.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";
import { generateCertificatePdf } from "../services/certificate.service.js";
import { createNotification } from "../services/notification.service.js";
import { sendUpcomingSessionReminders } from "../services/reminder.service.js";
import { calculateCommission } from "../utils/commission.js";

const router = Router();

const createBookingSchema = z.object({
  skillId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  notes: z.string().optional().default("")
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"])
});

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional().default("")
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createBookingSchema.parse(req.body);
    const skill = await Skill.findById(input.skillId).populate("trainer", "name email");

    if (!skill) {
      throw new AppError("Skill not found", 404);
    }

    const learner = await User.findById(req.user!.sub);

    if (!learner) {
      throw new AppError("Learner not found", 404);
    }

    if (String(skill.trainer._id) === req.user!.sub) {
      throw new AppError("You cannot book your own skill", 400);
    }

    const { amount, platformCommission, trainerPayout } = calculateCommission(skill.price);
    const booking = await Booking.create({
      skill: skill._id,
      learner: learner._id,
      trainer: skill.trainer._id,
      scheduledAt: input.scheduledAt,
      notes: input.notes,
      amount,
      platformCommission,
      trainerPayout,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      sessionType: skill.sessionType,
      sessionLink: skill.sessionType === "GOOGLE_MEET" ? skill.meetLink : "",
      videoRoomId: skill.sessionType === "IN_APP" ? `skillzee-${uuidv4()}` : ""
    });

    skill.bookingsCount += 1;
    await skill.save();

    learner.wallet.totalSpent += amount;
    await learner.save();

    const trainer = await User.findById(skill.trainer._id);

    if (trainer) {
      trainer.wallet.pendingBalance += trainerPayout;
      await trainer.save();
    }

    await Payment.create({
      booking: booking._id,
      payer: learner._id,
      payee: skill.trainer._id,
      amount,
      commission: platformCommission,
      payout: trainerPayout,
      transactionId: `SKZ-${Date.now()}`
    });

    await Promise.all([
      createNotification({
        userId: String(skill.trainer._id),
        type: "BOOKING",
        title: "New booking received",
        body: `${learner.name} booked your ${skill.title} session.`,
        actionUrl: `/dashboard?booking=${booking._id}`,
        emailSubject: "New Skillzee booking"
      }),
      createNotification({
        userId: String(learner._id),
        type: "BOOKING",
        title: "Booking confirmed",
        body: `Your ${skill.title} session is confirmed.`,
        actionUrl: `/dashboard?booking=${booking._id}`,
        emailSubject: "Your Skillzee booking is confirmed"
      })
    ]);

    const populated = await booking.populate([
      { path: "skill", populate: { path: "trainer", select: "name avatarUrl phone email college bio trainerProfile" } },
      { path: "learner", select: "name avatarUrl college" },
      { path: "trainer", select: "name avatarUrl college phone email" }
    ]);

    res.status(201).json(populated);
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const view = String(req.query.view ?? "all");
    const query =
      view === "trainer"
        ? { trainer: req.user!.sub }
        : view === "learner"
          ? { learner: req.user!.sub }
          : {
              $or: [{ learner: req.user!.sub }, { trainer: req.user!.sub }]
            };

    const bookings = await Booking.find(query)
      .sort({ scheduledAt: 1 })
      .populate("skill", "title category price sessionType meetLink")
      .populate("learner", "name avatarUrl college phone email")
      .populate("trainer", "name avatarUrl college phone email")
      .lean();

    res.json(bookings);
  })
);

router.patch(
  "/:bookingId/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = statusSchema.parse(req.body);
    const booking = await Booking.findById(req.params.bookingId).populate("skill", "title");

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const isParticipant = [String(booking.learner), String(booking.trainer)].includes(req.user!.sub);

    if (!isParticipant) {
      throw new AppError("You cannot update this booking", 403);
    }

    booking.status = input.status;
    await booking.save();

    if (input.status === "COMPLETED") {
      const trainer = await User.findById(booking.trainer);

      if (trainer) {
        trainer.wallet.pendingBalance = Math.max(0, trainer.wallet.pendingBalance - booking.trainerPayout);
        trainer.wallet.availableBalance += booking.trainerPayout;
        trainer.wallet.totalEarnings += booking.trainerPayout;
        trainer.trainerProfile.completedSessions += 1;
        trainer.points += 50;

        if (trainer.trainerProfile.completedSessions >= 5 && !trainer.badges.includes("Top Mentor")) {
          trainer.badges.push("Top Mentor");
        }

        await trainer.save();
      }
    }

    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { status: input.status === "COMPLETED" ? "RELEASED" : "PAID" }
    );

    await Promise.all([
      createNotification({
        userId: String(booking.learner),
        type: "BOOKING",
        title: "Booking updated",
        body: `Your booking is now ${input.status.toLowerCase()}.`,
        actionUrl: `/dashboard?booking=${booking._id}`
      }),
      createNotification({
        userId: String(booking.trainer),
        type: "PAYMENT",
        title: input.status === "COMPLETED" ? "Payout released" : "Booking updated",
        body:
          input.status === "COMPLETED"
            ? `Your payout for ${(booking.skill as unknown as { title?: string })?.title ?? "the session"} is now available.`
            : `Booking status changed to ${input.status.toLowerCase()}.`,
        actionUrl: `/dashboard?booking=${booking._id}`
      })
    ]);

    res.json(booking);
  })
);

router.post(
  "/:bookingId/review",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = reviewSchema.parse(req.body);
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (String(booking.learner) !== req.user!.sub) {
      throw new AppError("Only the learner can review this session", 403);
    }

    if (booking.status !== "COMPLETED") {
      throw new AppError("Only completed bookings can be reviewed", 400);
    }

    const existingReview = await Review.findOne({ booking: booking._id });

    if (existingReview) {
      throw new AppError("This booking has already been reviewed", 409);
    }

    const review = await Review.create({
      booking: booking._id,
      skill: booking.skill,
      learner: booking.learner,
      trainer: booking.trainer,
      rating: input.rating,
      comment: input.comment
    });

    const reviews = await Review.find({ skill: booking.skill });
    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await Skill.findByIdAndUpdate(booking.skill, {
      ratingAverage: averageRating,
      ratingCount: reviews.length
    });

    const trainerReviews = await Review.find({ trainer: booking.trainer });
    const trainerAverage = trainerReviews.reduce((sum, item) => sum + item.rating, 0) / trainerReviews.length;

    await User.findByIdAndUpdate(booking.trainer, {
      "trainerProfile.averageRating": trainerAverage,
      "trainerProfile.totalReviews": trainerReviews.length,
      $inc: { points: 20 }
    });

    await createNotification({
      userId: String(booking.trainer),
      type: "SYSTEM",
      title: "New review received",
      body: `A learner left a ${input.rating}-star review.`,
      actionUrl: `/skills/${booking.skill}`
    });

    res.status(201).json(review);
  })
);

router.get(
  "/:bookingId/certificate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("skill", "title")
      .populate("learner", "name")
      .populate("trainer", "name");

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const learnerId = String((booking.learner as unknown as { _id: string })._id);
    const trainerId = String((booking.trainer as unknown as { _id: string })._id);
    const isParticipant = [learnerId, trainerId].includes(req.user!.sub);

    if (!isParticipant) {
      throw new AppError("You do not have access to this certificate", 403);
    }

    if (booking.status !== "COMPLETED") {
      throw new AppError("Certificate is available only after completion", 400);
    }

    const pdfBuffer = await generateCertificatePdf({
      learnerName: (booking.learner as unknown as { name: string }).name,
      trainerName: (booking.trainer as unknown as { name: string }).name,
      skillTitle: (booking.skill as unknown as { title: string }).title,
      completedAt: booking.updatedAt
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="skillzee-certificate-${req.params.bookingId}.pdf"`
    );
    res.send(pdfBuffer);
  })
);

router.post(
  "/reminders/run",
  asyncHandler(async (_req, res) => {
    const count = await sendUpcomingSessionReminders();
    res.json({ remindersCreated: count });
  })
);

export default router;
