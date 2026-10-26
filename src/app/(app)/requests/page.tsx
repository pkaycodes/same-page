import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Inbox, ShieldCheck } from "lucide-react";
import { RequestCard } from "@/components/RequestCard";
import { requireOnboardedUser } from "@/lib/auth";
import { getIncomingRequests, getOutgoingRequests } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Requests",
};

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ responded?: string }>;
}) {
  const user = await requireOnboardedUser("/requests");
  const params = await searchParams;
  const [incoming, outgoing] = await Promise.all([
    getIncomingRequests(user.id),
    getOutgoingRequests(user.id),
  ]);

  const waiting = incoming.filter((request) => request.status === "pending");
  const history = incoming.filter((request) => request.status !== "pending");

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Requests</p>
          <h1>Who is reaching out.</h1>
          <p>
            {waiting.length > 0
              ? `${waiting.length} ${waiting.length === 1 ? "request is" : "requests are"} waiting for your answer.`
              : "No pending requests. A quieter inbox is allowed."}
          </p>
        </div>
        <div className="head-actions">
          <span className="badge badge-green">
            <Check size={11} /> Notes come first
          </span>
        </div>
      </div>

      {params.responded === "1" ? (
        <div className="banner">
          <Check size={16} />
          <span>Your response was saved. Nothing else is shared until you both choose it.</span>
        </div>
      ) : null}

      <div className="content-grid">
        <div className="main-col">
          <section style={{ marginBottom: 30 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 11 }}>
              <h2 className="serif" style={{ margin: 0, fontSize: "1.55rem" }}>
                Waiting for you
              </h2>
              <span className="badge badge-gold">{waiting.length}</span>
            </div>
            {waiting.length === 0 ? (
              <div className="empty-state">
                <h3>Nothing waiting</h3>
                <p>
                  When someone sends you a considered note, it will appear here. You never
                  have to respond immediately.
                </p>
                <Link className="btn btn-secondary" href="/discover">
                  See compatible people <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              waiting.map((request) => (
                <RequestCard key={request.id} request={request} direction="incoming" />
              ))
            )}
          </section>

          <section style={{ marginBottom: 30 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 11 }}>
              <h2 className="serif" style={{ margin: 0, fontSize: "1.55rem" }}>
                Sent by you
              </h2>
              <span className="badge">{outgoing.length}</span>
            </div>
            {outgoing.length === 0 ? (
              <p className="small muted">
                You have not sent a request yet. Start from a profile when something feels
                worth exploring.
              </p>
            ) : (
              outgoing.map((request) => (
                <RequestCard key={request.id} request={request} direction="outgoing" />
              ))
            )}
          </section>

          {history.length > 0 ? (
            <section>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 11 }}>
                <h2 className="serif" style={{ margin: 0, fontSize: "1.55rem" }}>
                  Past replies
                </h2>
                <span className="badge">{history.length}</span>
              </div>
              {history.map((request) => (
                <RequestCard key={request.id} request={request} direction="incoming" />
              ))}
            </section>
          ) : null}
        </div>

        <aside className="rail">
          <div className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <Inbox size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3>How requests work</h3>
                <p style={{ marginTop: 6 }}>
                  A request includes a short note. The other person sees it alongside your
                  profile and compatibility reasons. If they accept, a private text
                  conversation opens.
                </p>
              </div>
            </div>
          </div>

          <div className="card card-soft">
            <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <ShieldCheck size={16} className="text-forest" style={{ marginTop: 2, flex: "none" }} />
              <div>
                <h3>No pressure</h3>
                <p style={{ marginTop: 6, marginBottom: 10 }}>
                  Passing is silent and final for that request. You can report a note that
                  feels unsafe.
                </p>
                <Link className="link-arrow small" href="/safety">
                  Safety centre <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
