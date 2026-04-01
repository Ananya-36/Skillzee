import { Schema, model, type Types } from "mongoose";
import { modeOptions, sessionTypeOptions } from "../types/index.js";

export type SkillDocument = {
  trainer: Types.ObjectId | { _id: Types.ObjectId };
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  durationMinutes: number;
  mode: (typeof modeOptions)[number];
  location: string;
  sessionType: (typeof sessionTypeOptions)[number];
  meetLink: string;
  seats: number;
  availability: string[];
  ratingAverage: number;
  ratingCount: number;
  bookingsCount: number;
  savesCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const skillSchema = new Schema<SkillDocument>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 15 },
    mode: { type: String, enum: modeOptions, default: "ONLINE" },
    location: { type: String, default: "" },
    sessionType: { type: String, enum: sessionTypeOptions, default: "GOOGLE_MEET" },
    meetLink: { type: String, default: "" },
    seats: { type: Number, default: 1 },
    availability: [{ type: String }],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Skill = model<SkillDocument>("Skill", skillSchema);
