import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { ConversationSummary } from "@/lib/types";
import { Avatar } from "./Avatar";
import { formatRelative } from "@/lib/ui";

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
  currentUserId: string;
}) {
  return (
    <aside className={activeId ? "conversation-list thread-list" : "conversation-list"}>
      <div className="row" style={{ justifyContent: "space-between", padding: "8px 10px 10px" }}>
        <strong style={{ fontSize: "0.78rem" }}>Conversations</strong>
        <span className="badge">{conversations.length}</span>
      </div>

      {conversations.length === 0 ? (
        <div style={{ padding: "26px 16px", textAlign: "center" }}>
          <MessageCircle size={22} className="text-forest" style={{ marginBottom: 9 }} />
          <p className="small" style={{ marginBottom: 4 }}>
            No conversations yet.
          </p>
          <p className="tiny" style={{ margin: 0 }}>
            They open after a request is accepted.
          </p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const preview =
            conversation.lastMessage === null
              ? "New conversation"
              : `${conversation.lastSenderId === currentUserId ? "You: " : ""}${conversation.lastMessage}`;
          return (
            <Link
              key={conversation.id}
              className={
                activeId === conversation.id ? "conversation-item active" : "conversation-item"
              }
              href={`/messages/${conversation.id}`}
            >
              <Avatar alias={conversation.otherAlias} />
              <div className="grow">
                <div className="conversation-item-name">
                  <span>{conversation.otherAlias}</span>
                  <span className="conversation-item-time">
                    {formatRelative(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="conversation-item-preview grow">{preview}</span>
                  {conversation.unreadCount > 0 ? (
                    <span className="conversation-unread">
                      {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </aside>
  );
}
