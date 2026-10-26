import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, Pause, ShieldCheck, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ScoreRing } from "@/components/ScoreRing";
import { requireOnboardedUser } from "@/lib/auth";
import { INTENTION_LABELS } from "@/lib/constants";
import { getDiscovery, getProfileBundle } from "@/lib/repository";
import { firstName } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Discover",
};

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "best", label: "Best fit" },
  { key: "new", label: "Recently active" },
  { key: "nearby", label: "Near me" },
  { key: "strong", label: "Strong fits" },
] as const;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; blocked?: string }>;
}) {
  const user = await requireOnboardedUser("/discover");
  const params = await searchParams;
  const filter = FILTERS.some((item) => item.key === params.filter) ? params.filter : "best";

  const [allProfiles, bundle] = await Promise.all([
    getDiscovery(user.id),
    getProfileBundle(user.id),
  ]);

  const strongCount = allProfiles.filter((profile) => profile.match.score >= 80).length;
  let profiles = [...allProfiles];

  if (filter === "new") {
    profiles.sort((a, b) => (b.user.last_active_at ?? "").localeCompare(a.user.last_active_at ?? ""));
  } else if (filter === "nearby") {
    profiles = profiles.filter((profile) => profile.user.region === bundle?.user.region);
  } else if (filter === "strong") {
    profiles = profiles.filter((profile) => profile.match.score >= 80);
  }

  const primary = bundle?.intentions.find((intention) => intention.is_primary === 1);
  const secondary = bundle?.intentions.filter((intention) => intention.is_primary !== 1) ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Discover</p>
          <h1>Good to see you, {firstName(user.alias)}.</h1>
          <p>
            {allProfiles.length === 0
              ? "No compatible introductions right now."
              : `${allProfiles.length} compatible ${allProfiles.length === 1 ? "person" : "people"} · ${strongCount} strong ${strongCount === 1 ? "fit" : "fits"}`}
          </p>
        </div>
        <div className="head-actions">
          <span className="badge badge-green">
            <Compass size={11} /> Binary matching
          </span>
          <span className="badge">
            <ShieldCheck size={11} /> Dealbreakers applied
          </span>
        </div>
      </div>

      {user.isPaused ? (
        <div className="banner warn">
          <Pause size={16} />
          <span>
            Your discovery is paused, so your profile is hidden and no new introductions
            are shown. <Link href="/settings" style={{ fontWeight: 800 }}>Resume in Settings</Link>.
          </span>
        </div>
      ) : null}

      {params.blocked === "1" ? (
        <div className="banner">
          <ShieldCheck size={16} />
          <span>Member blocked. They will no longer appear in your discovery or messages.</span>
        </div>
      ) : null}

      <div className="content-grid">
        <div className="main-col">
          <div className="filter-bar" aria-label="Discovery filters">
            {FILTERS.map((item) => (
              <Link
                key={item.key}
                className={filter === item.key ? "filter-pill active" : "filter-pill"}
                href={`/discover?filter=${item.key}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {profiles.length === 0 ? (
            <div className="empty-state">
              <h3>{user.isPaused ? "Discovery is paused" : "A quieter moment"}</h3>
              <p>
                {user.isPaused
                  ? "Resume discovery when you are ready to see new people."
                  : filter === "best"
                    ? "No one currently meets both sets of dealbreakers. New people join the beta regularly, so check back soon."
                    : "No one matches this filter right now. Try the broader view."}
              </p>
              {user.isPaused ? (
                <Link className="btn btn-primary" href="/settings">
                  Go to settings
                </Link>
              ) : (
                <Link className="btn btn-secondary" href="/discover?filter=best">
                  See everyone compatible
                </Link>
              )}
            </div>
          ) : (
            <div className="profile-list">
              {profiles.map((profile) => (
                <article className="profile-card" key={profile.user.id}>
                  <div className="profile-card-top">
                    <Avatar alias={profile.user.alias} size="lg" />
                    <div className="grow">
                      <div className="profile-card-name">
                        <h2>
                          {profile.user.alias}
                          {profile.age > 0 ? `, ${profile.age}` : ""}
                        </h2>
                        {profile.user.phone_verified_at ? (
                          <span className="badge badge-green">
                            <BadgeCheck size={11} /> Verified
                          </span>
                        ) : null}
                      </div>
                      <div className="profile-meta">
                        <span>{profile.city ?? "Area hidden"}</span>
                        <span className="dot" />
                        <span>{profile.user.gender === "woman" ? "Woman" : "Man"}</span>
                        <span className="dot" />
                        <span>{profile.user.occupation || "Occupation private"}</span>
                      </div>
                    </div>
                    <ScoreRing score={profile.match.score} />
                  </div>

                  <p className="profile-bio">
                    {profile.user.bio ||
                      "Taking their time with the written answers. The compatibility check still applies."}
                  </p>

                  <div className="reasons">
                    {profile.match.reasons.slice(0, 3).map((reason) => (
                      <span className="badge badge-green" key={reason}>
                        {reason}
                      </span>
                    ))}
                    {profile.match.reasons.length === 0 ? (
                      <span className="badge">Some overlap to explore</span>
                    ) : null}
                  </div>

                  <div className="profile-card-foot">
                    <span className="tiny">
                      <strong style={{ color: "var(--ink)" }}>{profile.match.label}.</strong>{" "}
                      {profile.match.explanation}
                    </span>
                    <Link className="btn btn-secondary btn-sm" href={`/people/${profile.user.id}`}>
                      View profile <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rail">
          <div className="card">
            <h3>Your intentions</h3>
            {primary ? (
              <p style={{ margin: "7px 0 4px", color: "var(--ink)", fontWeight: 750 }}>
                {INTENTION_LABELS[primary.code] ?? primary.code}
              </p>
            ) : (
              <p>Not set.</p>
            )}
            {secondary.length > 0 ? (
              <div className="chip-row" style={{ marginTop: 8 }}>
                {secondary.map((intention) => (
                  <span className="chip" key={intention.code}>
                    {INTENTION_LABELS[intention.code] ?? intention.code}
                  </span>
                ))}
              </div>
            ) : null}
            <Link className="link-arrow small" href="/onboarding?edit=1" style={{ marginTop: 12 }}>
              Edit your answers <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card">
            <h3>Your boundaries</h3>
            <p style={{ marginTop: 7 }}>
              {bundle?.user.age_min}–{bundle?.user.age_max} years ·{" "}
              {bundle?.user.region ?? "Greater Accra"}
            </p>
            <p style={{ marginBottom: 0 }}>
              Everyone you see has already passed both people&apos;s hard eligibility
              checks. You are both seeking the opposite gender.
            </p>
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <Sparkles size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3 style={{ marginBottom: 5 }}>Matching is explainable</h3>
                <p style={{ marginBottom: 9 }}>
                  This beta uses a deterministic baseline. AI-assisted re-ranking is
                  switched off until vendor and privacy review are complete.
                </p>
                <Link className="link-arrow small" href="/matching">
                  How matching works <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
