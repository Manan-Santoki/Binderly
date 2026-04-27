import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

// Load .env.local / .env from the project root if present, so this script
// matches the env Next.js loads for `next dev` / `next start`.
function loadDotenv(file: string) {
  const full = path.resolve(process.cwd(), file);
  if (!existsSync(full)) return;
  const text = readFileSync(full, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotenv(".env.local");
loadDotenv(".env");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Provide it via .env.local, a shell export, or a one-shot prefix:\n" +
        "  DATABASE_URL=postgres://user:pass@host:5432/db pnpm db:migrate",
    );
    process.exit(1);
  }

  const ssl =
    process.env.DATABASE_SSL === "false"
      ? false
      : process.env.DATABASE_SSL === "require"
        ? "require"
        : "prefer";
  const sql = postgres(url, { max: 1, ssl });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        name        text PRIMARY KEY,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )
    `;

    const dir = path.resolve(process.cwd(), "migrations");
    const files = (await readdir(dir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    const applied = new Set(
      (await sql<{ name: string }[]>`SELECT name FROM _migrations`).map((r) => r.name),
    );

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`✓ ${file} (already applied)`);
        continue;
      }
      const body = await readFile(path.join(dir, file), "utf8");
      console.log(`→ ${file} ...`);
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`INSERT INTO _migrations (name) VALUES (${file})`;
      });
      console.log(`✓ ${file}`);
      ran += 1;
    }

    console.log(ran === 0 ? "Already up to date." : `Applied ${ran} migration(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
