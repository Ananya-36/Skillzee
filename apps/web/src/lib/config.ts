export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
export const APP_NAME = "SkillSwap";
export const DEFAULT_GOOGLE_MEET_URL = "https://meet.google.com/new";

export function buildWhatsAppInterestMessage(skillTitle: string) {
  return `Hi, I am interested in your ${skillTitle} class on ${APP_NAME}`;
}
