import { NextResponse } from "next/server";
import { createDemoSession, demoMode } from "@/lib/auth";

export async function POST(request: Request) {
  if (!demoMode()) {
    return NextResponse.json({ error: "Demo access is disabled." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const kind = body?.kind === "kwame" ? "kwame" : "ama";
  const result = await createDemoSession(kind);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, redirectTo: "/discover" });
}
