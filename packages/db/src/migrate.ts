import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Standalone migration runner. Bypasses the `drizzle-kit migrate` CLI,
// which has a known hang-with-no-error bug on 0.31.x
// (https://github.com/drizzle-team/drizzle-orm/issues/4451).
// Run with: bun run src/migrate.ts

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log("Running migrations...");
  const start = Date.now();

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log(`Migrations applied in ${Date.now() - start}ms`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:");
  console.error(err);
  process.exit(1);
});
