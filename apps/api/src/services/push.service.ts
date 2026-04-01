import webpush from "web-push";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const vapidConfigured =
  Boolean(env.VAPID_PUBLIC_KEY) && Boolean(env.VAPID_PRIVATE_KEY) && Boolean(env.VAPID_SUBJECT);

if (vapidConfigured) {
  webpush.setVapidDetails(env.VAPID_SUBJECT!, env.VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
}

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidConfigured) {
    return;
  }

  const user = await User.findById(userId).select("pushSubscriptions");

  if (!user?.pushSubscriptions?.length) {
    return;
  }

  await Promise.all(
    user.pushSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime ?? undefined,
            keys: subscription.keys
          },
          JSON.stringify(payload)
        );
      } catch {
        // Ignore stale subscriptions to keep delivery resilient.
      }
    })
  );
}
