import { NextResponse } from "next/server";
import { z } from "zod";

import { renderMarkdownToPdf } from "@/lib/pdf";
import { isThemeKey } from "@/lib/themes";

const PayloadSchema = z.object({
  markdown: z.string().min(1, "Markdown content cannot be empty"),
  theme: z.string().optional(),
  customCss: z.string().optional().default(""),
  fileName: z.string().optional(),
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
      {
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const {
    markdown,
    customCss,
    theme,
    fileName,
    metadata,
    roundedCorners,
    showToc,
  } = parsed.data;
  const resolvedTheme = isThemeKey(theme) ? theme : "serif";

  try {
    const pdfBuffer = await renderMarkdownToPdf({
      markdown,
      theme: resolvedTheme,
      customCss,
      metadata,
      roundedCorners,
      showToc,
    });

    const suggestedName = `${fileName?.trim() || "markdown-document"}.pdf`;

    const pdfBytes = new Uint8Array(pdfBuffer);

    const pdfBlob = new Blob([pdfBytes.buffer], { type: "application/pdf" });

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${suggestedName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to render PDF", error);

    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
