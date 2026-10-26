import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateSettings } from "@/lib/repository";
import { settingsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your settings." }, { status: 400 });
  }

  await updateSettings({ userId: user.id, ...parsed.data });
  return NextResponse.json({ ok: true });
}
