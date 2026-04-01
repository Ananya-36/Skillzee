import { addHours } from "date-fns";
import { Booking } from "../models/Booking.js";
import { createNotification } from "./notification.service.js";

export async function sendUpcomingSessionReminders() {
  const now = new Date();
  const nextDay = addHours(now, 24);

  const bookings = await Booking.find({
    status: "CONFIRMED",
    reminderSentAt: null,
    scheduledAt: {
      $gte: now,
      $lte: nextDay
    }
  })
    .populate("skill", "title")
    .lean();

  for (const booking of bookings) {
    const skillTitle = (booking.skill as { title?: string } | null)?.title ?? "your session";

    await Promise.all([
      createNotification({
        userId: String(booking.learner),
        type: "REMINDER",
        title: "Session reminder",
        body: `${skillTitle} starts within 24 hours.`,
        actionUrl: `/dashboard?booking=${booking._id}`,
        emailSubject: "Upcoming Skillzee session reminder"
      }),
      createNotification({
        userId: String(booking.trainer),
        type: "REMINDER",
        title: "Upcoming learner session",
        body: `You have a ${skillTitle} booking within 24 hours.`,
        actionUrl: `/dashboard?booking=${booking._id}`,
        emailSubject: "Upcoming Skillzee trainer session reminder"
      })
    ]);

    await Booking.findByIdAndUpdate(booking._id, {
      reminderSentAt: new Date()
    });
  }

  return bookings.length;
}
