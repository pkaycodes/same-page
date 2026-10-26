import Link from "next/link";
import { ArrowRight, Clock3, MessageCircle } from "lucide-react";
import type { RequestSummary } from "@/lib/types";
import { Avatar } from "./Avatar";
import { formatRelative, statusLabel } from "@/lib/ui";

export function RequestCard({
  request,
  direction,
}: {
  request: RequestSummary;
  direction: "incoming" | "outgoing";
}) {
  const note =
    request.status === "pending"
      ? direction === "incoming"
        ? "Sent you a request"
        : "Waiting for their reply"
      : request.status === "accepted"
        ? "You are connected"
        : `Request ${request.status}`;

  return (
    <article className="request-card">
      <div className="request-card-top">
        <Avatar alias={request.otherAlias} />
        <div className="grow">
          <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "0.86rem" }}>
                {request.otherAlias}
                {request.otherAge ? `, ${request.otherAge}` : ""}
              </p>
              <p className="tiny" style={{ margin: "1px 0 0" }}>
                {request.otherCity ?? "Area hidden"} · {formatRelative(request.createdAt)}
              </p>
            </div>
            <span className={`status status-${request.status}`}>{statusLabel(request.status)}</span>
          </div>
          <p className="tiny row" style={{ gap: 5, margin: "7px 0 0" }}>
            {request.status === "accepted" ? <MessageCircle size={12} /> : <Clock3 size={12} />}
            {note}
            {request.score ? ` · ${request.score}% baseline fit` : ""}
          </p>
        </div>
      </div>

      {request.note ? <p className="request-note">“{request.note}”</p> : null}

      <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
        <Link
          className={
            direction === "incoming" && request.status === "pending"
              ? "btn btn-primary btn-sm"
              : "btn btn-secondary btn-sm"
          }
          href={`/requests/${request.id}`}
        >
          {direction === "incoming" && request.status === "pending"
            ? "Read and respond"
            : request.status === "accepted" && request.conversationId
              ? "Open request"
              : "View request"}{" "}
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
