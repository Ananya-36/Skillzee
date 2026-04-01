import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("mongodb+srv://") || value.startsWith("mongodb://"), {
      message: "MONGO_URI must be a valid MongoDB Atlas connection string"
    }),
  JWT_SECRET: z.string().min(10),
  CLIENT_URL: z.string().url(),
  CLIENT_URLS: z.string().optional(),
  SEED_ON_BOOT: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  ENABLE_REMINDER_CRON: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional()
});

export const env = envSchema.parse(process.env);
