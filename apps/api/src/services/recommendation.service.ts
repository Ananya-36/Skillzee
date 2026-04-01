import { Booking } from "../models/Booking.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";

export async function getRecommendedSkillsForUser(userId: string) {
  const user = await User.findById(userId).lean();

  if (!user) {
    return [];
  }

  const bookings = await Booking.find({ learner: userId }).populate("skill", "category tags").lean();
  const interestSet = new Set(user.interests?.map((item) => item.toLowerCase()) ?? []);

  for (const booking of bookings) {
    const bookedSkill = booking.skill as unknown as { category?: string; tags?: string[] } | null;

    if (bookedSkill?.category) {
      interestSet.add(bookedSkill.category.toLowerCase());
    }

    for (const tag of bookedSkill?.tags ?? []) {
      interestSet.add(tag.toLowerCase());
    }
  }

  const skills = await Skill.find().populate("trainer", "name avatarUrl college trainerProfile").lean();

  return skills
    .filter((skill) => String(skill.trainer?._id) !== userId)
    .map((skill) => {
      const categoryScore = interestSet.has(skill.category.toLowerCase()) ? 4 : 0;
      const tagScore = (skill.tags ?? []).reduce((total, tag) => total + (interestSet.has(tag.toLowerCase()) ? 1 : 0), 0);
      const qualityScore = skill.ratingAverage * 1.5 + skill.bookingsCount * 0.3 + skill.savesCount * 0.2;
      const affordabilityScore = skill.price <= 500 ? 1.5 : 0.5;

      return {
        ...skill,
        recommendationScore: Number((categoryScore + tagScore + qualityScore + affordabilityScore).toFixed(2))
      };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
    .slice(0, 8);
}
