import { Router } from "express";
import adminRouter from "./admin.js";
import authRouter from "./auth.js";
import bookingsRouter from "./bookings.js";
import chatRouter from "./chat.js";
import notificationsRouter from "./notifications.js";
import paymentsRouter from "./payments.js";
import skillsRouter from "./skills.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/skills", skillsRouter);
router.use("/bookings", bookingsRouter);
router.use("/chat", chatRouter);
router.use("/notifications", notificationsRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
