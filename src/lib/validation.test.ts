import { describe, expect, it } from "vitest";
import {
  messageSchema,
  phoneSchema,
  requestSchema,
  settingsSchema,
  verifySchema,
} from "./validation";

describe("input validation", () => {
  it("accepts a phone number and rejects a blank one", () => {
    expect(phoneSchema.safeParse({ phone: "+233 20 000 0000" }).success).toBe(true);
    expect(phoneSchema.safeParse({ phone: "  " }).success).toBe(false);
  });

  it("requires a six-digit verification code", () => {
    expect(verifySchema.safeParse({ phone: "+233200000000", code: "123456" }).success).toBe(true);
    expect(verifySchema.safeParse({ phone: "+233200000000", code: "12345" }).success).toBe(false);
    expect(verifySchema.safeParse({ phone: "+233200000000", code: "abcdef" }).success).toBe(false);
  });

  it("rejects an empty request note and accepts a considered one", () => {
    expect(requestSchema.safeParse({ receiverId: "usr_kwame", note: " " }).success).toBe(false);
    expect(
      requestSchema.safeParse({
        receiverId: "usr_kwame",
        note: "Your answer about a slow pace stood out. Would you like to talk?",
      }).success,
    ).toBe(true);
  });

  it("allows messages up to 2000 characters and no empty messages", () => {
    expect(messageSchema.safeParse({ body: "Hello there." }).success).toBe(true);
    expect(messageSchema.safeParse({ body: "" }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "x".repeat(2001) }).success).toBe(false);
  });

  it("validates privacy and pause settings", () => {
    const valid = {
      allowRequests: "compatible_only",
      showAge: true,
      showLocation: false,
      showIntentions: true,
      aiTextMatching: false,
      isPaused: false,
    };
    expect(settingsSchema.safeParse(valid).success).toBe(true);
    expect(settingsSchema.safeParse({ ...valid, allowRequests: "nobody" }).success).toBe(false);
  });
});
