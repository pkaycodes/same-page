export type Gender = "woman" | "man";
export type RelationshipStatus = "single" | "divorced" | "separated" | "widowed";
export type ChildrenStatus = "none" | "has_children" | "prefer_not_to_say";
export type WantsChildren = "yes" | "no" | "open" | "already_have";
export type PartnerKnowledge = "must_know" | "open" | "private";
export type Exclusivity = "monogamous" | "open_to_discuss" | "non_monogamous";
export type CommunicationStyle = "direct" | "gentle" | "playful" | "reflective";
export type MeetingFrequency = "slow" | "balanced" | "frequent";
export type EmotionalCloseness = "independent" | "balanced" | "close";
export type Timeline = "no_timeline" | "within_year" | "within_two_years" | "slow";
export type Openness = "guarded" | "balanced" | "open";
export type PublicVisibility = "private" | "discreet" | "open";
export type Faith = "christian" | "muslim" | "spiritual" | "other" | "prefer_not_to_say";
export type Smoking = "never" | "socially" | "regularly";
export type Drinking = "never" | "socially" | "regularly";

export type UserRow = {
  id: string;
  phone: string;
  phone_verified_at: string | null;
  alias: string | null;
  birth_year: number | null;
  gender: Gender | null;
  seeking_gender: Gender | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  relationship_status: RelationshipStatus | null;
  children_status: ChildrenStatus | null;
  wants_children: WantsChildren | null;
  partner_knowledge: PartnerKnowledge | null;
  exclusivity: Exclusivity | null;
  communication_style: CommunicationStyle | null;
  meeting_frequency: MeetingFrequency | null;
  emotional_closeness: EmotionalCloseness | null;
  timeline: Timeline | null;
  openness: Openness | null;
  public_visibility: PublicVisibility | null;
  faith: Faith | null;
  occupation: string | null;
  smoking: Smoking | null;
  drinking: Drinking | null;
  height_cm: number | null;
  willing_to_travel: 0 | 1;
  age_min: number;
  age_max: number;
  onboarding_complete: 0 | 1;
  is_paused: 0 | 1;
  account_state: "active" | "paused" | "suspended" | "deleted";
  is_demo: 0 | 1;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PrivacySettings = {
  allow_requests: "everyone" | "compatible_only";
  show_age: 0 | 1;
  show_location: 0 | 1;
  show_intentions: 0 | 1;
  ai_text_matching: 0 | 1;
  updated_at: string;
};

export type Intention = {
  code: string;
  is_primary: 0 | 1;
  rank: number;
};

export type ProfileBundle = {
  user: UserRow;
  intentions: Intention[];
  interests: string[];
  circumstances: string[];
  boundaries: string[];
  privacy: PrivacySettings;
};

export type MatchProfile = {
  id: string;
  alias: string;
  birthYear: number;
  gender: Gender;
  seekingGender: Gender;
  city: string;
  region: string;
  bio: string | null;
  relationshipStatus: RelationshipStatus;
  childrenStatus: ChildrenStatus;
  wantsChildren: WantsChildren;
  partnerKnowledge: PartnerKnowledge;
  exclusivity: Exclusivity;
  communicationStyle: CommunicationStyle;
  meetingFrequency: MeetingFrequency;
  emotionalCloseness: EmotionalCloseness;
  timeline: Timeline;
  openness: Openness;
  publicVisibility: PublicVisibility;
  faith: Faith;
  occupation: string | null;
  smoking: Smoking;
  drinking: Drinking;
  willingToTravel: boolean;
  ageMin: number;
  ageMax: number;
  intentions: Intention[];
  interests: string[];
  circumstances: string[];
  boundaries: string[];
};

export type BreakdownItem = {
  key: string;
  label: string;
  points: number;
  max: number;
};

export type MatchResult = {
  score: number;
  label: string;
  confidence: number;
  reasons: string[];
  explanation: string;
  breakdown: BreakdownItem[];
  aiAssisted: boolean;
};

export type PublicProfile = {
  user: UserRow;
  age: number;
  city: string | null;
  intentions: string[];
  interests: string[];
  match: MatchResult;
};

export type RequestSummary = {
  id: string;
  senderId: string;
  receiverId: string;
  note: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
  respondedAt: string | null;
  otherAlias: string;
  otherId: string;
  otherAge: number | null;
  otherCity: string | null;
  score: number | null;
  conversationId: string | null;
};

export type ConversationSummary = {
  id: string;
  otherId: string;
  otherAlias: string;
  otherCity: string | null;
  otherAge: number | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
  unreadCount: number;
  createdAt: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type SessionUser = {
  id: string;
  phone: string;
  alias: string | null;
  onboardingComplete: boolean;
  isDemo: boolean;
  gender: Gender | null;
  seekingGender: Gender | null;
  accountState: string;
  isPaused: boolean;
};
