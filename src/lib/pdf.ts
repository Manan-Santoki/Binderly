// src/lib/pdf.ts
import fs from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";
import { marked } from "marked";
import markedAlert from "marked-alert";
import puppeteer from "puppeteer";

import type { ThemeKey } from "@/lib/themes";
import {
  buildThemeCss,
  getHighlightThemeForDocumentTheme,
  getMermaidThemeForDocumentTheme,
  getWrapperClass,
} from "@/lib/themes";
import { alertCss } from "./alert-css";
import { loadHljsCss } from "./highlightCss";
import { markdownBaseCss } from "./markdown-base.css";

const DEFAULT_TITLE = "Binderly";

export type RenderMarkdownToPdfOptions = {
  markdown: string;
  theme: ThemeKey;
  customCss?: string;
  metadata?: {
    title?: string;
    author?: string;
  };
  roundedCorners?: boolean;
  showToc?: boolean;
};

// Resolve mermaid's UMD bundle from disk at runtime. We use process.cwd() rather than
// import.meta.url / createRequire because Next.js bundles this file into .next/server/...
// and rewrites import.meta.url, which previously caused EBADF on production builds.
let mermaidScriptPathCache: string | null | undefined;

function findMermaidScriptPath(): string | null {
  if (mermaidScriptPathCache !== undefined) return mermaidScriptPathCache;
  const candidates = [
    path.join(process.cwd(), "node_modules", "mermaid", "dist", "mermaid.min.js"),
    path.join(process.cwd(), "..", "node_modules", "mermaid", "dist", "mermaid.min.js"),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) {
        mermaidScriptPathCache = candidate;
        return candidate;
      }
    } catch {
      // not found at this path, try next
    }
  }
  mermaidScriptPathCache = null;
  return null;
}

// Whether the current render targets a Primer (`.markdown-body`) theme.
// Read by the marked code renderer to decide whether to emit our custom
// language-label/copy wrapper or stay native (matching GitHub's own rendering).
let currentRenderIsPrimer = false;

let markedConfigured = false;

function configureMarkedOnce() {
  if (markedConfigured) return;

  marked.setOptions({ breaks: true, gfm: true });
  marked.use(markedAlert());
  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = (lang ?? "").trim();
        if (language === "mermaid") {
          // Use a <pre class="mermaid"> so mermaid.run() can find it.
          return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
        }
        const escaped = escapeHtml(text);
        const langClass = language ? ` class="language-${language}"` : "";
        if (currentRenderIsPrimer) {
          // Match GitHub: native <pre><code> with no header chrome.
          return `<pre><code${langClass}>${escaped}</code></pre>\n`;
        }
        const langLabel = language || "text";
        return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-lang">${escapeHtml(langLabel)}</span></div><pre class="code-block-pre"><code${langClass}>${escaped}</code></pre></div>\n`;
      },
    },
  });

  markedConfigured = true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addHeadingIds(html: string): {
  html: string;
  toc: Array<{ level: number; text: string; slug: string }>;
} {
  const slugger = new GithubSlugger();
  const toc: Array<{ level: number; text: string; slug: string }> = [];

  const updated = html.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (_match, levelStr: string, inner: string) => {
      const level = Number(levelStr);
      const textOnly = inner.replace(/<[^>]+>/g, "").trim();
      if (!textOnly) return _match;
      const slug = slugger.slug(textOnly);
      toc.push({ level, text: textOnly, slug });
      return `<h${level} id="${slug}">${inner}</h${level}>`;
    },
  );

  return { html: updated, toc };
}

function buildTocHtml(
  toc: Array<{ level: number; text: string; slug: string }>,
): string {
  if (toc.length === 0) return "";
  const items = toc
    .map(
      (h) =>
        `<li style="padding-left:${(h.level - 1) * 14}px"><a href="#${h.slug}">${escapeHtml(h.text)}</a></li>`,
    )
    .join("");
  return `<nav class="pdf-toc" aria-label="Table of contents"><h2>Table of contents</h2><ul>${items}</ul></nav>`;
}

const pdfTocCss = `
.pdf-toc {
  margin: 0 0 32px;
  padding: 16px 20px;
  border: 1px solid var(--md-border, #d0d7de);
  border-radius: 6px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pdf-toc h2 {
  margin: 0 0 8px !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--md-muted, #656d76);
}
.pdf-toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.pdf-toc li { margin: 2px 0; }
.pdf-toc a { text-decoration: none; }
`;

const pdfCodeBlockCss = `
.code-block-wrapper {
  margin: 12px 0;
  border: 1px solid var(--md-border, #d0d7de);
  border-radius: 6px;
  overflow: hidden;
  break-inside: avoid;
  page-break-inside: avoid;
}
.code-block-header {
  padding: 6px 12px;
  border-bottom: 1px solid var(--md-border, #d0d7de);
  background: rgba(0, 0, 0, 0.04);
  font-size: 12px;
  line-height: 1;
}
.code-block-lang {
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--md-muted, #656d76);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
}
.code-block-pre {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 12px 16px !important;
  overflow-x: auto;
}
`;

