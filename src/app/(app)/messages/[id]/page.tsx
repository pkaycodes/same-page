import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ChatThread } from "@/components/ChatThread";
import { ConversationList } from "@/components/ConversationList";
import { requireOnboardedUser } from "@/lib/auth";
import { getConversation, getConversations } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboardedUser("/messages");
  const { id } = await params;
  const result = await getConversation(id, user.id);
  if (!result) notFound();

  const conversations = await getConversations(user.id);
  const otherAlias = result.other.alias ?? "Member";

  return (
    <div className="chat-page">
      <Link className="btn btn-ghost btn-sm" href="/messages" style={{ marginLeft: -10, marginBottom: 10 }}>
        <ArrowLeft size={14} /> All messages
      </Link>

      <div className="messages-layout">
        <ConversationList
          conversations={conversations}
          activeId={result.conversation.id}
          currentUserId={user.id}
        />
        <section className="chat-panel">
          <header className="chat-head">
            <Avatar alias={otherAlias} />
            <div className="grow">
              <div className="row" style={{ gap: 7 }}>
                <strong style={{ fontSize: "0.86rem" }}>{otherAlias}</strong>
                {result.other.city ? <span className="tiny">{result.other.city}</span> : null}
              </div>
              <span className="tiny chat-head-sub">Private conversation · text only</span>
            </div>
            <Link className="btn btn-secondary btn-sm" href={`/people/${result.other.id}`}>
              Profile
            </Link>
            <Link className="btn btn-ghost btn-sm" href="/safety" aria-label="Safety centre">
              <Shield size={15} />
            </Link>
          </header>

          <ChatThread
            conversationId={result.conversation.id}
            currentUserId={user.id}
            initialMessages={result.messages}
            otherAlias={otherAlias}
          />
        </section>
      </div>
    </div>
  );
}
