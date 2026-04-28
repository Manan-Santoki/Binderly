// Single source of truth for hosted-mode SEO behavior.
//
// Set NEXT_PUBLIC_SITE_URL on your hosted deployment to enable indexing,
// canonical URLs, sitemap entries, and JSON-LD with the canonical host.
// Self-hosted forks leave it unset and stay noindex by default.

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL: string | null =
  RAW_SITE_URL && /^https?:\/\//i.test(RAW_SITE_URL)
    ? RAW_SITE_URL.replace(/\/$/, "")
    : null;

export const SEO_ENABLED = SITE_URL !== null;

export const SITE_NAME = "Binderly";

export const SEO_TITLE =
  "Binderly — Free Markdown to PDF Converter (Mermaid, GitHub Themes)";

export const SEO_DESCRIPTION =
  "Free, open-source Markdown to PDF converter. Live preview with GitHub-accurate light and dark themes, Mermaid diagrams, GFM alerts, automatic table of contents, and page-perfect PDF export. No size caps, no watermarks.";

export const SEO_KEYWORDS = [
  "markdown to pdf",
  "markdown to pdf converter",
  "free markdown to pdf",
  "open source markdown to pdf",
  "markdown editor",
  "markdown preview",
  "github markdown to pdf",
  "mermaid to pdf",
  "convert markdown to pdf online",
  "md to pdf",
  "markdown pdf no watermark",
  "markdown share link",
  "share markdown online",
];
