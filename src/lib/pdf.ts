// src/lib/pdf.ts
import type { ThemeKey } from "@/lib/themes";
import { buildThemeCss, getHighlightThemeForDocumentTheme } from "@/lib/themes";
import { loadHljsCss } from "./highlightCss";
import { markdownBaseCss } from "./markdown-base.css";
import { marked } from "marked";
import puppeteer from "puppeteer";
import hljs from "highlight.js";

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
};

/**
 * Render markdown to PDF using Puppeteer directly.
 * This bypasses md-to-pdf to avoid its hardcoded highlight.js path resolution issues.
 */
export async function renderMarkdownToPdf({
  markdown,
  theme,
  customCss,
  metadata,
  roundedCorners = false,
}: RenderMarkdownToPdfOptions): Promise<Buffer> {
  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown);

  // Load all CSS inline - use appropriate syntax highlighting theme for document theme
  const highlightTheme = getHighlightThemeForDocumentTheme(theme);
  const hljsCss = await loadHljsCss(highlightTheme);
  const themeCss = buildThemeCss(theme, customCss);

  // PDF-specific overrides
  let pdfOverrides;

  if (roundedCorners) {
    // Card style: Keep borders, radius, max-width. Center on page.
    pdfOverrides = `
      @page {
        margin: 0;
      }
      body {
        margin: 0;
        padding: 15mm; /* Slightly reduced page padding to give more space for the card */
        background-color: white; /* Paper color */
        min-height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .md-theme {
        margin: 0 auto !important;
        width: 100%;
        max-width: 768px; /* Ensure max-width is respected */
        border: 1px solid var(--md-border) !important; /* Force border */
        border-radius: 24px !important; /* Force rounded corners */
        /* Ensure background is set */
        background-color: var(--md-bg) !important;
      }
      /* Override markdown-base.css table styles that force white background */
      .md-theme table tr {
        background-color: transparent !important;
      }
    `;
  } else {
    // Full page style: Remove borders, radius, max-width. Fill page.
    pdfOverrides = `
      @page {
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .md-theme {
        max-width: none !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 20mm 16mm 22mm 16mm !important;
        width: 100% !important;
        min-height: 100vh;
        box-sizing: border-box;
      }
      /* Override markdown-base.css table styles that force white background */
      .md-theme table tr {
        background-color: transparent !important;
      }
    `;
  }

  const combinedCss = [markdownBaseCss, hljsCss, themeCss, pdfOverrides].join("\n");

  // Build complete HTML document
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${metadata?.title ?? DEFAULT_TITLE}</title>
    <style>${combinedCss}</style>
  </head>
  <body>
    <div class="md-theme">
      ${htmlContent}
    </div>
  </body>
</html>`;

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set content directly
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    await page.close();

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
