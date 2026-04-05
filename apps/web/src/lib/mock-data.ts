import type { AdminOverview, Booking, NotificationItem, Review, Skill, User, WalletResponse } from "@/types";

export const fallbackSkills: Skill[] = [
  {
    _id: "skill-1",
    title: "Figma to Startup UI in 90 Minutes",
    description: "Design a polished product landing page and dashboard with portfolio-ready UX decisions.",
    category: "Design",
    outcomes: ["video editing", "portfolio", "branding"],
    tags: ["figma", "startup", "portfolio"],
    price: 499,
    durationMinutes: 90,
    mode: "ONLINE",
    sessionType: "GOOGLE_MEET",
    meetLink: "https://meet.google.com/new",
    ratingAverage: 4.9,
    ratingCount: 28,
    bookingsCount: 41,
    savesCount: 78,
    isFeatured: true,
    trainer: {
      _id: "trainer-1",
      name: "Aarav Mehta",
      email: "aarav@skillzee.app",
      phone: "919876543210",
      whatsAppNumber: "919876543210",
      college: "IIT Delhi",
      bio: "UI/UX mentor helping students ship portfolio-ready projects.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      rolePreference: "TRAINER",
      interests: ["design"],
      skills: ["Figma", "Video Editing", "Brand Systems"],
      badges: ["Top Mentor"],
      points: 420,
      wallet: { availableBalance: 0, pendingBalance: 0, totalEarnings: 0, totalSpent: 0 },
      trainerProfile: { averageRating: 4.9, totalReviews: 28, completedSessions: 34 }
    }
  },
  {
    _id: "skill-2",
    title: "Python Dashboards for Beginners",
    description: "Build a data dashboard and learn analytics storytelling with hands-on guidance.",
    category: "Data Science",
    outcomes: ["analytics", "excel", "dashboard storytelling"],
    tags: ["python", "streamlit", "analytics"],
    price: 399,
    durationMinutes: 75,
    mode: "ONLINE",
    sessionType: "IN_APP",
    ratingAverage: 4.8,
    ratingCount: 16,
    bookingsCount: 22,
    savesCount: 54,
    isFeatured: true,
    trainer: {
      _id: "trainer-2",
      name: "Nisha Verma",
      email: "nisha@skillzee.app",
      phone: "919812345678",
      whatsAppNumber: "919812345678",
      college: "BITS Pilani",
      bio: "Data science trainer focused on dashboards, interviews, and practical projects.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      rolePreference: "BOTH",
      interests: ["python"],
      skills: ["Python", "Excel Dashboards", "SQL Basics"],
      badges: ["Rising Star"],
      points: 260,
      wallet: { availableBalance: 0, pendingBalance: 0, totalEarnings: 0, totalSpent: 0 },
      trainerProfile: { averageRating: 4.8, totalReviews: 16, completedSessions: 19 }
    }
  },
  {
    _id: "skill-3",
    title: "Video Editing for Reels and Portfolios",
    description: "Edit faster in Premiere Pro or CapCut, add motion polish, and publish cleaner content.",
    category: "Creative",
    outcomes: ["design", "content creation", "motion design"],
    tags: ["video editing", "premiere pro", "content"],
    price: 449,
    durationMinutes: 60,
    mode: "ONLINE",
    sessionType: "GOOGLE_MEET",
    meetLink: "https://meet.google.com/new",
    ratingAverage: 4.7,
    ratingCount: 12,
    bookingsCount: 17,
    savesCount: 33,
    isFeatured: true,
    trainer: {
      _id: "trainer-3",
      name: "Kabir Sethi",
      email: "kabir@skillzee.app",
      phone: "919955110022",
      whatsAppNumber: "919955110022",
      college: "NMIMS Mumbai",
      bio: "Creator mentor helping students make sharper reels, edits, and personal brand videos.",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      rolePreference: "TRAINER",
      interests: ["content creation", "design"],
      skills: ["Video Editing", "Premiere Pro", "Motion Storytelling"],
      badges: ["Top Trainer"],
      points: 310,
      wallet: { availableBalance: 0, pendingBalance: 0, totalEarnings: 0, totalSpent: 0 },
      trainerProfile: { averageRating: 4.7, totalReviews: 12, completedSessions: 21 }
    }
  }
];

export const fallbackReviews: Review[] = [
  {
    _id: "review-1",
    rating: 5,
    comment: "The session was super actionable and felt like a real product critique.",
    createdAt: new Date().toISOString(),
    learner: {
      _id: "learner-1",
      name: "Riya Sharma",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
      college: "Delhi University"
    }
  }
];

export const fallbackUser: User = {
  _id: "user-demo",
  name: "Riya Sharma",
  email: "riya@skillzee.app",
  phone: "919900112233",
  whatsAppNumber: "919900112233",
  college: "Delhi University",
  bio: "Marketing student learning product, design, and analytics.",
  avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  rolePreference: "BOTH",
  interests: ["design", "analytics", "communication"],
  skills: ["Canva", "Social Media Basics"],
  badges: ["Curious Learner", "Fast Booker"],
  points: 130,
  wallet: {
    availableBalance: 840,
    pendingBalance: 240,
    totalEarnings: 1520,
    totalSpent: 1200
  },
  trainerProfile: {
    averageRating: 4.7,
    totalReviews: 8,
    completedSessions: 11
  }
};

export const fallbackBookings: Booking[] = [
  {
    _id: "booking-1",
    skill: fallbackSkills[0],
    learner: fallbackUser,
    trainer: fallbackSkills[0].trainer,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
    status: "CONFIRMED",
    amount: 499,
    platformCommission: 100,
    trainerPayout: 399,
    sessionType: "GOOGLE_MEET",
    sessionLink: "https://meet.google.com/new"
  },
  {
    _id: "booking-2",
    skill: fallbackSkills[1],
    learner: fallbackUser,
    trainer: fallbackSkills[1].trainer,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    status: "CONFIRMED",
    amount: 399,
    platformCommission: 80,
    trainerPayout: 319,
    sessionType: "IN_APP",
    videoRoomId: "skillzee-demo-room"
  }
];

export const fallbackNotifications: NotificationItem[] = [
  {
    _id: "notif-1",
    type: "BOOKING",
    title: "Booking confirmed",
    body: "Your Figma session is confirmed for tomorrow evening.",
    actionUrl: "/dashboard",
    createdAt: new Date().toISOString(),
    readAt: null
  }
];

export const fallbackMessages = [
  {
    _id: "msg-1",
    booking: "booking-1",
    sender: {
      _id: "trainer-1",
      name: "Aarav Mehta",
      avatarUrl: fallbackSkills[0].trainer.avatarUrl
    },
    recipient: {
      _id: "user-demo",
      name: "Riya Sharma",
      avatarUrl: fallbackUser.avatarUrl
    },
    content: "Happy to help. Send over your landing page draft before the session.",
    createdAt: new Date().toISOString()
  }
];

export const fallbackWallet: WalletResponse = {
  user: {
    _id: fallbackUser._id,
    name: fallbackUser.name,
    rolePreference: fallbackUser.rolePreference,
    wallet: fallbackUser.wallet
  },
  payments: [
    {
      _id: "pay-1",
      amount: 499,
      commission: 100,
      payout: 399,
      status: "PAID",
      provider: "SkillSwap Wallet",
      transactionId: "SKZ-DEMO-1",
      createdAt: new Date().toISOString()
    }
  ]
};

export const fallbackAdmin: AdminOverview = {
  users: 1280,
  skills: 214,
  bookings: 482,
  grossRevenue: 164000,
  platformRevenue: 32800,
  topSkills: fallbackSkills
};
