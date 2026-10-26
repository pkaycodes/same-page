export const CURRENT_YEAR = 2026;

export const GENDERS = [
  { code: "woman" as const, label: "Woman", seeking: "men" as const },
  { code: "man" as const, label: "Man", seeking: "women" as const },
];

export const INTENTIONS = [
  {
    code: "life_partner" as const,
    label: "Life partner",
    description: "A long-term relationship with commitment and shared direction.",
  },
  {
    code: "serious_relationship" as const,
    label: "Serious relationship",
    description: "Committed dating that could grow into something long-term.",
  },
  {
    code: "companionship" as const,
    label: "Companionship",
    description: "Regular, meaningful company without rushing the label.",
  },
  {
    code: "casual" as const,
    label: "Casual dating",
    description: "Light, honest dating without a long-term commitment.",
  },
  {
    code: "exploring" as const,
    label: "Exploring",
    description: "Open to different possibilities and still figuring it out.",
  },
];

export const INTENTION_LABELS = Object.fromEntries(
  INTENTIONS.map((item) => [item.code, item.label]),
) as Record<string, string>;

export const CITIES = [
  { city: "East Legon, Accra", region: "Greater Accra" },
  { city: "Osu, Accra", region: "Greater Accra" },
  { city: "Labone, Accra", region: "Greater Accra" },
  { city: "Madina, Accra", region: "Greater Accra" },
  { city: "Airport Residential, Accra", region: "Greater Accra" },
  { city: "Tema", region: "Greater Accra" },
  { city: "Kumasi", region: "Ashanti" },
  { city: "Takoradi", region: "Western" },
  { city: "Cape Coast", region: "Central" },
  { city: "Tamale", region: "Northern" },
];

export const INTERESTS = [
  { code: "food", label: "Food & cooking" },
  { code: "live_music", label: "Live music" },
  { code: "hiking", label: "Hiking & outdoors" },
  { code: "faith", label: "Faith & community" },
  { code: "design", label: "Design" },
  { code: "reading", label: "Reading" },
  { code: "travel", label: "Travel" },
  { code: "film", label: "Film & TV" },
  { code: "cooking", label: "Home cooking" },
  { code: "fitness", label: "Fitness" },
  { code: "art", label: "Art" },
  { code: "nature", label: "Nature" },
  { code: "business", label: "Business" },
  { code: "family", label: "Family life" },
  { code: "dancing", label: "Dancing" },
  { code: "photography", label: "Photography" },
  { code: "technology", label: "Technology" },
  { code: "sports", label: "Sports" },
  { code: "education", label: "Education" },
  { code: "health", label: "Health & wellbeing" },
  { code: "volunteering", label: "Volunteering" },
];

export const INTEREST_LABELS = Object.fromEntries(
  INTERESTS.map((item) => [item.code, item.label]),
) as Record<string, string>;

export const RELATIONSHIP_STATUSES = [
  { code: "single" as const, label: "Single" },
  { code: "divorced" as const, label: "Divorced" },
  { code: "separated" as const, label: "Separated" },
  { code: "widowed" as const, label: "Widowed" },
];

export const CHILDREN_STATUSES = [
  { code: "none" as const, label: "No children" },
  { code: "has_children" as const, label: "Has children" },
  { code: "prefer_not_to_say" as const, label: "Prefer not to say" },
];

export const WANTS_CHILDREN = [
  { code: "yes" as const, label: "Yes, I want children" },
  { code: "no" as const, label: "No, I don't want children" },
  { code: "open" as const, label: "Open to it" },
  { code: "already_have" as const, label: "I already have children" },
];

export const PARTNER_KNOWLEDGE = [
  { code: "must_know" as const, label: "A partner must know" },
  { code: "open" as const, label: "Open to telling a partner" },
  { code: "private" as const, label: "Keep this private" },
];

