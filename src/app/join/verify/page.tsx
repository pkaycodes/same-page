import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/Brand";
import { VerifyForm } from "@/components/AuthForms";
import { getSessionUser, otpDevMode } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify your phone",
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; dev?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect(user.onboardingComplete ? "/discover" : "/onboarding");

  const params = await searchParams;
  const phone = params.phone?.trim();
  if (!phone) redirect("/join");

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Brand light sub="Private beta · Accra" />
        <div className="auth-aside-copy">
          <p className="eyebrow" style={{ color: "#e3b49e" }}>
            One small check
          </p>
          <blockquote>Real people. Clear intentions. Less noise.</blockquote>
          <p>
            Verification keeps the beta small and human. We do not sell your number, and
            it is never part of your public profile or the matching model.
          </p>
        </div>
        <div className="row" style={{ gap: 7, color: "#aec0b4", fontSize: "0.68rem" }}>
          <ShieldCheck size={14} /> Phone numbers stay private
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link className="btn btn-ghost btn-sm" href="/join" style={{ marginLeft: -10, marginBottom: 14 }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <p className="eyebrow">Phone verification</p>
          <h1>Check your messages.</h1>
          <p className="muted">
            Enter the code we sent. It expires in ten minutes and can only be used once.
          </p>

          <VerifyForm phone={phone} devCode={otpDevMode() ? (params.dev ?? null) : null} />

          <p className="tiny" style={{ marginTop: 20, marginBottom: 0 }}>
            Did not receive it? Check that the number is correct, then request a new code.
            SMS delivery is not connected in local development.
          </p>
        </div>
      </main>
    </div>
  );
}
