import Link from "next/link";
import {
  ArrowRight,
  Check,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ScoreRing } from "@/components/ScoreRing";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const signedIn = Boolean(user);

  return (
    <div className="site-shell">
      <SiteHeader signedIn={signedIn} />

      <main className="site-main">
        <section className="hero">
          <div>
            <p className="eyebrow">Private beta · Accra, Ghana</p>
            <h1>
              Start with what you want. Not what you <em>look like.</em>
            </h1>
            <p className="hero-lede">
              SAME PAGE is intention-first dating for women seeking men and men seeking
              women. No public photo feed. No endless swiping. Considered introductions,
              with the reasons shown.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={signedIn ? "/discover" : "/join"}>
                {signedIn ? "Go to discover" : "Create your private profile"}
                <ArrowRight size={16} />
              </Link>
              <a className="btn btn-secondary" href="#how">
                See how it works
              </a>
            </div>
            <div className="trust-row" aria-label="Product principles">
              <span>
                <UserCheck size={14} /> Phone verified
              </span>
              <span>
                <LockKeyhole size={14} /> No public photo browsing
              </span>
              <span>
                <MessageCircle size={14} /> Text-only in beta
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Example compatibility preview">
            <div className="hero-card">
              <div className="hero-card-top">
                <span className="badge badge-green">
                  <Sparkles size={11} /> Compatibility preview
                </span>
                <span className="badge badge-gold">Explainable fit</span>
              </div>

              <div className="hero-person">
                <Avatar alias="Ama_K" size="lg" />
                <div>
                  <h3>Ama, 29</h3>
                  <p>East Legon, Accra · Woman seeking a man</p>
                </div>
              </div>

              <div className="hero-score-row">
                <ScoreRing score={88} light />
                <div>
                  <h3>A strong fit — with reasons</h3>
                  <p>
                    You share a serious relationship intention, a similar pace, and
                    compatible answers about family and boundaries.
                  </p>
                </div>
              </div>

              <div className="reasons">
                <span className="badge badge-green">Shared intention</span>
                <span className="badge badge-green">Similar pace</span>
                <span className="badge badge-green">Same broad area</span>
              </div>

              <div className="hero-card-foot">
                <span>Not a verdict. A starting point.</span>
                <span>No photos exchanged</span>
              </div>
            </div>

            <div className="hero-float">
              <LockKeyhole size={16} className="text-forest" />
              <span>
                <strong>Privacy by default.</strong> Sensitive details stay out of the AI
                layer, and you can hide your age, area or intentions.
              </span>
            </div>
          </div>
        </section>

        <section className="section" id="principles">
          <div className="section-head">
            <p className="eyebrow">A calmer way in</p>
            <h2>Designed around intention, not performance.</h2>
            <p>
              Most dating apps ask you to perform before you can be understood. SAME PAGE
              starts with the things that actually shape a relationship — then gets out of
              the way.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="icon-box">
                <HeartHandshake size={19} />
              </span>
              <h3>Intentions come first</h3>
              <p>
                Say whether you are looking for a life partner, a serious relationship,
                companionship or something lighter. Compatibility starts there.
              </p>
            </article>
            <article className="feature-card">
              <span className="icon-box">
                <SlidersHorizontal size={19} />
              </span>
              <h3>Reasons, not a ranking</h3>
              <p>
                Every introduction shows what you share and where you differ. The score is
                a guide, never a decision made for you.
              </p>
            </article>
            <article className="feature-card">
              <span className="icon-box">
                <ShieldCheck size={19} />
              </span>
              <h3>Control stays with you</h3>
              <p>
                Block and report from anywhere. Pause discovery when you need space. Your
                phone number, legal name and exact location are not part of matching.
              </p>
            </article>
          </div>
        </section>

        <section className="section" id="how">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Four steps. No performance.</h2>
          </div>
          <div className="steps">
            <article className="step">
              <span className="step-num">01</span>
              <h3>Verify your phone</h3>
              <p>A six-digit code keeps the community human and reduces fake accounts.</p>
            </article>
            <article className="step">
              <span className="step-num">02</span>
              <h3>Set your intentions</h3>
              <p>
                Tell us what you want, how you communicate and what you will not
                compromise on.
              </p>
            </article>
            <article className="step">
              <span className="step-num">03</span>
              <h3>See compatible people</h3>
              <p>
                Women see men and men see women. Every match is checked against both
                people&apos;s dealbreakers.
              </p>
            </article>
            <article className="step">
              <span className="step-num">04</span>
              <h3>Start with a note</h3>
              <p>
                A short, considered message. If they accept, a private text conversation
                opens.
              </p>
            </article>
          </div>
        </section>

        <section className="safety-band" id="safety">
          <div>
            <p className="eyebrow" style={{ color: "#e3b49e" }}>
              Safety is a feature
            </p>
            <h2>Private by design. Clear when it matters.</h2>
            <p>
              No photo browsing, no voice or video in the beta, and no payments. You always
              know what is shared and why.
            </p>
          </div>
          <div className="safety-points">
            <div className="safety-point">
              <Check size={15} /> Phone-first sign-in
            </div>
            <div className="safety-point">
              <Check size={15} /> Silent, immediate blocking
            </div>
            <div className="safety-point">
              <Check size={15} /> Human review for reports
            </div>
            <div className="safety-point">
              <Check size={15} /> No AI override of consent
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="card card-dark card-pad-lg closing-card">
            <div>
              <p className="eyebrow" style={{ color: "#e3b49e" }}>
                Ready when you are
              </p>
              <h2 style={{ marginBottom: 6 }}>Begin with a clearer intention.</h2>
              <p className="muted" style={{ margin: 0, fontSize: "0.86rem" }}>
                The beta is small on purpose. Thoughtful profiles make better
                introductions.
              </p>
            </div>
            <Link className="btn btn-primary" href={signedIn ? "/discover" : "/join"}>
              {signedIn ? "Open SAME PAGE" : "Join the private beta"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 SAME PAGE. Built in Accra, for Ghana.</span>
        <nav aria-label="Footer">
          <a href="#how">How it works</a>
          <a href="#principles">Our approach</a>
          <a href="#safety">Safety</a>
          <Link href="/join">Sign in</Link>
        </nav>
      </footer>
    </div>
  );
}
