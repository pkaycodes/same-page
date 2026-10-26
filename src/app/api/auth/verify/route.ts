import { NextResponse } from "next/server";
import { createSession, normalizePhone, verifyOtp } from "@/lib/auth";
import { verifySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "That phone number is not valid." }, { status: 400 });
  }

  const result = await verifyOtp(phone, parsed.data.code);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createSession(result.user.id);
  return NextResponse.json({
    ok: true,
    redirectTo: result.user.onboarding_complete === 1 ? "/discover" : "/onboarding",
  });
}