const pdfPageBreakCss = `
.code-block-wrapper, pre, table, .markdown-alert, .mermaid, .mermaid-diagram, figure, img {
  break-inside: avoid;
  page-break-inside: avoid;
}
h1, h2, h3 {
  break-after: avoid;
  page-break-after: avoid;
}
.mermaid svg, .mermaid-diagram svg {
  max-width: 100%;
  height: auto;
}
`;

export async function renderMarkdownToPdf({
  markdown,
  theme,
  customCss,
  metadata,
  roundedCorners = false,
  showToc = true,
}: RenderMarkdownToPdfOptions): Promise<Buffer> {
  configureMarkedOnce();

  const wrapper = getWrapperClass(theme);
  const isPrimer = wrapper === "markdown-body";

  // Tell the (global) marked code renderer which mode to emit for this parse.
  currentRenderIsPrimer = isPrimer;
  const rawHtml = await marked.parse(markdown);
  const { html: htmlWithIds, toc } = addHeadingIds(String(rawHtml));
  const tocHtml = showToc ? buildTocHtml(toc) : "";
  const htmlContent = `${tocHtml}${htmlWithIds}`;

  const highlightTheme = getHighlightThemeForDocumentTheme(theme);
  const hljsCss = await loadHljsCss(highlightTheme);
  const themeCss = buildThemeCss(theme, customCss);

  // Layout overrides per mode (rounded card vs full page),
  // adapted for the active wrapper class.
  const wrapperSelector = `.${wrapper}`;
  const pdfOverrides = roundedCorners
    ? `
      @page { margin: 0; }
      body {
        margin: 0;
        padding: 15mm;
        background-color: ${isPrimer ? "transparent" : "white"};
        min-height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      ${wrapperSelector} {
        margin: 0 auto !important;
        width: 100%;
        max-width: 768px !important;
        border: 1px solid var(--md-border, #d0d7de) !important;
        border-radius: 24px !important;
      }
      ${wrapperSelector} table tr {
        background-color: transparent !important;
      }
    `
    : `
      @page { margin: 0; }
      body { margin: 0; padding: 0; }
      ${wrapperSelector} {
        max-width: none !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 20mm 16mm 22mm 16mm !important;
        width: 100% !important;
        min-height: 100vh;
        box-sizing: border-box;
      }
      ${wrapperSelector} table tr {
        background-color: transparent !important;
      }
    `;

  // Primer themes ship comprehensive CSS — skip markdown-base.css to avoid global-selector conflicts.
  const cssChunks = isPrimer
    ? [
        hljsCss,
        themeCss,
        alertCss,
        pdfTocCss,
        pdfCodeBlockCss,
        pdfPageBreakCss,
        pdfOverrides,
      ]
    : [
        markdownBaseCss,
        hljsCss,
        themeCss,
        alertCss,
        pdfTocCss,
        pdfCodeBlockCss,
        pdfPageBreakCss,
        pdfOverrides,
      ];

  const combinedCss = cssChunks.join("\n");

  const usesMermaid = /```mermaid/.test(markdown);
  const mermaidPath = usesMermaid ? findMermaidScriptPath() : null;
  if (usesMermaid && !mermaidPath) {
    console.warn(
      "[pdf] Markdown contains mermaid blocks but mermaid.min.js was not found at <cwd>/node_modules/mermaid/dist/mermaid.min.js — diagrams will render as raw text.",
    );
  }

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(metadata?.title ?? DEFAULT_TITLE)}</title>
    <style>${combinedCss}</style>
  </head>
  <body>
    <div class="${wrapper}">
      ${htmlContent}
    </div>
  </body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    if (usesMermaid && mermaidPath) {
      // Inject mermaid via Puppeteer's addScriptTag — this avoids reading and
      // inlining the (~3MB) UMD ourselves, and avoids Next bundler issues with
      // import.meta.url / createRequire that previously caused EBADF in prod.
      await page.addScriptTag({ path: mermaidPath });
      const mermaidTheme = getMermaidThemeForDocumentTheme(theme);
      await page.evaluate(async (themeName: string) => {
        const m = (
          window as unknown as {
            mermaid: {
              initialize: (opts: unknown) => void;
              run: (opts?: unknown) => Promise<void>;
            };
          }
        ).mermaid;
        m.initialize({
          startOnLoad: false,
          theme: themeName,
          securityLevel: "loose",
        });
        await m.run({ querySelector: "pre.mermaid" });
      }, mermaidTheme);
      // Give layout one tick so SVGs settle before printing.
      await page.evaluate(
        () => new Promise<void>((r) => requestAnimationFrame(() => r())),
      );
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="font-size:9px; width:100%; text-align:center; color:#888; padding:0 12mm;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
      margin: {
        top: 0,
        right: 0,
        bottom: 14,
        left: 0,
      },
    });

    await page.close();
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
