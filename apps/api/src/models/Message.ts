import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

messageSchema.index({ booking: 1, createdAt: 1 });

export type MessageDocument = InferSchemaType<typeof messageSchema> & { _id: string };
export const Message = model("Message", messageSchema);
