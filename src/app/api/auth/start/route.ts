import { NextResponse } from "next/server";
import { normalizePhone, startOtp } from "@/lib/auth";
import { phoneSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = phoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Use a Ghana mobile number, for example 024 123 4567." },
      { status: 400 },
    );
  }

  const result = await startOtp(phone);
  return NextResponse.json({
    ok: true,
    phone,
    devCode: result.code,
    expiresAt: result.expiresAt,
  });
}
