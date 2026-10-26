import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Edit3, LogOut, Shield, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { SettingsForm } from "@/components/SettingsForm";
import { requireOnboardedUser } from "@/lib/auth";
import { ageFromBirthYear } from "@/lib/matching";
import { getProfileBundle } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

function maskPhone(phone: string) {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 4)} •••• ${phone.slice(-2)}`;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const user = await requireOnboardedUser("/settings");
  const params = await searchParams;
  const bundle = await getProfileBundle(user.id);
  if (!bundle) notFound();

  const age = ageFromBirthYear(bundle.user.birth_year);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Your account, your rules.</h1>
          <p>Change how you appear, who can reach you and what matching may use.</p>
        </div>
        <Link className="btn btn-secondary btn-sm" href="/onboarding?edit=1">
          <Edit3 size={13} /> Edit profile answers
        </Link>
      </div>

      {params.updated === "1" ? (
        <div className="banner">
          <BadgeCheck size={16} />
          <span>Profile updated. Your changes will appear in future introductions.</span>
        </div>
      ) : null}

      <div className="settings-grid">
        <SettingsForm
          initial={{
            allowRequests: bundle.privacy.allow_requests,
            showAge: bundle.privacy.show_age === 1,
            showLocation: bundle.privacy.show_location === 1,
            showIntentions: bundle.privacy.show_intentions === 1,
            aiTextMatching: bundle.privacy.ai_text_matching === 1,
            isPaused: bundle.user.is_paused === 1,
          }}
        />

        <aside className="rail">
          <div className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 11 }}>
              <Avatar alias={bundle.user.alias} size="lg" />
              <div className="grow">
                <h3 style={{ marginBottom: 2 }}>{bundle.user.alias}</h3>
                <p className="tiny" style={{ margin: 0 }}>
                  {age ? `${age} · ` : ""}
                  {bundle.user.city ?? "Area hidden"}
                </p>
                <div className="row flex-wrap" style={{ gap: 5, marginTop: 7 }}>
                  {bundle.user.phone_verified_at ? (
                    <span className="badge badge-green">
                      <BadgeCheck size={10} /> Verified
                    </span>
                  ) : null}
                  {user.isDemo ? <span className="badge badge-gold">Demo</span> : null}
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div className="stack-sm">
              <div>
                <p className="tiny" style={{ margin: 0 }}>
                  Phone number
                </p>
                <p className="small" style={{ margin: "1px 0 0", fontWeight: 700 }}>
                  {maskPhone(bundle.user.phone)}
                </p>
              </div>
              <div>
                <p className="tiny" style={{ margin: 0 }}>
                  Matching mode
                </p>
                <p className="small" style={{ margin: "1px 0 0", fontWeight: 700 }}>
                  {bundle.user.gender === "woman" ? "Woman seeking a man" : "Man seeking a woman"}
                </p>
              </div>
              <div>
                <p className="tiny" style={{ margin: 0 }}>
                  Age range
                </p>
                <p className="small" style={{ margin: "1px 0 0", fontWeight: 700 }}>
                  {bundle.user.age_min}–{bundle.user.age_max} years
                </p>
              </div>
            </div>

            <hr className="divider" />

            <Link className="btn btn-secondary btn-sm btn-block" href="/onboarding?edit=1">
              <Edit3 size={13} /> Edit profile
            </Link>
          </div>

          <div className="card card-soft">
            <h3>Trust and safety</h3>
            <div className="stack-sm" style={{ marginTop: 9 }}>
              <Link className="link-arrow small" href="/safety">
                <Shield size={13} /> Safety centre
              </Link>
              <Link className="link-arrow small" href="/matching">
                <Sparkles size={13} /> How matching works
              </Link>
            </div>
          </div>

          <div className="card">
            <h3>Session</h3>
            <p style={{ marginTop: 5 }}>
              Signed in with a verified phone. Sessions last 30 days and can be ended here.
            </p>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-secondary btn-sm btn-block" type="submit">
                <LogOut size={13} /> Sign out
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
