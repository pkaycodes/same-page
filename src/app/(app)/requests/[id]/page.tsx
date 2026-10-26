import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { RequestActions } from "@/components/RequestActions";
import { ScoreRing } from "@/components/ScoreRing";
import { requireOnboardedUser } from "@/lib/auth";
import { getRequestById } from "@/lib/repository";
import { formatDate, statusLabel } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboardedUser("/requests");
  const { id } = await params;
  const request = await getRequestById(id, user.id);
  if (!request) notFound();

  const isReceiver = request.receiverId === user.id;
  const canRespond = isReceiver && request.status === "pending";

  return (
    <>
      <Link className="btn btn-ghost btn-sm" href="/requests" style={{ marginLeft: -10, marginBottom: 13 }}>
        <ArrowLeft size={14} /> Back to requests
      </Link>

      <div className="content-grid">
        <div className="main-col">
          <section className="card card-pad-lg">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 13 }}>
                <Avatar alias={request.otherAlias} size="lg" />
                <div>
                  <p className="eyebrow" style={{ marginBottom: 5 }}>
                    {isReceiver ? "Incoming request" : "Your request"}
                  </p>
                  <h1 style={{ marginBottom: 4, fontSize: "clamp(2.1rem, 4vw, 3.2rem)" }}>
                    {request.otherAlias}
                    {request.otherAge ? `, ${request.otherAge}` : ""}
                  </h1>
                  <p className="small muted" style={{ margin: 0 }}>
                    {request.otherCity ?? "Area hidden"} · {formatDate(request.createdAt, true)}
                  </p>
                </div>
              </div>
              <span className={`status status-${request.status}`}>{statusLabel(request.status)}</span>
            </div>

            <p className="request-note" style={{ marginTop: 22, fontSize: "1.04rem" }}>
              “{request.note}”
            </p>

            <div className="row flex-wrap" style={{ gap: 8, marginTop: 16 }}>
              <Link className="btn btn-secondary btn-sm" href={`/people/${request.otherId}`}>
                View full profile <ArrowRight size={13} />
              </Link>
              {request.score ? (
                <span className="badge badge-green">{request.score}% baseline fit</span>
              ) : null}
            </div>

            <hr className="divider" style={{ margin: "23px 0" }} />

            {canRespond ? (
              <>
                <h2 style={{ fontSize: "1.35rem" }}>What would you like to do?</h2>
                <p className="small muted" style={{ marginBottom: 16 }}>
                  Accepting opens a private text chat. Passing closes this request. Neither
                  choice sends a notification with a reason.
                </p>
                <RequestActions requestId={request.id} />
              </>
            ) : request.status === "accepted" && request.conversationId ? (
              <div>
                <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                  <Check size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                  <div>
                    <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>You are connected.</h2>
                    <p className="small muted">
                      Your private conversation with {request.otherAlias} is ready.
                    </p>
                    <Link className="btn btn-primary" href={`/messages/${request.conversationId}`}>
                      <MessageCircle size={15} /> Open conversation
                    </Link>
                  </div>
                </div>
              </div>
            ) : request.status === "pending" ? (
              <div>
                <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                  <Clock size={17} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
                  <div>
                    <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>Waiting for their reply.</h2>
                    <p className="small muted" style={{ margin: 0 }}>
                      They have seen your note and profile. You can keep browsing; there is
                      no need to send another request.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="row" style={{ alignItems: "flex-start", gap: 9 }}>
                  <X size={17} className="muted" style={{ marginTop: 2, flex: "none" }} />
                  <div>
                    <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>This request was passed.</h2>
                    <p className="small muted" style={{ margin: 0 }}>
                      No reason is shared. You can return to discovery when you are ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="rail">
          {request.score ? (
            <div className="card center">
              <ScoreRing score={request.score} />
              <h3 style={{ marginTop: 11 }}>Baseline compatibility</h3>
              <p style={{ marginBottom: 0 }}>
                A deterministic guide based on intentions, dynamics, life circumstances
                and boundaries. It is not a verdict.
              </p>
            </div>
          ) : null}

          <div className="card card-dark">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <ShieldCheck size={16} style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3 style={{ marginBottom: 5 }}>You are in control</h3>
                <p style={{ margin: 0 }}>
                  You can block or report from the profile or safety centre. Blocking is
                  immediate and silent.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-soft">
            <h3>Before you reply</h3>
            <ul>
              <li>Read the note for pressure, money requests or contact details.</li>
              <li>Trust what you feel, not just the compatibility score.</li>
              <li>Meet in public and tell someone you trust when you meet.</li>
            </ul>
            <Link className="link-arrow small" href="/safety">
              Safety centre <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
