import { describe, expect, it } from "vitest";
import { isEligible, scoreProfiles } from "./matching";
import type { MatchProfile } from "./types";

function profile(overrides: Partial<MatchProfile> = {}): MatchProfile {
  return {
    id: "usr_test",
    alias: "Test_Profile",
    birthYear: 1995,
    gender: "woman",
    seekingGender: "man",
    city: "Accra",
    region: "Greater Accra",
    bio: "A considered profile used by the matching tests.",
    relationshipStatus: "single",
    childrenStatus: "none",
    wantsChildren: "open",
    partnerKnowledge: "open",
    exclusivity: "monogamous",
    communicationStyle: "direct",
    meetingFrequency: "balanced",
    emotionalCloseness: "balanced",
    timeline: "within_two_years",
    openness: "balanced",
    publicVisibility: "private",
    faith: "christian",
    occupation: "Engineer",
    smoking: "never",
    drinking: "socially",
    willingToTravel: false,
    ageMin: 25,
    ageMax: 40,
    intentions: [{ code: "life_partner", is_primary: 1, rank: 1 }],
    interests: ["Design", "Food & cooking", "Live music"],
    circumstances: [
      "relationship:single",
      "relationship:divorced",
      "children:none",
    ],
    boundaries: [],
    ...overrides,
  };
}

const ama = profile({ id: "usr_ama", alias: "Ama_K", gender: "woman", seekingGender: "man" });
const kwame = profile({
  id: "usr_kwame",
  alias: "Kwame_A",
  gender: "man",
  seekingGender: "woman",
  birthYear: 1993,
  intentions: [{ code: "life_partner", is_primary: 1, rank: 1 }],
});

describe("matching eligibility", () => {
  it("accepts a mutually opposite-gender, eligible pair", () => {
    expect(isEligible(ama, kwame)).toBe(true);
    expect(isEligible(kwame, ama)).toBe(true);
  });

  it("rejects a same-gender pair even when preferences are set that way", () => {
    const womanSeekingWoman = profile({ id: "usr_other", seekingGender: "woman" });
    expect(isEligible(ama, womanSeekingWoman)).toBe(false);
  });

  it("rejects a pair with no shared intention", () => {
    const differentIntention = profile({
      ...kwame,
      intentions: [{ code: "casual", is_primary: 1, rank: 1 }],
    });
    expect(isEligible(ama, differentIntention)).toBe(false);
  });

  it("rejects a pair outside each other's age range", () => {
    expect(isEligible(ama, { ...kwame, ageMax: 29 })).toBe(false);
  });

  it("enforces boundaries before scoring", () => {
    expect(
      isEligible(ama, { ...kwame, exclusivity: "non_monogamous", boundaries: [] }),
    ).toBe(true);
    expect(
      isEligible(
        { ...ama, boundaries: ["monogamy"] },
        { ...kwame, exclusivity: "non_monogamous", boundaries: [] },
      ),
    ).toBe(false);
  });
});

describe("matching scores", () => {
  it("returns an explainable deterministic score without AI", () => {
    const result = scoreProfiles(ama, kwame);
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThanOrEqual(0);
    expect(result?.score).toBeLessThanOrEqual(100);
    expect(result?.aiAssisted).toBe(false);
    expect(result?.reasons.length).toBeGreaterThan(0);
    expect(result?.breakdown).toHaveLength(5);
    expect(result?.explanation).toContain("not a verdict");
  });

  it("returns null rather than scoring an ineligible pair", () => {
    expect(scoreProfiles(ama, profile({ id: "usr_same", gender: "woman", seekingGender: "woman" }))).toBeNull();
  });

  it("is stable for the same input", () => {
    expect(scoreProfiles(ama, kwame)?.score).toBe(scoreProfiles(ama, kwame)?.score);
  });
});
