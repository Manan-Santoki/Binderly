import { NextResponse } from "next/server";
import { z } from "zod";

import { createSharedDoc } from "@/lib/db";
import { isThemeKey } from "@/lib/themes";

const PayloadSchema = z.object({
  markdown: z.string().min(1, "Markdown content cannot be empty").max(500_000),
  theme: z.string(),
  customCss: z.string().optional().nullable(),
  metadata: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
    })
    .optional(),
  roundedCorners: z.boolean().optional().default(false),
  showToc: z.boolean().optional().default(true),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = PayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { markdown, theme, customCss, metadata, roundedCorners, showToc } = parsed.data;
  const resolvedTheme = isThemeKey(theme) ? theme : "serif";

  try {
    const id = await createSharedDoc({
      markdown,
      theme: resolvedTheme,
      customCss: customCss ?? null,
      metadataTitle: metadata?.title ?? null,
      metadataAuthor: metadata?.author ?? null,
      roundedCorners,
      showToc,
    });
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to create share", error);
    const raw = error instanceof Error ? error.message : String(error);
    // Map common operational failures to actionable messages.
    let hint = "Failed to create share link.";
    if (/DATABASE_URL is not set/i.test(raw)) {
      hint =
        "DATABASE_URL is not set on the server. Add it to .env.local (or your deployment env) and restart.";
    } else if (/relation .* does not exist|"shared_documents"/i.test(raw)) {
      hint =
        "Database is reachable but the shared_documents table is missing. Run `pnpm db:migrate`.";
    } else if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(raw)) {
      hint =
        "Could not connect to Postgres. Check that DATABASE_URL points to a reachable server.";
    } else if (/ssl|tls/i.test(raw)) {
      hint =
        "Postgres SSL handshake failed. Try setting DATABASE_SSL=false (self-hosted without SSL) or DATABASE_SSL=require (managed providers).";
    } else if (/password authentication|role .* does not exist/i.test(raw)) {
      hint =
        "Postgres auth failed. Double-check the user/password in DATABASE_URL.";
    }
    return NextResponse.json(
      { error: hint, detail: raw },
      { status: 500 },
    );
  }
}
