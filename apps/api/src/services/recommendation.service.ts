import { Booking } from "../models/Booking.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";

const adjacentRecommendations: Record<string, string[]> = {
  design: ["video editing", "branding", "motion design", "figma"],
  "video editing": ["design", "content creation", "motion design"],
  analytics: ["data science", "excel", "python", "dashboarding"],
  communication: ["public speaking", "mock interviews", "pitching"],
  coding: ["web development", "python", "javascript"],
  marketing: ["content strategy", "design", "storytelling"]
};

function expandInterests(rawInterests: string[]) {
  const interestSet = new Set<string>();

  for (const rawInterest of rawInterests) {
    const interest = rawInterest.toLowerCase();
    interestSet.add(interest);

    for (const related of adjacentRecommendations[interest] ?? []) {
      interestSet.add(related);
    }
  }

  return interestSet;
}

export async function getRecommendedSkillsForUser(userId: string) {
  const user = await User.findById(userId).lean();

  if (!user) {
    return [];
  }

  const bookings = await Booking.find({ learner: userId }).populate("skill", "category tags").lean();
  const favoriteSkills = await Skill.find({
    _id: {
      $in: user.favoriteSkills ?? []
    }
  })
    .select("category tags")
    .lean();
  const interestSet = expandInterests([...(user.interests ?? []), ...(user.skills ?? [])]);

  for (const booking of bookings) {
    const bookedSkill = booking.skill as unknown as { category?: string; tags?: string[] } | null;

    if (bookedSkill?.category) {
      interestSet.add(bookedSkill.category.toLowerCase());
    }

    for (const tag of bookedSkill?.tags ?? []) {
      interestSet.add(tag.toLowerCase());
    }
  }

  for (const favoriteSkill of favoriteSkills) {
    if (favoriteSkill.category) {
      interestSet.add(favoriteSkill.category.toLowerCase());
    }

    for (const tag of favoriteSkill.tags ?? []) {
      interestSet.add(tag.toLowerCase());
    }
  }

  const skills = await Skill.find()
    .populate("trainer", "name email phone whatsAppNumber avatarUrl college bio trainerProfile badges skills")
    .lean();

  return skills
    .filter((skill) => String(skill.trainer?._id) !== userId)
    .map((skill) => {
      const categoryScore = interestSet.has(skill.category.toLowerCase()) ? 4 : 0;
      const outcomeScore = (skill.outcomes ?? []).reduce(
        (total, outcome) => total + (interestSet.has(outcome.toLowerCase()) ? 1.5 : 0),
        0
      );
      const tagScore = (skill.tags ?? []).reduce((total, tag) => total + (interestSet.has(tag.toLowerCase()) ? 1 : 0), 0);
      const qualityScore = skill.ratingAverage * 1.5 + skill.bookingsCount * 0.3 + skill.savesCount * 0.2;
      const affordabilityScore = skill.price <= 500 ? 1.5 : 0.5;

      return {
        ...skill,
        recommendationScore: Number((categoryScore + outcomeScore + tagScore + qualityScore + affordabilityScore).toFixed(2))
      };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
    .slice(0, 8);
}
