import http from "node:http";
import cron from "node-cron";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import router from "./routes/index.js";
import { sendUpcomingSessionReminders } from "./services/reminder.service.js";
import { createSocketServer } from "./services/socket.service.js";

const app = express();
const allowedOrigins = (env.CLIENT_URLS ?? env.CLIENT_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "skillzee-api"
  });
});

app.use("/api", router);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  createSocketServer(server);

  if (env.ENABLE_REMINDER_CRON) {
    cron.schedule("*/30 * * * *", () => {
      void sendUpcomingSessionReminders();
    });
  }

  server.listen(env.PORT, () => {
    console.log(`Skillzee API listening on port ${env.PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
