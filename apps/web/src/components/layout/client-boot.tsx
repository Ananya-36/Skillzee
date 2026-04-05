"use client";

import { useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { registerServiceWorker } from "@/lib/pwa";
import { useAuth } from "@/hooks/use-auth";
import type { Message, NotificationItem } from "@/types";

function showBrowserNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  new Notification(title, { body });
}

export function ClientBoot() {
  const { token } = useAuth();

  useEffect(() => {
    void registerServiceWorker();

    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getSocket(token);

    const handleNotification = (item: NotificationItem) => {
      showBrowserNotification(item.title, item.body);
    };

    const handleChat = (item: Message) => {
      showBrowserNotification("New message on SkillSwap", item.content);
    };

    socket.on("notification:new", handleNotification);
    socket.on("chat:message", handleChat);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(async () => {
        if ("PushManager" in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const existing = await registration.pushManager.getSubscription();

            if (existing) {
              await apiRequest("/notifications/subscribe", {
                method: "POST",
                token,
                body: JSON.stringify(existing)
              });
            }
          } catch {
            // Ignore push bootstrap issues when keys are not configured.
          }
        }
      });
    }

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("chat:message", handleChat);
    };
  }, [token]);

  return null;
}
