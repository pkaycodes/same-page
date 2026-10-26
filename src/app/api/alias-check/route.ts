import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkAlias } from "@/lib/repository";

export async function GET(request: Request) {
  const user = await getSessionUser();
  const url = new URL(request.url);
  const alias = url.searchParams.get("alias")?.trim() ?? "";

  if (!/^[A-Za-z0-9_]{3,20}$/.test(alias)) {
    return NextResponse.json({
      available: false,
      message: "Use 3–20 letters, numbers or underscores.",
    });
  }
  if (!user) {
    return NextResponse.json({ available: false, message: "Sign in first." }, { status: 401 });
  }

  const available = await checkAlias(alias, user.id);
  return NextResponse.json({
    available,
    message: available ? "Available" : "That alias is already taken.",
  });
}
