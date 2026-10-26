import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/Brand";
import { PhoneAuthForm } from "@/components/AuthForms";
import { demoMode, getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Join the private beta",
  description: "Create a private, intention-first SAME PAGE profile with your phone number.",
};

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const user = await getSessionUser();
  if (user) redirect(user.onboardingComplete ? "/discover" : "/onboarding");

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Brand light sub="Private beta · Accra" />
        <div className="auth-aside-copy">
          <blockquote>“The right questions are more revealing than a highlight reel.”</blockquote>
          <p>
            SAME PAGE is a small, phone-verified community for people who want to be
            understood before they are judged. No public photo feed. No endless swiping.
          </p>
          <div className="auth-quote-person">
            <span className="avatar sage" style={{ width: 29, height: 29, fontSize: "0.58rem" }}>
              SP
            </span>
            <span>The SAME PAGE beta team</span>
          </div>
        </div>
        <div className="row flex-wrap" style={{ gap: 16, color: "#aec0b4", fontSize: "0.68rem" }}>
          <span className="row" style={{ gap: 6 }}>
            <ShieldCheck size={14} /> Phone verified
          </span>
          <span className="row" style={{ gap: 6 }}>
            <LockKeyhole size={14} /> Private by default
          </span>
          <span className="row" style={{ gap: 6 }}>
            <MessageCircle size={14} /> Text-only beta
          </span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">A calmer way in</p>
          <h1>Meet people on the same page.</h1>
          <p className="muted">
            Sign in with a phone number. We will send a six-digit code. Your number is
            never shown to anyone you meet.
          </p>

          <PhoneAuthForm demoEnabled={demoMode()} />

          <div className="auth-note">
            <p style={{ margin: "0 0 7px" }}>
              <strong style={{ color: "var(--ink)" }}>What the beta includes:</strong>
            </p>
            <p className="row" style={{ gap: 7, margin: "0 0 4px" }}>
              <Check size={12} /> Women seeking men and men seeking women only
            </p>
            <p className="row" style={{ gap: 7, margin: "0 0 4px" }}>
              <Check size={12} /> Text conversations after an accepted request
            </p>
            <p className="row" style={{ gap: 7, margin: 0 }}>
              <Check size={12} /> No photo browsing, voice, video or payments
            </p>
          </div>

          <p className="tiny" style={{ marginTop: 18, marginBottom: 0 }}>
            Already verified?{" "}
            <Link href="/join" style={{ color: "var(--forest)", fontWeight: 700 }}>
              Use the same number
            </Link>{" "}
            or{" "}
            <Link href="/" style={{ color: "var(--forest)", fontWeight: 700 }}>
              return home
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
