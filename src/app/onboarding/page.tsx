import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { OnboardingWizard, type OnboardingInitial } from "@/components/OnboardingWizard";
import { requireUser } from "@/lib/auth";
import { getProfileBundle } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Create your profile",
  description: "Set your intentions, dealbreakers and privacy choices on SAME PAGE.",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser("/onboarding");
  const params = await searchParams;
  const editing = params.edit === "1";

  if (user.onboardingComplete && !editing) redirect("/discover");
  if (user.accountState !== "active") redirect("/settings");

  const bundle = await getProfileBundle(user.id);
  let initial: OnboardingInitial = {
    alias: user.alias ?? "",
    gender: user.gender ?? "",
  };

  if (bundle) {
    initial = {
      alias: bundle.user.alias ?? "",
      birthYear: bundle.user.birth_year ?? 1995,
      gender: bundle.user.gender ?? "",
      city: bundle.user.city ?? "Osu, Accra",
      bio: bundle.user.bio ?? "",
      occupation: bundle.user.occupation ?? "",
      relationshipStatus: bundle.user.relationship_status ?? "single",
      childrenStatus: bundle.user.children_status ?? "none",
      wantsChildren: bundle.user.wants_children ?? "open",
      partnerKnowledge: bundle.user.partner_knowledge ?? "open",
      exclusivity: bundle.user.exclusivity ?? "monogamous",
      communicationStyle: bundle.user.communication_style ?? "direct",
      meetingFrequency: bundle.user.meeting_frequency ?? "balanced",
      emotionalCloseness: bundle.user.emotional_closeness ?? "balanced",
      timeline: bundle.user.timeline ?? "no_timeline",
      openness: bundle.user.openness ?? "balanced",
      publicVisibility: bundle.user.public_visibility ?? "discreet",
      faith: bundle.user.faith ?? "prefer_not_to_say",
      smoking: bundle.user.smoking ?? "never",
      drinking: bundle.user.drinking ?? "socially",
      willingToTravel: bundle.user.willing_to_travel === 1,
      ageMin: bundle.user.age_min,
      ageMax: bundle.user.age_max,
      intentions: bundle.intentions.map((intention) => ({
        code: intention.code,
        isPrimary: intention.is_primary === 1,
      })),
      interests: bundle.interests,
      circumstances: bundle.circumstances,
      boundaries: bundle.boundaries,
      showAge: bundle.privacy.show_age === 1,
      showLocation: bundle.privacy.show_location === 1,
      showIntentions: bundle.privacy.show_intentions === 1,
      aiTextMatching: bundle.privacy.ai_text_matching === 1,
    };
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-top">
        <Brand href={editing ? "/settings" : "/"} sub={editing ? "Edit profile" : "Private beta · Accra"} />
        <Link className="btn btn-ghost btn-sm" href={editing ? "/settings" : "/"}>
          {editing ? "Save and exit" : "Exit to home"}
        </Link>
      </header>

      <OnboardingWizard initial={initial} editing={editing && user.onboardingComplete} />
    </div>
  );
}
