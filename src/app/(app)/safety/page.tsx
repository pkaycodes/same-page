import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Flag,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShieldOff,
  UserRoundCheck,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getSafetySummary } from "@/lib/repository";
import { formatDate, statusLabel } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Safety",
};

export const dynamic = "force-dynamic";

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ reported?: string }>;
}) {
  const user = await requireOnboardedUser("/safety");
  const params = await searchParams;
  const summary = await getSafetySummary(user.id);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Safety centre</p>
          <h1>Clear boundaries. Real support.</h1>
          <p>
            Blocking, reporting and privacy controls are part of the product, not an
            afterthought.
          </p>
        </div>
        <span className="badge badge-green">
          <ShieldCheck size={11} /> Text-only beta
        </span>
      </div>

      {params.reported === "1" ? (
        <div className="banner">
          <ShieldCheck size={16} />
          <span>
            Report received. Our review process may limit the account while we investigate.
            Thank you for helping keep the beta safe.
          </span>
        </div>
      ) : null}

      <div className="content-grid">
        <div className="main-col">
          <div className="safety-grid">
            <article className="safety-card">
              <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                <ShieldOff size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                <div>
                  <h3>Blocking is immediate</h3>
                  <p>
                    Block from any profile or request. The member disappears from discovery
                    and messages, and is not told. Pending requests between you are closed.
                  </p>
                </div>
              </div>
            </article>

            <article className="safety-card">
              <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                <Flag size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                <div>
                  <h3>Reports get a second pair of eyes</h3>
                  <p>
                    Report harassment, impersonation, fraud, sexual content, hate or a
                    suspected underage account. Reports are not handled by the matching
                    model.
                  </p>
                </div>
              </div>
            </article>

            <article className="safety-card">
              <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                <MessageCircle size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                <div>
                  <h3>Keep early chats on SAME PAGE</h3>
                  <p>
                    Do not share bank details, send money or move to another app before you
                    feel ready. There is no voice, video or payment feature in this beta.
                  </p>
                </div>
              </div>
            </article>

            <article className="safety-card">
              <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                <UserRoundCheck size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                <div>
                  <h3>Meet on your terms</h3>
                  <p>
                    Meet in a public place, tell someone you trust, arrange your own
                    transport and leave if anything feels wrong. A compatibility score is
                    not a safety guarantee.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <div className="card mt-3">
            <div className="card-head">
              <div>
                <h2 style={{ fontSize: "1.45rem" }}>Blocked members</h2>
                <p className="small muted" style={{ margin: 0 }}>
                  {summary.blocked.length === 0
                    ? "You have not blocked anyone."
                    : "These members cannot see or contact you."}
                </p>
              </div>
              <span className="badge">{summary.blocked.length}</span>
            </div>

            {summary.blocked.length > 0 ? (
              <div className="report-list">
                {summary.blocked.map((item) => (
                  <div className="report-item" key={item.id}>
                    <span>
                      <strong>{item.alias ?? "Member"}</strong>
                      {item.city ? <span className="muted"> · {item.city}</span> : null}
                    </span>
                    <span className="tiny">Blocked {formatDate(item.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small muted" style={{ marginBottom: 0 }}>
                Blocking from a profile is silent. You can do it at any time.
              </p>
            )}
          </div>

          <div className="card mt-2">
            <div className="card-head">
              <div>
                <h2 style={{ fontSize: "1.45rem" }}>Your reports</h2>
                <p className="small muted" style={{ margin: 0 }}>
                  Only you and the review team can see these.
                </p>
              </div>
              <span className="badge">{summary.reports.length}</span>
            </div>

            {summary.reports.length > 0 ? (
              <div className="report-list">
                {summary.reports.map((item) => (
                  <div className="report-item" key={item.id}>
                    <span>
                      <strong>{item.alias ?? "Member"}</strong>
                      <span className="muted">
                        {" "}
                        · {item.category.replaceAll("_", " ")}
                      </span>
                    </span>
                    <span className={`status status-${item.status === "open" ? "pending" : "accepted"}`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small muted" style={{ marginBottom: 0 }}>
                No reports submitted from this account.
              </p>
            )}
          </div>
        </div>

        <aside className="rail">
          <div className="card card-dark">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <AlertTriangle size={17} style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3 style={{ marginBottom: 5 }}>In an emergency</h3>
                <p style={{ margin: 0 }}>
                  Contact local emergency services. SAME PAGE is not monitored as a live
                  crisis service.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Your privacy controls</h3>
            <p style={{ marginTop: 6 }}>
              Hide your age, area or intentions at any time. Your phone number and exact
              location are never public.
            </p>
            <Link className="link-arrow small" href="/settings">
              Open privacy settings <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <LockKeyhole size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3>AI cannot override moderation</h3>
                <p style={{ margin: 0 }}>
                  Blocks, reports, consent, eligibility, dealbreakers and account state are
                  deterministic or human decisions. AI ranking cannot bypass them.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
