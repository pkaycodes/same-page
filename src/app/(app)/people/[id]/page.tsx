import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Info,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { RequestComposer } from "@/components/RequestComposer";
import { SafetyActions } from "@/components/SafetyActions";
import { ScoreRing } from "@/components/ScoreRing";
import { requireOnboardedUser } from "@/lib/auth";
import {
  CHILDREN_STATUSES,
  FAITHS,
  INTEREST_LABELS,
  INTENTION_LABELS,
  RELATIONSHIP_STATUSES,
  WANTS_CHILDREN,
  labelFor,
} from "@/lib/constants";
import { getProfileForViewer, getRelationshipState } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireOnboardedUser("/discover");
  const { id } = await params;
  const result = await getProfileForViewer(viewer.id, id);
  if (!result) notFound();

  const { profile, bundle } = result;
  const relationship = await getRelationshipState(viewer.id, id);
  const relationshipState = relationship
    ? {
        id: relationship.id,
        status: relationship.status,
        sentByMe: relationship.sender_id === viewer.id,
        conversationId: relationship.conversation_id,
      }
    : null;

  return (
    <>
      <Link className="btn btn-ghost btn-sm" href="/discover" style={{ marginLeft: -10, marginBottom: 13 }}>
        <ArrowLeft size={14} /> Back to discover
      </Link>

      <div className="content-grid">
        <div className="main-col">
          <section className="card">
            <div className="profile-hero">
              <Avatar alias={profile.user.alias} size="xl" />
              <div className="grow">
                <h1>
                  {profile.user.alias}
                  {profile.age > 0 ? `, ${profile.age}` : ""}
                </h1>
                <div className="profile-meta">
                  <span>{profile.city ?? "Area hidden"}</span>
                  <span className="dot" />
                  <span>{profile.user.gender === "woman" ? "Woman seeking a man" : "Man seeking a woman"}</span>
                  {profile.user.occupation ? (
                    <>
                      <span className="dot" />
                      <span>{profile.user.occupation}</span>
                    </>
                  ) : null}
                </div>
                <div className="profile-hero-badges">
                  {profile.user.phone_verified_at ? (
                    <span className="badge badge-green">
                      <BadgeCheck size={11} /> Phone verified
                    </span>
                  ) : null}
                  <span className="badge">
                    <LockKeyhole size={11} /> Private profile
                  </span>
                  <span className="badge badge-gold">{profile.match.label}</span>
                  <span className="badge badge-gold mobile-only">
                    {profile.match.score}% fit
                  </span>
                </div>
              </div>
              <ScoreRing score={profile.match.score} />
            </div>

            <p className="profile-copy">
              {profile.user.bio ||
                "They have not added a written introduction yet. Use the compatibility details and their note to decide."}
            </p>

            <div className="detail-section">
              <h2>What they are looking for</h2>
              {profile.intentions.length > 0 ? (
                <div className="chip-row">
                  {profile.intentions.map((code) => (
                    <span className="chip" key={code}>
                      {INTENTION_LABELS[code] ?? code}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="small muted" style={{ margin: 0 }}>
                  This member keeps their intentions private.
                </p>
              )}
            </div>

            <div className="detail-section">
              <h2>Life and circumstances</h2>
              <div className="chip-row">
                <span className="chip">
                  {labelFor(RELATIONSHIP_STATUSES, bundle.user.relationship_status)}
                </span>
                <span className="chip">
                  {labelFor(CHILDREN_STATUSES, bundle.user.children_status)}
                </span>
                <span className="chip">
                  {labelFor(WANTS_CHILDREN, bundle.user.wants_children)}
                </span>
                <span className="chip">{labelFor(FAITHS, bundle.user.faith)}</span>
                {bundle.user.willing_to_travel === 1 ? (
                  <span className="chip">Open to travelling to meet</span>
                ) : null}
              </div>
            </div>

            <div className="detail-section">
              <h2>Interests</h2>
              <div className="chip-row">
                {profile.interests.map((code) => (
                  <span className="chip" key={code}>
                    {INTEREST_LABELS[code] ?? code}
                  </span>
                ))}
              </div>
            </div>

            <div className="banner" style={{ marginTop: 24, marginBottom: 0 }}>
              <ShieldCheck size={16} />
              <span>
                Your phone number, exact location and private messages are never shown
                here. Contact details should stay off the platform until you both choose
                otherwise.
              </span>
            </div>
          </section>
        </div>

        <aside className="rail">
          <div className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>
                  Why this introduction
                </p>
                <h3>{profile.match.label}</h3>
              </div>
              <ScoreRing score={profile.match.score} />
            </div>
            <div className="breakdown">
              {profile.match.breakdown.map((item) => (
                <div className="breakdown-item" key={item.key}>
                  <span className="breakdown-label">{item.label}</span>
                  <span className="breakdown-score">
                    {Math.round(item.points)}/{item.max}
                  </span>
                  <span className="breakdown-bar">
                    <span style={{ width: `${Math.max(0, Math.min(100, (item.points / item.max) * 100))}%` }} />
                  </span>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <p className="small" style={{ marginBottom: 7 }}>
              {profile.match.explanation}
            </p>
            <p className="tiny" style={{ margin: 0 }}>
              Profile depth: {Math.round(profile.match.confidence * 100)}%. A score is a
              guide, not a verdict. You decide what to do next.
            </p>
          </div>

          <div className="card">
            <RequestComposer
              receiverId={profile.user.id}
              alias={profile.user.alias ?? "this member"}
              relationship={relationshipState}
            />
            <hr className="divider" style={{ margin: "16px 0" }} />
            <SafetyActions memberId={profile.user.id} alias={profile.user.alias ?? "this member"} />
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <Sparkles size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3 style={{ marginBottom: 5 }}>No AI override</h3>
                <p style={{ margin: 0 }}>
                  This score was produced by the deterministic baseline. AI text
                  re-ranking is off. Even when enabled, AI cannot override blocks,
                  consent, eligibility, dealbreakers or account state.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <Info size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <p className="tiny" style={{ margin: 0 }}>
                Shared intentions are shown only if the member chose to display them.
                Dealbreakers and private circumstances are used for checking, not exposed
                as a public list.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
