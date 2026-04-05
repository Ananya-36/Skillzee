import { Schema, model, type Types } from "mongoose";
import { roleOptions } from "../types/index.js";

type PushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type Wallet = {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
};

type TrainerProfile = {
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
};

export type UserDocument = {
  name: string;
  email: string;
  phone: string;
  whatsAppNumber: string;
  college: string;
  passwordHash: string;
  bio: string;
  avatarUrl: string;
  rolePreference: (typeof roleOptions)[number];
  interests: string[];
  skills: string[];
  favoriteSkills: Array<Types.ObjectId>;
  badges: string[];
  points: number;
  wallet: Wallet;
  trainerProfile: TrainerProfile;
  pushSubscriptions: PushSubscription[];
  createdAt: Date;
  updatedAt: Date;
};

const pushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true },
    expirationTime: { type: Number, default: null },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    }
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsAppNumber: { type: String, required: true, trim: true },
    college: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    rolePreference: { type: String, enum: roleOptions, default: "BOTH" },
    interests: [{ type: String }],
    skills: [{ type: String }],
    favoriteSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    badges: [{ type: String }],
    points: { type: Number, default: 0 },
    wallet: {
      availableBalance: { type: Number, default: 0 },
      pendingBalance: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }
    },
    trainerProfile: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      completedSessions: { type: Number, default: 0 }
    },
    pushSubscriptions: [pushSubscriptionSchema]
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const safeRet = ret as { passwordHash?: string };
        delete safeRet.passwordHash;
        return ret;
      }
    }
  }
);

export const User = model<UserDocument>("User", userSchema);
