import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { generateAssistantReply } from "../services/assistant.service.js";

const router = Router();

const assistantSchema = z.object({
  message: z.string().min(2),
  userId: z.string().optional(),
  interests: z.array(z.string()).optional().default([])
});

router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const input = assistantSchema.parse(req.body);
    const result = await generateAssistantReply(input);
    res.json(result);
  })
);

export default router;
