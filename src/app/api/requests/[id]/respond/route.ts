import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { respondToRequest } from "@/lib/repository";
import { requestResponseSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = requestResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose accept or pass." }, { status: 400 });
  }

  const { id } = await params;
  const result = await respondToRequest({
    requestId: id,
    receiverId: user.id,
    action: parsed.data.action,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
