export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi, I booked your session on Skillzee and had a doubt.";
