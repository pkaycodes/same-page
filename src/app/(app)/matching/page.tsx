import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { isAiMatchingEnabled } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How matching works",
};

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
  await requireOnboardedUser("/matching");
  const aiEnabled = isAiMatchingEnabled();

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Matching, explained</p>
          <h1>Reasons you can inspect.</h1>
          <p>
            Matching is a guide built from your answers. It is not a verdict, and it never
            overrides consent or safety.
          </p>
        </div>
        <span className={aiEnabled ? "badge badge-gold" : "badge badge-green"}>
          <Sparkles size={11} /> {aiEnabled ? "AI-assisted beta" : "Deterministic beta"}
        </span>
      </div>

      <div className="content-grid">
        <div className="main-col">
          <section className="card card-pad-lg mb-2">
            <p className="eyebrow">The short version</p>
            <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.35rem)" }}>
              Hard boundaries first. Compatibility second. AI last, if at all.
            </h2>
            <p className="small muted" style={{ marginBottom: 0 }}>
              SAME PAGE is binary in this beta: women seeking men and men seeking women.
              Seeking is derived on the server; members do not set it independently. Every
              introduction must pass both people&apos;s hard checks before any score is
              calculated.
            </p>
          </section>

          <section className="card mb-2">
            <h2 style={{ fontSize: "1.45rem" }}>The order of decisions</h2>
            <div className="ai-steps" style={{ marginTop: 20 }}>
              <div className="ai-step">
                <span className="ai-step-num">01</span>
                <div>
                  <h3>Safety and consent gates</h3>
                  <p>
                    Account state, blocks, reports under review, onboarding completion,
                    age eligibility, binary opposite-gender matching, mutual intentions,
                    dealbreakers and mutual age ranges. If any gate fails, the profile is
                    not shown. AI is never involved here.
                  </p>
                </div>
              </div>
              <div className="ai-step">
                <span className="ai-step-num">02</span>
                <div>
                  <h3>Deterministic baseline score</h3>
                  <p>
                    A transparent score built from five weighted areas: intentions (35),
                    relationship dynamics (25), life circumstances (20), communication and
                    boundaries (15), and shared interests (5).
                  </p>
                </div>
              </div>
              <div className="ai-step">
                <span className="ai-step-num">03</span>
                <div>
                  <h3>Optional AI re-ranking</h3>
                  <p>
                    When enabled, AI can read only the approved text fields for the top 60
                    eligible candidates. It may adjust the ordering and improve the
                    explanation, within a 30% blend. It cannot create eligibility or remove
                    a safety gate. It is off in this build.
                  </p>
                </div>
              </div>
              <div className="ai-step">
                <span className="ai-step-num">04</span>
                <div>
                  <h3>You decide</h3>
                  <p>
                    You see the score, the reasons and the privacy note. Sending a request
                    is always your choice. A high score does not create consent or
                    guarantee safety.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card mb-2">
            <h2 style={{ fontSize: "1.45rem" }}>The baseline score</h2>
            <p className="small muted">
              Each factor has a fixed maximum. The breakdown is shown on every profile so
              you can see why an introduction appeared.
            </p>
            <div className="breakdown" style={{ marginTop: 16 }}>
              {[
                ["Intentions", 35],
                ["Relationship dynamics", 25],
                ["Life circumstances", 20],
                ["Communication & boundaries", 15],
                ["Shared interests", 5],
              ].map(([label, max]) => (
                <div className="breakdown-item" key={String(label)}>
                  <span className="breakdown-label">{label}</span>
                  <span className="breakdown-score">{max}</span>
                  <span className="breakdown-bar">
                    <span style={{ width: `${Number(max)}%` }} />
                  </span>
                </div>
              ))}
            </div>
            <p className="tiny" style={{ marginTop: 16, marginBottom: 0 }}>
              Hard filters are applied before scoring. A high score never overrides a
              dealbreaker, a block, a report or an account restriction.
            </p>
          </section>

          <section className="settings-grid">
            <div className="card">
              <h2 style={{ fontSize: "1.35rem" }}>What AI may do</h2>
              <div className="stack-sm" style={{ marginTop: 12 }}>
                {[
                  "Re-rank the top eligible candidates within a 30% blend",
                  "Write a clearer explanation of shared themes",
                  "Use only approved profile text after explicit opt-in",
                  "Fall back to the deterministic score if unavailable",
                ].map((item) => (
                  <p className="small row" key={item} style={{ alignItems: "flex-start", gap: 8, margin: 0 }}>
                    <Check size={14} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontSize: "1.35rem" }}>What AI may never do</h2>
              <div className="stack-sm" style={{ marginTop: 12 }}>
                {[
                  "Override a block, report, consent or account state",
                  "Create eligibility or bypass a dealbreaker",
                  "Use phone, email, legal name, date of birth or exact location",
                  "Read private messages or use them for ranking",
                ].map((item) => (
                  <p className="small row" key={item} style={{ alignItems: "flex-start", gap: 8, margin: 0 }}>
                    <X size={14} className="text-clay" style={{ marginTop: 2, flex: "none" }} />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="rail">
          <div className="card card-dark">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <ShieldCheck size={17} style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3 style={{ marginBottom: 5 }}>Current build</h3>
                <p style={{ margin: 0 }}>
                  {aiEnabled
                    ? "The AI layer is enabled behind the feature flag. Every explanation still exposes the deterministic breakdown."
                    : "AI scoring is switched off. All current scores are deterministic, explainable and built only from your profile answers."}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <EyeOff size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3>Always excluded</h3>
                <p style={{ marginTop: 6 }}>
                  Phone number, email, legal name, date of birth, exact location and private
                  messages. Your written profile text is only used if you opt in separately.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <LockKeyhole size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3>Your controls</h3>
                <p style={{ marginTop: 6 }}>
                  Hide your age, area or intentions, pause discovery, or turn off AI text
                  matching in Settings.
                </p>
                <Link className="link-arrow small" href="/settings">
                  Open settings <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
