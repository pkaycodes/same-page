"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Clock, MessageCircle, Send, X } from "lucide-react";

type RelationshipState = {
  id: string;
  status: "pending" | "accepted" | "declined" | "expired";
  sentByMe: boolean;
  conversationId: string | null;
};

export function RequestComposer({
  receiverId,
  alias,
  relationship,
}: {
  receiverId: string;
  alias: string;
  relationship: RelationshipState | null;
}) {
  const [state, setState] = useState<RelationshipState | null>(relationship);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, note }),
      });
      const data = (await response.json()) as { requestId?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? "We could not send your request.");
        return;
      }
      setState({
        id: data.requestId ?? "",
        status: "pending",
        sentByMe: true,
        conversationId: null,
      });
      setNote("");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (state?.status === "pending") {
    return (
      <div className="card card-soft" style={{ marginBottom: 14 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
          {state.sentByMe ? (
            <Clock size={17} className="text-forest" style={{ marginTop: 1, flex: "none" }} />
          ) : (
            <Send size={17} className="text-forest" style={{ marginTop: 1, flex: "none" }} />
          )}
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "0.83rem" }}>
              {state.sentByMe ? "Request sent" : `${alias} sent you a request`}
            </p>
            <p className="hint" style={{ marginBottom: 10 }}>
              {state.sentByMe
                ? "They can accept or pass. You will see it in Requests either way."
                : "Read their note before you decide. Accepting opens a private text chat."}
            </p>
            <Link className="link-arrow small" href={`/requests/${state.id}`}>
              {state.sentByMe ? "View your request" : "Read the request"} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state?.status === "accepted" && state.conversationId) {
    return (
      <div className="card card-soft" style={{ marginBottom: 14 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
          <MessageCircle size={17} className="text-forest" style={{ marginTop: 1, flex: "none" }} />
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "0.83rem" }}>
              You are connected
            </p>
            <p className="hint" style={{ marginBottom: 10 }}>
              Your private text conversation with {alias} is open.
            </p>
            <Link className="btn btn-primary btn-sm" href={`/messages/${state.conversationId}`}>
              Open conversation <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={send} style={{ marginBottom: 14 }}>
      <label className="label" htmlFor="request-note">
        Send {alias} a considered note
      </label>
      <p className="hint" style={{ margin: "4px 0 8px" }}>
        Keep it specific and kind. No phone numbers, social handles or payment requests.
      </p>
      <textarea
        id="request-note"
        className="textarea"
        style={{ minHeight: 104 }}
        maxLength={500}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={`Hi ${alias} — we seem to care about some of the same things. I would be glad to hear what a good week looks like for you.`}
      />
      <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
        <span className="tiny">{note.length}/500</span>
        {state?.status === "declined" ? (
          <span className="tiny row" style={{ gap: 4 }}>
            <X size={11} /> A previous request was passed
          </span>
        ) : null}
      </div>

      {error ? <p className="form-error" style={{ marginTop: 8 }}>{error}</p> : null}

      <button
        className="btn btn-primary btn-block"
        type="submit"
        disabled={busy || note.trim().length === 0}
        style={{ marginTop: 10 }}
      >
        {busy ? "Sending…" : "Send request"}
        {!busy ? <Send size={15} /> : null}
      </button>

      <p className="tiny row" style={{ gap: 5, marginTop: 9, marginBottom: 0 }}>
        <Check size={11} /> A request is not a match until they accept.
      </p>
    </form>
  );
}
