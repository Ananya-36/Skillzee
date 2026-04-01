import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { sendEmail } from "./email.service.js";
import { sendPushNotification } from "./push.service.js";
import { emitToUser } from "./socket.service.js";
import type { NotificationType } from "../types/index.js";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  emailSubject?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await Notification.create({
    user: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl ?? "",
    metadata: input.metadata ?? {}
  });

  emitToUser(input.userId, "notification:new", notification);

  await sendPushNotification(input.userId, {
    title: input.title,
    body: input.body,
    url: input.actionUrl
  });

  if (input.emailSubject) {
    const user = await User.findById(input.userId).select("email name");

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: input.emailSubject,
        html: `<p>Hi ${user.name},</p><p>${input.body}</p><p><a href="${input.actionUrl ?? "#"}">Open Skillzee</a></p>`
      });
    }
  }

  return notification;
}
