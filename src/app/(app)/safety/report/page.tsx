import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReportForm } from "@/components/ReportForm";
import { requireOnboardedUser } from "@/lib/auth";
import { getUserById } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Report a member",
};

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const user = await requireOnboardedUser("/safety");
  const params = await searchParams;
  const reportedId = params.userId;
  if (!reportedId || reportedId === user.id) notFound();

  const reported = await getUserById(reportedId);
  if (!reported) notFound();

  return (
    <div className="report-shell">
      <Link className="btn btn-ghost btn-sm" href="/safety" style={{ marginLeft: -10, marginBottom: 14 }}>
        <ArrowLeft size={14} /> Back to safety
      </Link>
      <div className="report-card">
        <p className="eyebrow">Private report</p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Report {reported.alias ?? "this member"}.</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Tell us what happened. You do not need to prove anything to submit a report, and
          you can block the member separately.
        </p>
        <ReportForm reportedId={reported.id} alias={reported.alias ?? "this member"} />
      </div>
    </div>
  );
}
