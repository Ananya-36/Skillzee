import { Schema, model, type InferSchemaType } from "mongoose";
import { notificationTypeOptions } from "../types/index.js";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: notificationTypeOptions, default: "SYSTEM" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    actionUrl: { type: String, default: "" },
    readAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: string };
export const Notification = model("Notification", notificationSchema);
