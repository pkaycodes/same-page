import { z } from "zod";
import {
  BOUNDARIES,
  CITIES,
  CIRCUMSTANCE_OPTIONS,
  COMMUNICATION_STYLES,
  CHILDREN_STATUSES,
  DRINKING,
  EMOTIONAL_CLOSENESS,
  EXCLUSIVITY,
  FAITHS,
  INTERESTS,
  INTENTIONS,
  MEETING_FREQUENCIES,
  OPENNESS,
  PARTNER_KNOWLEDGE,
  PUBLIC_VISIBILITY,
  RELATIONSHIP_STATUSES,
  SMOKING,
  TIMELINES,
  WANTS_CHILDREN,
  CURRENT_YEAR,
} from "./constants";

const codes = (items: ReadonlyArray<{ code: string }>) =>
  items.map((item) => item.code) as [string, ...string[]];

export const phoneSchema = z.object({
  phone: z.string().trim().min(7).max(24),
});

export const verifySchema = z.object({
  phone: z.string().trim().min(7).max(24),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

const intentionSchema = z.object({
  code: z.enum(codes(INTENTIONS) as [string, ...string[]]),
  isPrimary: z.boolean(),
});

export const onboardingSchema = z
  .object({
    alias: z
      .string()
      .trim()
      .min(3, "Use at least 3 characters.")
      .max(20, "Use 20 characters or fewer.")
      .regex(/^[A-Za-z0-9_]+$/, "Use letters, numbers and underscores only."),
    birthYear: z.coerce
      .number()
      .int()
      .min(CURRENT_YEAR - 100)
      .max(CURRENT_YEAR - 18, "You must be 18 or older."),
    gender: z.enum(["woman", "man"]),
    city: z.string().refine((value) => CITIES.some((item) => item.city === value), {
      message: "Choose a city from the list.",
    }),
    bio: z.string().trim().max(1000).default(""),
    occupation: z.string().trim().max(80).default(""),
    relationshipStatus: z.enum(codes(RELATIONSHIP_STATUSES) as [string, ...string[]]),
    childrenStatus: z.enum(codes(CHILDREN_STATUSES) as [string, ...string[]]),
    wantsChildren: z.enum(codes(WANTS_CHILDREN) as [string, ...string[]]),
    partnerKnowledge: z.enum(codes(PARTNER_KNOWLEDGE) as [string, ...string[]]),
    exclusivity: z.enum(codes(EXCLUSIVITY) as [string, ...string[]]),
    communicationStyle: z.enum(codes(COMMUNICATION_STYLES) as [string, ...string[]]),
    meetingFrequency: z.enum(codes(MEETING_FREQUENCIES) as [string, ...string[]]),
    emotionalCloseness: z.enum(codes(EMOTIONAL_CLOSENESS) as [string, ...string[]]),
    timeline: z.enum(codes(TIMELINES) as [string, ...string[]]),
    openness: z.enum(codes(OPENNESS) as [string, ...string[]]),
    publicVisibility: z.enum(codes(PUBLIC_VISIBILITY) as [string, ...string[]]),
    faith: z.enum(codes(FAITHS) as [string, ...string[]]),
    smoking: z.enum(codes(SMOKING) as [string, ...string[]]),
    drinking: z.enum(codes(DRINKING) as [string, ...string[]]),
    willingToTravel: z.boolean(),
    ageMin: z.coerce.number().int().min(18).max(99),
    ageMax: z.coerce.number().int().min(18).max(99),
    intentions: z.array(intentionSchema).min(1).max(3),
    interests: z.array(z.enum(codes(INTERESTS) as [string, ...string[]])).min(3).max(12),
    circumstances: z
      .array(z.enum(codes(CIRCUMSTANCE_OPTIONS) as [string, ...string[]]))
      .min(1),
    boundaries: z.array(z.enum(codes(BOUNDARIES) as [string, ...string[]])).max(4),
    showAge: z.boolean().default(true),
    showLocation: z.boolean().default(true),
    showIntentions: z.boolean().default(true),
    aiTextMatching: z.boolean().default(false),
    acceptTerms: z.literal(true),
    ageConfirm: z.literal(true),
  })
  .refine((data) => data.ageMin <= data.ageMax, {
    message: "Minimum age must be below maximum age.",
    path: ["ageMax"],
  })
  .refine(
    (data) =>
      data.intentions.filter((intention) => intention.isPrimary).length === 1,
    {
      message: "Choose exactly one primary intention.",
      path: ["intentions"],
    },
  )
  .refine(
    (data) => new Set(data.intentions.map((intention) => intention.code)).size === data.intentions.length,
    {
      message: "Choose each intention only once.",
      path: ["intentions"],
    },
  )
  .refine(
    (data) =>
      new Set(data.interests).size === data.interests.length &&
      new Set(data.circumstances).size === data.circumstances.length,
    {
      message: "Remove duplicate selections.",
      path: ["interests"],
    },
  );

export const requestSchema = z.object({
  receiverId: z.string().min(1),
  note: z.string().trim().min(1, "Add a short note.").max(500),
});

export const requestResponseSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Write a message.").max(2000),
});

export const reportSchema = z.object({
  reportedId: z.string().min(1),
  category: z.enum([
    "harassment",
    "impersonation",
    "fraud",
    "sexual_content",
    "hate",
    "underage",
    "other",
  ]),
  details: z.string().trim().max(2000).default(""),
});

export const blockSchema = z.object({
  blockedId: z.string().min(1),
});

export const settingsSchema = z.object({
  allowRequests: z.enum(["everyone", "compatible_only"]),
  showAge: z.boolean(),
  showLocation: z.boolean(),
  showIntentions: z.boolean(),
  aiTextMatching: z.boolean(),
  isPaused: z.boolean(),
});
