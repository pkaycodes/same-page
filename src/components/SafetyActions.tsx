"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag, ShieldOff } from "lucide-react";

export function SafetyActions({
  memberId,
  alias,
}: {
  memberId: string;
  alias: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function block() {
    const confirmed = window.confirm(
      `Block ${alias}? They will disappear from discovery and messages. They will not be told.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: memberId }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "We could not block this member.");
        return;
      }
      router.push("/discover?blocked=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="row flex-wrap" style={{ gap: 8 }}>
        <Link className="btn btn-secondary btn-sm" href={`/safety/report?userId=${memberId}`}>
          <Flag size={13} /> Report
        </Link>
        <button className="btn btn-danger btn-sm" type="button" onClick={block} disabled={busy}>
          <ShieldOff size={13} /> {busy ? "Blocking…" : "Block"}
        </button>
      </div>
      {error ? <p className="error-text" style={{ marginTop: 8 }}>{error}</p> : null}
      <p className="tiny" style={{ marginTop: 8, marginBottom: 0 }}>
        Blocking is immediate and silent. Reports are reviewed separately.
      </p>
    </div>
  );
}
