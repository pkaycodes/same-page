import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CITIES } from "@/lib/constants";
import { checkAlias, saveOnboarding } from "@/lib/repository";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the highlighted answers.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (!(await checkAlias(data.alias, user.id))) {
    return NextResponse.json(
      { error: "That alias is already taken.", issues: [{ path: "alias", message: "Choose another alias." }] },
      { status: 409 },
    );
  }

  const city = CITIES.find((item) => item.city === data.city)!;
  const orderedIntentions = data.intentions.map((intention, index) => ({
    code: intention.code,
    isPrimary: intention.isPrimary,
    rank: index + 1,
  }));

  try {
    await saveOnboarding({
      userId: user.id,
      alias: data.alias,
      birthYear: data.birthYear,
      gender: data.gender,
      city: city.city,
      region: city.region,
      bio: data.bio,
      relationshipStatus: data.relationshipStatus,
      childrenStatus: data.childrenStatus,
      wantsChildren: data.wantsChildren,
      partnerKnowledge: data.partnerKnowledge,
      exclusivity: data.exclusivity,
      communicationStyle: data.communicationStyle,
      meetingFrequency: data.meetingFrequency,
      emotionalCloseness: data.emotionalCloseness,
      timeline: data.timeline,
      openness: data.openness,
      publicVisibility: data.publicVisibility,
      faith: data.faith,
      occupation: data.occupation,
      smoking: data.smoking,
      drinking: data.drinking,
      willingToTravel: data.willingToTravel,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      intentions: orderedIntentions,
      interests: data.interests,
      circumstances: data.circumstances,
      boundaries: data.boundaries,
      showAge: data.showAge,
      showLocation: data.showLocation,
      showIntentions: data.showIntentions,
      aiTextMatching: data.aiTextMatching,
    });
  } catch (error) {
    console.error("onboarding failed", error);
    return NextResponse.json(
      { error: "We could not save your profile. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, redirectTo: "/discover" });
}
