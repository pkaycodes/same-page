import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import {
  findOrCreateUserByPhone,
  getUserById,
  getUserByPhone,
  toSessionUser,
  updateLastActive,
} from "./repository";
import type { SessionUser, UserRow } from "./types";
import { DEMO_ACCOUNTS } from "./seed";

const SESSION_COOKIE = "sp_session";
const SESSION_DAYS = 30;
const OTP_MINUTES = 10;

function authSecret() {
  if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production.");
  }
  return process.env.AUTH_SECRET || "same-page-local-development-secret-change-me";
}

function hashCode(phone: string, code: string) {
  return createHmac("sha256", authSecret()).update(`${phone}:${code}`).digest("hex");
}

function hashToken(token: string) {
  return createHash("sha256").update(`${authSecret()}:${token}`).digest("hex");
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return null;
}

export function otpDevMode() {
  if (process.env.OTP_DEV_MODE === "true") return true;
  if (process.env.OTP_DEV_MODE === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function demoMode() {
  if (process.env.DEMO_MODE === "false") return false;
  if (process.env.DEMO_MODE === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function startOtp(phone: string) {
  const now = new Date();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expiresAt = new Date(now.getTime() + OTP_MINUTES * 60 * 1000);

  await query("DELETE FROM otp_codes WHERE phone = $1 AND consumed_at IS NULL", [phone]);
  await query(
    `INSERT INTO otp_codes (id, phone, code_hash, expires_at, attempts, created_at)
     VALUES ($1, $2, $3, $4, 0, $5)`,
    [
      `otp_${randomBytes(12).toString("hex")}`,
      phone,
      hashCode(phone, code),
      expiresAt.toISOString(),
      now.toISOString(),
    ],
  );

  if (otpDevMode()) {
    console.info(`[SAME PAGE] Development OTP for ${phone}: ${code}`);
  }

  return {
    code: otpDevMode() ? code : null,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyOtp(phone: string, code: string) {
  const result = await query<{
    id: string;
    phone: string;
    code_hash: string;
    expires_at: string;
    attempts: number;
  }>(
    `SELECT * FROM otp_codes
     WHERE phone = $1 AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [phone],
  );
  const row = result.rows[0];

  if (!row) return { error: "Request a new code." } as const;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { error: "That code has expired. Request a new one." } as const;
  }
  if (row.attempts >= 5) {
    return { error: "Too many attempts. Request a new code." } as const;
  }

  const expected = Buffer.from(row.code_hash, "hex");
  const received = Buffer.from(hashCode(phone, code.trim()), "hex");
  const matches = expected.length === received.length && timingSafeEqual(expected, received);

  if (!matches) {
    await query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [row.id]);
    return { error: "That code is not correct." } as const;
  }

  const timestamp = new Date().toISOString();
  await query("UPDATE otp_codes SET consumed_at = $1 WHERE id = $2", [timestamp, row.id]);
  const user = await findOrCreateUserByPhone(phone);
  return { user } as const;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query(
    "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)",
    [hashToken(token), userId, now.toISOString(), expiresAt.toISOString()],
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await query<UserRow>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > $2`,
    [hashToken(token), new Date().toISOString()],
  );
  const row = result.rows[0];
  if (!row) return null;
  await updateLastActive(row.id);
  return toSessionUser(row);
}

export async function requireUser(nextPath = "/discover") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/join?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireOnboardedUser(nextPath = "/discover") {
  const user = await requireUser(nextPath);
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }
  return user;
}

export async function createDemoSession(kind: "ama" | "kwame" = "ama") {
  if (!demoMode()) return { error: "Demo mode is disabled." } as const;
  const userId = kind === "kwame" ? DEMO_ACCOUNTS.kwame : DEMO_ACCOUNTS.ama;
  const user = await getUserById(userId);
  if (!user) return { error: "Demo account is not available." } as const;
  await createSession(user.id);
  return { user } as const;
}

export async function demoPhoneFor(kind: "ama" | "kwame" = "ama") {
  const user = await getUserById(kind === "kwame" ? DEMO_ACCOUNTS.kwame : DEMO_ACCOUNTS.ama);
  return user?.phone ?? null;
}

export async function findUserByPhoneForDev(phone: string) {
  return getUserByPhone(phone);
}
