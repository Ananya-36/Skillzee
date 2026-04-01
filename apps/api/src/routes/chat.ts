import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/app-error.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Message } from "../models/Message.js";
import { createNotification } from "../services/notification.service.js";
import { emitToBookingRoom, emitToUser } from "../services/socket.service.js";

const router = Router();

const messageSchema = z.object({
  content: z.string().min(1).max(1000)
});

router.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({
      $or: [{ learner: req.user!.sub }, { trainer: req.user!.sub }]
    })
      .populate("skill", "title")
      .populate("learner", "name avatarUrl")
      .populate("trainer", "name avatarUrl")
      .sort({ updatedAt: -1 })
      .lean();

    const messages = await Message.find({
      booking: { $in: bookings.map((booking) => booking._id) }
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestByBooking = new Map(messages.map((message) => [String(message.booking), message]));

    res.json(
      bookings.map((booking) => ({
        ...booking,
        latestMessage: latestByBooking.get(String(booking._id)) ?? null
      }))
    );
  })
);

router.get(
  "/:bookingId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const isParticipant = [String(booking.learner), String(booking.trainer)].includes(req.user!.sub);

    if (!isParticipant) {
      throw new AppError("You cannot view this chat", 403);
    }

    const messages = await Message.find({ booking: booking._id })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatarUrl")
      .populate("recipient", "name avatarUrl")
      .lean();

    res.json(messages);
  })
);

router.post(
  "/:bookingId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = messageSchema.parse(req.body);
    const booking = await Booking.findById(req.params.bookingId)
      .populate("learner", "name")
      .populate("trainer", "name");

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const learnerId = String((booking.learner as unknown as { _id: string })._id);
    const trainerId = String((booking.trainer as unknown as { _id: string })._id);
    const isLearner = learnerId === req.user!.sub;
    const isTrainer = trainerId === req.user!.sub;

    if (!isLearner && !isTrainer) {
      throw new AppError("You cannot send messages in this booking", 403);
    }

    const recipient = isLearner ? trainerId : learnerId;
    const message = await Message.create({
      booking: booking._id,
      sender: req.user!.sub,
      recipient,
      content: input.content
    });

    const populated = await message.populate([
      { path: "sender", select: "name avatarUrl" },
      { path: "recipient", select: "name avatarUrl" }
    ]);

    emitToBookingRoom(String(booking._id), "chat:message", populated);
    emitToUser(recipient, "chat:message", populated);

    await createNotification({
      userId: recipient,
      type: "MESSAGE",
      title: "New chat message",
      body: input.content.length > 80 ? `${input.content.slice(0, 77)}...` : input.content,
      actionUrl: `/chat?booking=${booking._id}`
    });

    res.status(201).json(populated);
  })
);

export default router;
