import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/ConversationList";
import { requireOnboardedUser } from "@/lib/auth";
import { getConversations } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Messages",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireOnboardedUser("/messages");
  const conversations = await getConversations(user.id);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Messages</p>
          <h1>Private conversations.</h1>
          <p>
            Text only. A conversation opens only after you both accept a request.
          </p>
        </div>
        <span className="badge badge-green">
          <MessageCircle size={11} /> {conversations.length} open
        </span>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <MessageCircle size={26} className="text-forest" style={{ marginBottom: 12 }} />
          <h3>No conversations yet</h3>
          <p>
            When a request is accepted, a private chat opens here. Until then, take your
            time with the profiles that interest you.
          </p>
          <Link className="btn btn-primary" href="/discover">
            Discover compatible people <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="messages-layout">
          <ConversationList conversations={conversations} currentUserId={user.id} />
          <div
            className="chat-panel placeholder-panel"
            style={{ alignItems: "center", justifyContent: "center", padding: 30 }}
          >
            <div className="empty-state" style={{ border: 0, padding: 20 }}>
              <MessageCircle size={26} className="text-forest" style={{ marginBottom: 10 }} />
              <h3>Choose a conversation</h3>
              <p>
                Your messages stay inside SAME PAGE. Keep contact details, money and exact
                locations out of early conversations.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
