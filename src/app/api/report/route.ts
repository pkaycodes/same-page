import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { reportUser } from "@/lib/repository";
import { reportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Choose a reason." },
      { status: 400 },
    );
  }

  const result = await reportUser({
    reporterId: user.id,
    reportedId: parsed.data.reportedId,
    category: parsed.data.category,
    details: parsed.data.details,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
