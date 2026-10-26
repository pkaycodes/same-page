import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createMessage, getMessagesAfter } from "@/lib/repository";
import { messageSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { id } = await params;
  const after = new URL(request.url).searchParams.get("after");
  const messages = await getMessagesAfter(id, user.id, after);
  if (!messages) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Write a message." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const result = await createMessage({
    conversationId: id,
    senderId: user.id,
    body: parsed.data.body,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { ok: true, id: result.id, createdAt: new Date().toISOString() },
    { status: 201 },
  );
}
