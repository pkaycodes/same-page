import { describe, expect, it } from "vitest";
import { ensureDb, query } from "./db";

describe("PostgreSQL app database", () => {
  it("initializes the schema and seeds the demo profiles", async () => {
    await ensureDb();
    const users = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM users");
    expect(users.rows[0].count).toBeGreaterThanOrEqual(15);

    const demo = await query<{ alias: string }>(
      "SELECT alias FROM users WHERE id = 'usr_ama'",
    );
    expect(demo.rows[0]?.alias).toBe("Ama_K");
  });
});
