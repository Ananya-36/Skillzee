import { env } from "../config/env.js";

const configuredOrigins = (env.CLIENT_URLS ?? env.CLIENT_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalhostOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export function getAllowedOrigins() {
  return configuredOrigins;
}

export function isAllowedOrigin(origin?: string | null) {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  if (env.NODE_ENV !== "production" && isLocalhostOrigin(origin)) {
    return true;
  }

  return false;
}
