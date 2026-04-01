import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

const router = Router();

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user!.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  })
);

router.patch(
  "/:notificationId/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        user: req.user!.sub
      },
      { readAt: new Date() },
      { new: true }
    );

    res.json(notification);
  })
);

router.post(
  "/subscribe",
  requireAuth,
  asyncHandler(async (req, res) => {
    const subscription = subscriptionSchema.parse(req.body);
    const user = await User.findById(req.user!.sub);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.pushSubscriptions.some((item) => item.endpoint === subscription.endpoint);

    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ success: true });
  })
);

export default router;