export const EXCLUSIVITY = [
  { code: "monogamous" as const, label: "Monogamous" },
  { code: "open_to_discuss" as const, label: "Open to discussing" },
  { code: "non_monogamous" as const, label: "Non-monogamous" },
];

export const COMMUNICATION_STYLES = [
  { code: "direct" as const, label: "Direct and clear" },
  { code: "gentle" as const, label: "Gentle and thoughtful" },
  { code: "playful" as const, label: "Playful and light" },
  { code: "reflective" as const, label: "Reflective and deep" },
];

export const MEETING_FREQUENCIES = [
  { code: "slow" as const, label: "Slow and spacious" },
  { code: "balanced" as const, label: "Balanced" },
  { code: "frequent" as const, label: "Frequent time together" },
];

export const EMOTIONAL_CLOSENESS = [
  { code: "independent" as const, label: "Independent" },
  { code: "balanced" as const, label: "Balanced" },
  { code: "close" as const, label: "Very close" },
];

export const TIMELINES = [
  { code: "no_timeline" as const, label: "No timeline" },
  { code: "within_year" as const, label: "Within a year" },
  { code: "within_two_years" as const, label: "Within two years" },
  { code: "slow" as const, label: "Slowly, no pressure" },
];

export const OPENNESS = [
  { code: "guarded" as const, label: "Guarded at first" },
  { code: "balanced" as const, label: "Balanced" },
  { code: "open" as const, label: "Open book" },
];

export const PUBLIC_VISIBILITY = [
  { code: "private" as const, label: "Private" },
  { code: "discreet" as const, label: "Discreet" },
  { code: "open" as const, label: "Open" },
];

export const FAITHS = [
  { code: "christian" as const, label: "Christian" },
  { code: "muslim" as const, label: "Muslim" },
  { code: "spiritual" as const, label: "Spiritual" },
  { code: "other" as const, label: "Other" },
  { code: "prefer_not_to_say" as const, label: "Prefer not to say" },
];

export const SMOKING = [
  { code: "never" as const, label: "Never" },
  { code: "socially" as const, label: "Socially" },
  { code: "regularly" as const, label: "Regularly" },
];

export const DRINKING = [
  { code: "never" as const, label: "Never" },
  { code: "socially" as const, label: "Socially" },
  { code: "regularly" as const, label: "Regularly" },
];

export const BOUNDARIES = [
  {
    code: "monogamy" as const,
    label: "Monogamy is required",
    description: "You only want to explore a monogamous relationship.",
  },
  {
    code: "no_smoking" as const,
    label: "No smoking",
    description: "You are not comfortable with a partner who smokes.",
  },
  {
    code: "no_heavy_drinking" as const,
    label: "No heavy drinking",
    description: "You are not comfortable with regular heavy drinking.",
  },
  {
    code: "no_casual_only" as const,
    label: "Not casual-only",
    description: "You are not looking for a casual-only connection.",
  },
];

export const BOUNDARY_LABELS = Object.fromEntries(
  BOUNDARIES.map((item) => [item.code, item.label]),
) as Record<string, string>;

export const CIRCUMSTANCE_OPTIONS = [
  { code: "relationship:single", label: "Single" },
  { code: "relationship:divorced", label: "Divorced" },
  { code: "relationship:widowed", label: "Widowed" },
  { code: "relationship:separated", label: "Separated" },
  { code: "children:none", label: "No children" },
  { code: "children:has_children", label: "Has children" },
];

export const DEFAULT_CIRCUMSTANCES = [
  "relationship:single",
  "relationship:divorced",
  "relationship:widowed",
  "children:none",
  "children:has_children",
];

export const POLICY_VERSION = "1.0";

export function isAiMatchingEnabled() {
  return process.env.AI_MATCHING_ENABLED === "true";
}

export function labelFor(
  options: ReadonlyArray<{ code: string; label: string }>,
  value: string | null | undefined,
) {
  return options.find((option) => option.code === value)?.label ?? "Not set";
}
