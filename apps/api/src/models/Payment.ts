import { Schema, model, type InferSchemaType } from "mongoose";
import { paymentStatusOptions } from "../types/index.js";

const paymentSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    payer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, required: true },
    payout: { type: Number, required: true },
    provider: { type: String, default: "Skillzee Wallet" },
    transactionId: { type: String, default: "" },
    status: { type: String, enum: paymentStatusOptions, default: "PAID" }
  },
  { timestamps: true }
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & { _id: string };
export const Payment = model("Payment", paymentSchema);
