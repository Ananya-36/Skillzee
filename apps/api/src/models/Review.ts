import { Schema, model, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    learner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" }
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & { _id: string };
export const Review = model("Review", reviewSchema);
