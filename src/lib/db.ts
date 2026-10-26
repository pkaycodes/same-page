import { Pool, types, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema";
import { seedDatabase } from "./seed";

const globalForDb = globalThis as unknown as {
  __samePagePool?: Pool;
  __samePageInit?: Promise<void>;
};

types.setTypeParser(1184, (value) => new Date(value).toISOString());
types.setTypeParser(1114, (value) => new Date(`${value}Z`).toISOString());

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({ connectionString, max: 10 });
  }

  return new Pool({
    host: process.env.PGHOST || "/tmp",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "stackzz",
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || "samepage_dev",
    max: 10,
  });
}

export function getPool() {
  if (!globalForDb.__samePagePool) {
    globalForDb.__samePagePool = createPool();
  }
  return globalForDb.__samePagePool;
}

export function ensureDb() {
  if (!globalForDb.__samePageInit) {
    globalForDb.__samePageInit = (async () => {
      const client = await getPool().connect();
      try {
        await client.query(SCHEMA_SQL);
        const seed =
          process.env.SEED_DEMO_DATA === "true" ||
          (process.env.SEED_DEMO_DATA !== "false" && process.env.NODE_ENV !== "production");
        if (seed) await seedDatabase(client);
      } finally {
        client.release();
      }
    })();
  }
  return globalForDb.__samePageInit;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  await ensureDb();
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  await ensureDb();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
