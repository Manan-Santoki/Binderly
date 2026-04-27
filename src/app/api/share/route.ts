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
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 },
    );
  }
}
