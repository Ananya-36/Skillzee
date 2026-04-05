import { env } from "../config/env.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";
import { getRecommendedSkillsForUser } from "./recommendation.service.js";

type ChatInput = {
  message: string;
  userId?: string;
  interests?: string[];
};

type AssistantResult = {
  reply: string;
  recommendations: Awaited<ReturnType<typeof getFallbackRecommendations>>;
  provider: "fallback" | "openai" | "gemini";
};

async function getFallbackRecommendations(message: string, userId?: string) {
  if (userId) {
    const personalized = await getRecommendedSkillsForUser(userId);

    if (personalized.length) {
      return personalized.slice(0, 3);
    }
  }

  const keywords = message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2);

  const query =
    keywords.length > 0
      ? {
          $or: [
            { title: { $regex: keywords.join("|"), $options: "i" } },
            { description: { $regex: keywords.join("|"), $options: "i" } },
            { category: { $regex: keywords.join("|"), $options: "i" } },
            { tags: { $regex: keywords.join("|"), $options: "i" } },
            { outcomes: { $regex: keywords.join("|"), $options: "i" } }
          ]
        }
      : {};

  const matched = await Skill.find(query)
    .sort({ bookingsCount: -1, ratingAverage: -1 })
    .limit(3)
    .populate("trainer", "name email phone whatsAppNumber avatarUrl college bio trainerProfile badges skills")
    .lean();

  if (matched.length) {
    return matched;
  }

  return Skill.find()
    .sort({ isFeatured: -1, bookingsCount: -1, ratingAverage: -1 })
    .limit(3)
    .populate("trainer", "name email phone whatsAppNumber avatarUrl college bio trainerProfile badges skills")
    .lean();
}

function buildFallbackReply(message: string, interests: string[], skillSummary: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("design")) {
    return `Because you mentioned design, I would also look at video editing and branding sessions. ${skillSummary}`;
  }

  if (lowerMessage.includes("interview") || interests.some((interest) => interest.includes("communication"))) {
    return `Communication-focused learners usually pair mock interviews with public speaking and pitching sessions. ${skillSummary}`;
  }

  if (lowerMessage.includes("data") || interests.some((interest) => interest.includes("analytics"))) {
    return `For analytics goals, the best next step is usually a Python dashboard or Excel storytelling class. ${skillSummary}`;
  }

  return `I found a few strong SkillSwap options based on what you asked. ${skillSummary}`;
}

async function requestOpenAIReply(prompt: string) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: "developer",
          content:
            "You are the SkillSwap assistant. Recommend peer-to-peer student classes in a concise, upbeat tone and mention only classes that fit the request."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function requestGeminiReply(prompt: string) {
  if (!env.GEMINI_API_KEY) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text:
                "You are the SkillSwap assistant. Recommend peer-to-peer student classes in a concise, upbeat tone and mention only classes that fit the request."
            }
          ]
        },
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("Gemini request failed");
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? null;
}

export async function generateAssistantReply(input: ChatInput): Promise<AssistantResult> {
  const message = input.message.trim();
  const account = input.userId ? await User.findById(input.userId).lean() : null;
  const interests = [...(input.interests ?? []), ...(account?.interests ?? []), ...(account?.skills ?? [])].map((item) =>
    item.toLowerCase()
  );
  const recommendations = await getFallbackRecommendations(message, input.userId);
  const skillSummary =
    recommendations.length > 0
      ? `You should check ${recommendations.map((skill) => `"${skill.title}"`).join(", ")}.`
      : "I can still help you narrow it down by budget, topic, or whether you want online or offline classes.";
  const prompt = `User request: ${message}\nInterests: ${interests.join(", ") || "none"}\nMarketplace matches: ${skillSummary}`;

  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    try {
      const reply = await requestOpenAIReply(prompt);

      if (reply) {
        return {
          reply,
          recommendations,
          provider: "openai"
        };
      }
    } catch {
      // Fall back to local recommendations when the external model is unavailable.
    }
  }

  if (env.AI_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    try {
      const reply = await requestGeminiReply(prompt);

      if (reply) {
        return {
          reply,
          recommendations,
          provider: "gemini"
        };
      }
    } catch {
      // Fall back to local recommendations when the external model is unavailable.
    }
  }

  return {
    reply: buildFallbackReply(message, interests, skillSummary),
    recommendations,
    provider: "fallback"
  };
}
