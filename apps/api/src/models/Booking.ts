import { Schema, model, type Types } from "mongoose";
import { bookingStatusOptions, paymentStatusOptions, sessionTypeOptions } from "../types/index.js";

export type BookingDocument = {
  skill: Types.ObjectId | { _id: Types.ObjectId };
  learner: Types.ObjectId | { _id: Types.ObjectId };
  trainer: Types.ObjectId | { _id: Types.ObjectId };
  scheduledAt: Date;
  notes: string;
  status: (typeof bookingStatusOptions)[number];
  amount: number;
  platformCommission: number;
  trainerPayout: number;
  paymentStatus: (typeof paymentStatusOptions)[number];
  sessionType: (typeof sessionTypeOptions)[number];
  sessionLink: string;
  videoRoomId: string;
  reminderSentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const bookingSchema = new Schema<BookingDocument>(
  {
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    learner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: bookingStatusOptions, default: "PENDING" },
    amount: { type: Number, required: true },
    platformCommission: { type: Number, required: true },
    trainerPayout: { type: Number, required: true },
    paymentStatus: { type: String, enum: paymentStatusOptions, default: "PAID" },
    sessionType: { type: String, enum: sessionTypeOptions, required: true },
    sessionLink: { type: String, default: "" },
    videoRoomId: { type: String, default: "" },
    reminderSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>("Booking", bookingSchema);
