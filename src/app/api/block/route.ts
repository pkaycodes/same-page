import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { blockUser } from "@/lib/repository";
import { blockSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a member to block." }, { status: 400 });
  }

  const result = await blockUser(user.id, parsed.data.blockedId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
