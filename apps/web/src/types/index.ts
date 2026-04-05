export type RolePreference = "LEARNER" | "TRAINER" | "BOTH";
export type DeliveryMode = "ONLINE" | "OFFLINE";
export type SessionType = "GOOGLE_MEET" | "IN_APP";
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type TrainerProfile = {
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
};

export type Wallet = {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsAppNumber: string;
  college: string;
  bio: string;
  avatarUrl: string;
  rolePreference: RolePreference;
  interests: string[];
  skills: string[];
  badges: string[];
  points: number;
  wallet: Wallet;
  trainerProfile: TrainerProfile;
  favoriteSkills?: string[];
};

export type Skill = {
  _id: string;
  trainer: User;
  title: string;
  description: string;
  category: string;
  outcomes: string[];
  tags: string[];
  price: number;
  durationMinutes: number;
  mode: DeliveryMode;
  location?: string;
  sessionType: SessionType;
  meetLink?: string;
  availability?: string[];
  seats?: number;
  ratingAverage: number;
  ratingCount: number;
  bookingsCount: number;
  savesCount: number;
  isFeatured?: boolean;
  recommendationScore?: number;
};

export type Review = {
  _id: string;
  rating: number;
  comment: string;
  learner: Pick<User, "_id" | "name" | "avatarUrl" | "college">;
  createdAt: string;
};

export type Booking = {
  _id: string;
  skill: Skill;
  learner: User;
  trainer: User;
  scheduledAt: string;
  notes?: string;
  status: BookingStatus;
  amount: number;
  platformCommission: number;
  trainerPayout: number;
  sessionType: SessionType;
  sessionLink?: string;
  videoRoomId?: string;
};

export type Message = {
  _id: string;
  booking: string;
  sender: Pick<User, "_id" | "name" | "avatarUrl">;
  recipient: Pick<User, "_id" | "name" | "avatarUrl">;
  content: string;
  createdAt: string;
};

export type NotificationItem = {
  _id: string;
  type: "BOOKING" | "MESSAGE" | "REMINDER" | "PAYMENT" | "SYSTEM";
  title: string;
  body: string;
  actionUrl?: string;
  readAt?: string | null;
  createdAt: string;
};

export type WalletResponse = {
  user: Pick<User, "_id" | "name" | "rolePreference" | "wallet">;
  payments: Array<{
    _id: string;
    amount: number;
    commission: number;
    payout: number;
    status: string;
    provider: string;
    transactionId: string;
    createdAt: string;
  }>;
};

export type AdminOverview = {
  users: number;
  skills: number;
  bookings: number;
  grossRevenue: number;
  platformRevenue: number;
  topSkills: Skill[];
};

export type AssistantResponse = {
  reply: string;
  recommendations: Skill[];
  provider: "fallback" | "openai" | "gemini";
};
