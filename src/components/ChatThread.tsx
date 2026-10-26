"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import type { MessageRow } from "@/lib/types";
import { formatTime } from "@/lib/ui";

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherAlias,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageRow[];
  otherAlias: string;
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { messages?: MessageRow[] };
        if (data.messages && !cancelled) setMessages(data.messages);
      } catch {
        // A dropped poll is not worth interrupting the conversation.
      }
    }
    const interval = window.setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [conversationId]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = (await response.json()) as {
        id?: string;
        createdAt?: string;
        error?: string;
      };
      if (!response.ok || !data.id) {
        setError(data.error ?? "We could not send your message.");
        return;
      }
      setMessages((current) => [
        ...current,
        {
          id: data.id!,
          conversation_id: conversationId,
          sender_id: currentUserId,
          body: trimmed,
          created_at: data.createdAt ?? new Date().toISOString(),
          read_at: null,
        },
      ]);
      setBody("");
    } catch {
      setError("Something went wrong. Your message was not sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ margin: "auto", maxWidth: 390, border: 0 }}>
            <MessageCircle size={24} className="text-forest" style={{ marginBottom: 10 }} />
            <h3>Start with something real.</h3>
            <p>
              You are connected with {otherAlias}. Ask about something in their profile, or
              share what a good week looks like for you.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            return (
              <div className={mine ? "message-row mine" : "message-row"} key={message.id}>
                <div className="message-bubble">
                  {message.body}
                  <span className="message-time">{formatTime(message.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-form" onSubmit={send}>
        <label className="sr-only" htmlFor="message-body">
          Message
        </label>
        <input
          id="message-body"
          className="input grow"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          placeholder={`Message ${otherAlias}…`}
          autoComplete="off"
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy || body.trim().length === 0}
          aria-label="Send message"
        >
          <ArrowUp size={17} />
        </button>
      </form>
      {error ? (
        <p className="error-text" style={{ padding: "0 14px 10px" }}>
          {error}
        </p>
      ) : null}
      <p className="tiny" style={{ margin: 0, padding: "0 14px 10px", background: "var(--card)" }}>
        Text only in the beta. Never share money, bank details or your exact address.
      </p>
    </>
  );
}
