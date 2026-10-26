import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createConnectionRequest } from "@/lib/repository";
import { requestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!user.onboardingComplete) {
    return NextResponse.json({ error: "Finish your profile first." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your note." },
      { status: 400 },
    );
  }

  const result = await createConnectionRequest({
    senderId: user.id,
    receiverId: parsed.data.receiverId,
    note: parsed.data.note,
  });
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, requestId: "requestId" in result ? result.requestId : undefined },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, requestId: result.requestId }, { status: 201 });
}
