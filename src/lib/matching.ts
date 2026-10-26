import { CURRENT_YEAR } from "./constants";
import type {
  BreakdownItem,
  MatchProfile,
  MatchResult,
} from "./types";

export function ageFromBirthYear(birthYear: number | null | undefined) {
  if (!birthYear) return null;
  return Math.max(18, CURRENT_YEAR - birthYear);
}

function primaryIntention(profile: MatchProfile) {
  return (
    profile.intentions.find((intention) => intention.is_primary === 1)?.code ??
    profile.intentions[0]?.code ??
    null
  );
}

function sharedIntentions(viewer: MatchProfile, candidate: MatchProfile) {
  const viewerCodes = new Set(viewer.intentions.map((item) => item.code));
  return candidate.intentions.filter((item) => viewerCodes.has(item.code));
}

function accepts(circumstances: string[], code: string) {
  return circumstances.includes(code) || circumstances.includes("any");
}

function rangeSimilarity(
  viewerValue: string,
  candidateValue: string,
  order: string[],
) {
  const a = order.indexOf(viewerValue);
  const b = order.indexOf(candidateValue);
  if (a < 0 || b < 0) return 0.5;
  if (order.length <= 1) return 1;
  return 1 - Math.abs(a - b) / (order.length - 1);
}

function jaccard(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;
  const left = new Set(a);
  const right = new Set(b);
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

export function isEligible(viewer: MatchProfile, candidate: MatchProfile) {
  if (viewer.id === candidate.id) return false;
  if (viewer.gender === candidate.gender) return false;
  if (viewer.seekingGender !== candidate.gender) return false;
  if (candidate.seekingGender !== viewer.gender) return false;

  const viewerAge = ageFromBirthYear(viewer.birthYear);
  const candidateAge = ageFromBirthYear(candidate.birthYear);
  if (!viewerAge || !candidateAge) return false;
  if (viewerAge < candidate.ageMin || viewerAge > candidate.ageMax) return false;
  if (candidateAge < viewer.ageMin || candidateAge > viewer.ageMax) return false;

  if (sharedIntentions(viewer, candidate).length === 0) return false;
  if (!accepts(viewer.circumstances, `relationship:${candidate.relationshipStatus}`)) {
    return false;
  }
  if (!accepts(candidate.circumstances, `relationship:${viewer.relationshipStatus}`)) {
    return false;
  }
  if (!accepts(viewer.circumstances, `children:${candidate.childrenStatus}`)) {
    return false;
  }
  if (!accepts(candidate.circumstances, `children:${viewer.childrenStatus}`)) {
    return false;
  }

  if (viewer.partnerKnowledge === "must_know" && candidate.partnerKnowledge === "private") {
    return false;
  }
  if (candidate.partnerKnowledge === "must_know" && viewer.partnerKnowledge === "private") {
    return false;
  }

  if (viewer.region !== candidate.region && !viewer.willingToTravel && !candidate.willingToTravel) {
    return false;
  }

  if (viewer.boundaries.includes("monogamy") && candidate.exclusivity !== "monogamous") {
    return false;
  }
  if (candidate.boundaries.includes("monogamy") && viewer.exclusivity !== "monogamous") {
    return false;
  }
  if (viewer.boundaries.includes("no_smoking") && candidate.smoking !== "never") {
    return false;
  }
  if (candidate.boundaries.includes("no_smoking") && viewer.smoking !== "never") {
    return false;
  }
  if (
    viewer.boundaries.includes("no_heavy_drinking") &&
    candidate.drinking === "regularly"
  ) {
    return false;
  }
  if (
    candidate.boundaries.includes("no_heavy_drinking") &&
    viewer.drinking === "regularly"
  ) {
    return false;
  }
  if (
    viewer.boundaries.includes("no_casual_only") &&
    primaryIntention(candidate) === "casual"
  ) {
    return false;
  }
  if (
    candidate.boundaries.includes("no_casual_only") &&
    primaryIntention(viewer) === "casual"
  ) {
    return false;
  }

  return true;
}

function scoreIntentions(viewer: MatchProfile, candidate: MatchProfile) {
  const viewerPrimary = primaryIntention(viewer);
  const candidatePrimary = primaryIntention(candidate);
  const shared = sharedIntentions(viewer, candidate);
  let points = 0;

  if (viewerPrimary && viewerPrimary === candidatePrimary) {
    points = 35;
  } else if (
    shared.some((item) => item.code === viewerPrimary) ||
    shared.some((item) => item.code === candidatePrimary)
  ) {
    points = 26;
  } else if (shared.length > 0) {
    points = 18;
  }

  if (shared.length > 1) points += 2;
  if (shared.some((item) => item.code === "exploring") && points > 0) points += 1;

  return Math.min(35, points);
}

function scoreDynamics(viewer: MatchProfile, candidate: MatchProfile) {
  let points = 0;

  points += 6 * rangeSimilarity(
    viewer.exclusivity,
    candidate.exclusivity,
    ["monogamous", "open_to_discuss", "non_monogamous"],
  );
  points += 5 * (viewer.communicationStyle === candidate.communicationStyle ? 1 : 0.4);
  points += 4 * rangeSimilarity(
    viewer.meetingFrequency,
    candidate.meetingFrequency,
    ["slow", "balanced", "frequent"],
  );
  points += 4 * rangeSimilarity(
    viewer.emotionalCloseness,
    candidate.emotionalCloseness,
    ["independent", "balanced", "close"],
  );
  points += 3 * rangeSimilarity(
    viewer.timeline,
    candidate.timeline,
    ["slow", "no_timeline", "within_two_years", "within_year"],
  );
  points += 3 * rangeSimilarity(
    viewer.openness,
    candidate.openness,
    ["guarded", "balanced", "open"],
  );

  return points;
}

function scoreLife(viewer: MatchProfile, candidate: MatchProfile) {
  const viewerAge = ageFromBirthYear(viewer.birthYear) ?? 0;
  const candidateAge = ageFromBirthYear(candidate.birthYear) ?? 0;
  const ageGap = Math.abs(viewerAge - candidateAge);
  const agePoints = Math.max(1, 4 - ageGap * 0.4);
  const sameCity = viewer.city === candidate.city;
  const sameRegion = viewer.region === candidate.region;
  const canTravel = viewer.willingToTravel || candidate.willingToTravel;

  return (
    4 +
    4 +
    4 +
    (sameCity ? 4 : sameRegion ? 2.5 : canTravel ? 1.5 : 0) +
    agePoints
  );
}

function scoreCommunication(viewer: MatchProfile, candidate: MatchProfile) {
  const sharedBoundaries = viewer.boundaries.filter((item) =>
    candidate.boundaries.includes(item),
  ).length;
  const faithPoints =
    viewer.faith === candidate.faith
      ? 3
      : viewer.faith === "prefer_not_to_say" || candidate.faith === "prefer_not_to_say"
        ? 1.5
        : 0.5;

  return (
    4 * (viewer.communicationStyle === candidate.communicationStyle ? 1 : 0.4) +
    3 * rangeSimilarity(
      viewer.publicVisibility,
      candidate.publicVisibility,
      ["private", "discreet", "open"],
    ) +
    faithPoints +
    Math.min(5, sharedBoundaries * 2.5)
  );
}

function scoreInterests(viewer: MatchProfile, candidate: MatchProfile) {
  return 5 * jaccard(viewer.interests, candidate.interests);
}

function scoreLabel(score: number) {
  if (score >= 85) return "A strong fit";
  if (score >= 72) return "A good fit";
  if (score >= 60) return "Worth exploring";
  return "Some overlap";
}

function buildReasons(viewer: MatchProfile, candidate: MatchProfile, breakdown: BreakdownItem[]) {
  const reasons: string[] = [];
  const points = Object.fromEntries(breakdown.map((item) => [item.key, item.points]));

  if ((points.intentions ?? 0) >= 26) reasons.push("Shared relationship intention");
  if ((points.dynamics ?? 0) >= 17) reasons.push("Similar relationship pace");
  if ((points.life ?? 0) >= 13) reasons.push("Compatible life circumstances");
  if ((points.communication ?? 0) >= 9) reasons.push("Close communication style");
  if ((points.interests ?? 0) >= 1.8) reasons.push("Shared interests");
  if (viewer.region === candidate.region && reasons.length < 4) {
    reasons.push("Same broad area");
  }

  return reasons.slice(0, 4);
}

function confidenceFor(viewer: MatchProfile, candidate: MatchProfile) {
  const fields = [
    viewer.bio,
    viewer.relationshipStatus,
    viewer.childrenStatus,
    viewer.partnerKnowledge,
    viewer.exclusivity,
    viewer.communicationStyle,
    viewer.meetingFrequency,
    viewer.emotionalCloseness,
    viewer.timeline,
    viewer.openness,
    candidate.bio,
    candidate.relationshipStatus,
    candidate.childrenStatus,
    candidate.partnerKnowledge,
    candidate.exclusivity,
    candidate.communicationStyle,
    candidate.meetingFrequency,
    candidate.emotionalCloseness,
    candidate.timeline,
    candidate.openness,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((0.6 + (filled / fields.length) * 0.4) * 100) / 100;
}

export function scoreProfiles(
  viewer: MatchProfile,
  candidate: MatchProfile,
): MatchResult | null {
  if (!isEligible(viewer, candidate)) return null;

  const breakdown: BreakdownItem[] = [
    {
      key: "intentions",
      label: "Intentions",
      points: scoreIntentions(viewer, candidate),
      max: 35,
    },
    {
      key: "dynamics",
      label: "Relationship dynamics",
      points: scoreDynamics(viewer, candidate),
      max: 25,
    },
    {
      key: "life",
      label: "Life circumstances",
      points: scoreLife(viewer, candidate),
      max: 20,
    },
    {
      key: "communication",
      label: "Communication & boundaries",
      points: scoreCommunication(viewer, candidate),
      max: 15,
    },
    {
      key: "interests",
      label: "Shared interests",
      points: scoreInterests(viewer, candidate),
      max: 5,
    },
  ].map((item) => ({ ...item, points: Math.round(item.points * 10) / 10 }));

  const score = Math.round(
    breakdown.reduce((total, item) => total + item.points, 0),
  );
  const reasons = buildReasons(viewer, candidate, breakdown);
  const explanation =
    reasons.length > 0
      ? `You match on ${reasons.slice(0, 3).join(", ").toLowerCase()}. The score is a guide, not a verdict.`
      : "There is some overlap in what you are looking for. Take your time and decide for yourself.";

  return {
    score: Math.max(0, Math.min(100, score)),
    label: scoreLabel(score),
    confidence: confidenceFor(viewer, candidate),
    reasons,
    explanation,
    breakdown,
    aiAssisted: false,
  };
}

export function matchProfileFromBundle(bundle: {
  user: {
    id: string;
    alias: string | null;
    birth_year: number | null;
    gender: "woman" | "man" | null;
    seeking_gender: "woman" | "man" | null;
    city: string | null;
    region: string | null;
    bio: string | null;
    relationship_status: MatchProfile["relationshipStatus"] | null;
    children_status: MatchProfile["childrenStatus"] | null;
    wants_children: MatchProfile["wantsChildren"] | null;
    partner_knowledge: MatchProfile["partnerKnowledge"] | null;
    exclusivity: MatchProfile["exclusivity"] | null;
    communication_style: MatchProfile["communicationStyle"] | null;
    meeting_frequency: MatchProfile["meetingFrequency"] | null;
    emotional_closeness: MatchProfile["emotionalCloseness"] | null;
    timeline: MatchProfile["timeline"] | null;
    openness: MatchProfile["openness"] | null;
    public_visibility: MatchProfile["publicVisibility"] | null;
    faith: MatchProfile["faith"] | null;
    occupation: string | null;
    smoking: MatchProfile["smoking"] | null;
    drinking: MatchProfile["drinking"] | null;
    willing_to_travel: 0 | 1;
    age_min: number;
    age_max: number;
  };
  intentions: MatchProfile["intentions"];
  interests: string[];
  circumstances: string[];
  boundaries: string[];
}): MatchProfile | null {
  const user = bundle.user;
  if (
    !user.alias ||
    !user.birth_year ||
    !user.gender ||
    !user.seeking_gender ||
    !user.city ||
    !user.region ||
    !user.relationship_status ||
    !user.children_status ||
    !user.wants_children ||
    !user.partner_knowledge ||
    !user.exclusivity ||
    !user.communication_style ||
    !user.meeting_frequency ||
    !user.emotional_closeness ||
    !user.timeline ||
    !user.openness ||
    !user.public_visibility ||
    !user.faith ||
    !user.smoking ||
    !user.drinking
  ) {
    return null;
  }

  return {
    id: user.id,
    alias: user.alias,
    birthYear: user.birth_year,
    gender: user.gender,
    seekingGender: user.seeking_gender,
    city: user.city,
    region: user.region,
    bio: user.bio,
    relationshipStatus: user.relationship_status,
    childrenStatus: user.children_status,
    wantsChildren: user.wants_children,
    partnerKnowledge: user.partner_knowledge,
    exclusivity: user.exclusivity,
    communicationStyle: user.communication_style,
    meetingFrequency: user.meeting_frequency,
    emotionalCloseness: user.emotional_closeness,
    timeline: user.timeline,
    openness: user.openness,
    publicVisibility: user.public_visibility,
    faith: user.faith,
    occupation: user.occupation,
    smoking: user.smoking,
    drinking: user.drinking,
    willingToTravel: user.willing_to_travel === 1,
    ageMin: user.age_min,
    ageMax: user.age_max,
    intentions: bundle.intentions,
    interests: bundle.interests,
    circumstances: bundle.circumstances,
    boundaries: bundle.boundaries,
  };
}
