"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, X } from "lucide-react";

export function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "accept" | "decline") {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as {
        conversationId?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "We could not respond to this request.");
        return;
      }
      if (action === "accept" && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      } else {
        router.push("/requests?responded=1");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="row flex-wrap" style={{ gap: 8 }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => respond("accept")}
          disabled={busy !== null}
          style={{ flex: 1 }}
        >
          {busy === "accept" ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}
          {busy === "accept" ? "Opening chat…" : "Accept and open chat"}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => respond("decline")}
          disabled={busy !== null}
        >
          {busy === "decline" ? "Passing…" : "Pass"}
          {busy !== "decline" ? <X size={15} /> : null}
        </button>
      </div>
      {error ? <p className="form-error" style={{ marginTop: 9 }}>{error}</p> : null}
      <p className="tiny row" style={{ gap: 5, marginTop: 9, marginBottom: 0 }}>
        <ArrowRight size={11} /> Accepting opens a private text conversation. You can block
        or report at any time.
      </p>
    </div>
  );
}
