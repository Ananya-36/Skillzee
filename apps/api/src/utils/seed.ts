import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";
import { calculateCommission } from "./commission.js";

async function seed() {
  await connectDatabase();

  await Promise.all([Booking.deleteMany({}), Payment.deleteMany({}), Skill.deleteMany({}), User.deleteMany({})]);

  const passwordHash = await bcrypt.hash("Skillzee123", 12);

  const [trainerOne, trainerTwo, trainerThree, learner] = await User.create([
    {
      name: "Aarav Mehta",
      email: "aarav@skillzee.app",
      phone: "919876543210",
      whatsAppNumber: "919876543210",
      college: "IIT Delhi",
      passwordHash,
      bio: "UI/UX mentor helping students ship portfolio-ready projects.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      rolePreference: "TRAINER",
      interests: ["design", "figma", "product strategy"],
      skills: ["Figma", "Brand Systems", "Video Editing"],
      badges: ["Top Trainer", "Fast Responder"],
      points: 420,
      trainerProfile: {
        averageRating: 4.9,
        totalReviews: 28,
        completedSessions: 34
      },
      wallet: {
        availableBalance: 5400,
        pendingBalance: 800,
        totalEarnings: 12000,
        totalSpent: 0
      }
    },
    {
      name: "Nisha Verma",
      email: "nisha@skillzee.app",
      phone: "919812345678",
      whatsAppNumber: "919812345678",
      college: "BITS Pilani",
      passwordHash,
      bio: "Data science trainer focused on real projects, dashboards, and interview prep.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      rolePreference: "BOTH",
      interests: ["python", "machine learning", "analytics"],
      skills: ["Python", "Dashboards", "Excel Storytelling"],
      badges: ["Top Trainer", "Rising Star"],
      points: 260,
      trainerProfile: {
        averageRating: 4.8,
        totalReviews: 16,
        completedSessions: 19
      },
      wallet: {
        availableBalance: 3200,
        pendingBalance: 600,
        totalEarnings: 6800,
        totalSpent: 900
      }
    },
    {
      name: "Kabir Sethi",
      email: "kabir@skillzee.app",
      phone: "919955110022",
      whatsAppNumber: "919955110022",
      college: "NMIMS Mumbai",
      passwordHash,
      bio: "Creator mentor helping students make sharper reels, edits, and personal brand videos.",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      rolePreference: "TRAINER",
      interests: ["content creation", "design"],
      skills: ["Video Editing", "Premiere Pro", "Motion Storytelling"],
      badges: ["Top Trainer"],
      points: 310,
      trainerProfile: {
        averageRating: 4.7,
        totalReviews: 12,
        completedSessions: 21
      },
      wallet: {
        availableBalance: 2700,
        pendingBalance: 500,
        totalEarnings: 5900,
        totalSpent: 0
      }
    },
    {
      name: "Riya Sharma",
      email: "riya@skillzee.app",
      phone: "919900112233",
      whatsAppNumber: "919900112233",
      college: "Delhi University",
      passwordHash,
      bio: "Marketing student learning product, design, analytics, and creator skills.",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
      rolePreference: "BOTH",
      interests: ["design", "analytics", "public speaking"],
      skills: ["Canva", "Social Media Basics"],
      badges: ["Fast Learner"],
      points: 130,
      wallet: {
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalSpent: 1200
      }
    }
  ]);

  const skills = await Skill.create([
    {
      trainer: trainerOne._id,
      title: "Figma to Startup UI in 90 Minutes",
      description:
        "Learn how to structure a SaaS dashboard, create a design system, and turn rough ideas into recruiter-ready interfaces.",
      category: "Design",
      outcomes: ["video editing", "portfolio", "branding"],
      tags: ["figma", "ui", "portfolio"],
      price: 499,
      durationMinutes: 90,
      mode: "ONLINE",
      sessionType: "GOOGLE_MEET",
      meetLink: "https://meet.google.com/new",
      availability: ["Mon 7 PM", "Wed 6 PM", "Sat 11 AM"],
      seats: 1,
      ratingAverage: 4.9,
      ratingCount: 28,
      bookingsCount: 41,
      savesCount: 78,
      isFeatured: true
    },
    {
      trainer: trainerTwo._id,
      title: "Python Dashboards for Beginners",
      description:
        "Build a portfolio-worthy analytics dashboard using Python, Pandas, and Streamlit while learning storytelling with data.",
      category: "Data Science",
      outcomes: ["analytics", "excel", "dashboard storytelling"],
      tags: ["python", "streamlit", "analytics"],
      price: 399,
      durationMinutes: 75,
      mode: "ONLINE",
      sessionType: "IN_APP",
      availability: ["Tue 8 PM", "Fri 5 PM"],
      seats: 1,
      ratingAverage: 4.8,
      ratingCount: 16,
      bookingsCount: 22,
      savesCount: 54,
      isFeatured: true
    },
    {
      trainer: trainerThree._id,
      title: "Video Editing for Reels and Portfolios",
      description:
        "Edit faster in Premiere Pro or CapCut, add motion polish, and publish cleaner content for reels and portfolios.",
      category: "Creative",
      outcomes: ["design", "content creation", "motion design"],
      tags: ["video editing", "premiere pro", "content"],
      price: 449,
      durationMinutes: 60,
      mode: "ONLINE",
      sessionType: "GOOGLE_MEET",
      meetLink: "https://meet.google.com/new",
      availability: ["Thu 7 PM", "Sun 1 PM"],
      seats: 1,
      ratingAverage: 4.7,
      ratingCount: 12,
      bookingsCount: 17,
      savesCount: 33,
      isFeatured: true
    }
  ]);

  learner.favoriteSkills = [skills[0]._id, skills[1]._id];
  await learner.save();

  const split = calculateCommission(skills[0].price);
  const booking = await Booking.create({
    skill: skills[0]._id,
    learner: learner._id,
    trainer: trainerOne._id,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 30),
    status: "CONFIRMED",
    paymentStatus: "PAID",
    sessionType: "GOOGLE_MEET",
    sessionLink: "https://meet.google.com/new",
    ...split
  });

  await Payment.create({
    booking: booking._id,
    payer: learner._id,
    payee: trainerOne._id,
    amount: split.amount,
    commission: split.platformCommission,
    payout: split.trainerPayout,
    provider: "Razorpay / UPI Simulation",
    transactionId: `SKZ-DEMO-${Date.now()}`,
    status: "PAID"
  });

  console.log("Seed complete");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
