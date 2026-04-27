import { githubMarkdownDarkCss } from "./github-markdown-themes/dark";
import { githubMarkdownLightCss } from "./github-markdown-themes/light";

export type ThemeWrapper = "md-theme" | "markdown-body";

type ThemeDefinition = {
  label: string;
  description: string;
  css: string;
  wrapper: ThemeWrapper;
};

const sharedCss = `
@page {
  margin: 22mm;
}

:where(.md-theme, .md-theme *) {
  box-sizing: border-box;
}

.md-theme {
  --md-bg: white;
  --md-text: #111827;
  --md-heading: #0f172a;
  --md-muted: #475569;
  --md-border: #e2e8f0;
  --md-code-bg: #0f172a0d;
  --md-code-text: #0f172a;
  --md-link: #2563eb;
  --md-blockquote-bg: #f1f5f9;
  --md-blockquote-border: #cbd5f5;
  --md-font-stack: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  --md-letter-spacing: 0.01em;
  --md-accent: #059669;

  background: var(--md-bg);
  color: var(--md-text);
  font-family: var(--md-font-stack);
  font-size: 16px;
  line-height: 1.7;
  letter-spacing: var(--md-letter-spacing);
  padding: 32px;
  border-radius: 24px;
  border: 1px solid var(--md-border);
  max-width: 768px;
  margin: 0 auto;
}

.md-theme h1,
.md-theme h2,
.md-theme h3,
.md-theme h4,
.md-theme h5,
.md-theme h6 {
  line-height: 1.25;
  margin: 1.6em 0 0.6em;
  font-weight: 600;
  color: var(--md-heading);
}

.md-theme h1 {
  font-size: 2.5rem;
}

.md-theme h2 {
  font-size: 2rem;
}

.md-theme h3 {
  font-size: 1.55rem;
}

.md-theme h4 {
  font-size: 1.25rem;
}

.md-theme h5 {
  font-size: 1.1rem;
}

.md-theme h6 {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.md-theme p {
  margin: 0 0 1em;
}

.md-theme p + blockquote,
.md-theme p + pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.md-theme ul,
.md-theme ol {
  margin: 0 0 1.25em 1.25em;
  padding: 0;
}

.md-theme li + li {
  margin-top: 0.35em;
}

.md-theme blockquote {
  background: var(--md-blockquote-bg);
  border-left: 3px solid var(--md-blockquote-border);
  margin: 2em 0 1.5em 0;
  padding: 1.2em 1.5em;
  border-radius: 0 18px 18px 0;
  color: var(--md-muted);
  font-style: italic;
}

.md-theme code {
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace;
  background: var(--md-code-bg);
  color: var(--md-code-text);
  border-radius: 6px;
  padding: 0.15em 0.35em;
  font-size: 0.9em;
}

.md-theme pre {
  background: var(--md-code-bg);
  border-radius: 18px;
  padding: 1.25em 1.5em;
  overflow-x: auto;
  font-size: 0.95em;
  border: 1px solid var(--md-border);
}

.md-theme pre code {
  padding: 0;
  background: transparent;
  color: inherit;
}

.md-theme table {
  width: max-content;
  max-width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border: 1px solid var(--md-border);
  border-radius: 16px;
  display: block;
  overflow-x: auto;
}

.md-theme th,
.md-theme td {
  border: 1px solid var(--md-border);
  padding: 0.9em 1em;
  text-align: left;
}

.md-theme thead {
  background: color-mix(in srgb, var(--md-border) 25%, transparent);
  font-weight: 600;
}

.md-theme img,
.md-theme video {
  max-width: 100%;
  border-radius: 18px;
  margin: 1.25em 0;
}

.md-theme hr {
  border: none;
  border-top: 1px solid var(--md-border);
  margin: 2.5em 0;
}

.md-theme a {
  color: var(--md-link);
  text-decoration: none;
  font-weight: 600;
}

.md-theme a:hover {
  text-decoration: underline;
}

.md-theme .callout {
  border-radius: 18px;
  border: 1px solid var(--md-border);
  padding: 1.1em 1.25em;
  background: color-mix(in srgb, var(--md-border) 20%, transparent);
  margin: 1.5em 0;
}
`;

const themeTokens = {
  serif: {
    label: "Editorial Serif",
    description:
      "Magazine-inspired layout with warm neutrals for long-form reading.",
    vars: `
.md-theme {
  --md-bg: #f8f4ef;
  --md-text: #2f2014;
  --md-heading: #1c1209;
  --md-muted: #7f6653;
  --md-border: #e2d2c0;
  --md-code-bg: #f1e4d8;
  --md-code-text: #5b3211;
  --md-link: #b45309;
  --md-blockquote-bg: #f4e8dc;
  --md-blockquote-border: #d4b59a;
  --md-font-stack: 'Cormorant Garamond', 'Ibarra Real Nova', 'Times New Roman', serif;
  --md-letter-spacing: 0.015em;
}
`,
  },
  neutral: {
    label: "Modern Neutral",
    description: "Clean, airy sans-serif treatment ideal for documentation.",
    vars: `
.md-theme {
  --md-bg: #f6f7fb;
  --md-text: #101828;
  --md-heading: #0f172a;
  --md-muted: #475467;
  --md-border: #d0d5dd;
  --md-code-bg: #eef2ff;
  --md-code-text: #3730a3;
  --md-link: #2563eb;
  --md-blockquote-bg: #edf2ff;
  --md-blockquote-border: #9fc5ff;
  --md-font-stack: 'Inter', 'Space Grotesk', 'Segoe UI', sans-serif;
  --md-letter-spacing: 0.01em;
}
`,
  },
  midnight: {
    label: "Midnight Focus",
    description: "High-contrast dark mode optimized for late-night review.",
    vars: `
.md-theme {
  --md-bg: #0b1120;
  --md-text: #f8fafc;
  --md-heading: #cbd5f5;
  --md-muted: #c7d2fe;
  --md-border: #1e2a44;
  --md-code-bg: #111c30;
  --md-code-text: #e0e7ff;
  --md-link: #7dd3fc;
  --md-blockquote-bg: #0f172a;
  --md-blockquote-border: #334155;
  --md-font-stack: 'General Sans', 'Satoshi', 'Inter', 'Segoe UI', sans-serif;
  --md-letter-spacing: 0.02em;
}

.md-theme code {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
`,
  },
} as const;

// Primer-based GitHub themes use the bundled github-markdown-css stylesheet
// and target `.markdown-body` instead of `.md-theme`. We add a tiny container
// rule so the rendered block has sensible padding and a max-width.
const primerContainerCss = `
.markdown-body {
  max-width: 980px;
  margin: 0 auto;
  padding: 32px 40px;
  box-sizing: border-box;
}
`;

const primerThemeTokens = {
  "github-light": {
    label: "GitHub Light",
    description:
      "Primer stylesheet — pixel-matches GitHub's web rendering in light mode.",
    css: `${githubMarkdownLightCss}\n${primerContainerCss}`,
  },
  "github-dark": {
    label: "GitHub Dark",
    description:
      "Primer stylesheet — pixel-matches GitHub's web rendering in dark mode.",
    css: `${githubMarkdownDarkCss}\n${primerContainerCss}`,
  },
} as const;

export type ThemeKey =
  | keyof typeof themeTokens
  | keyof typeof primerThemeTokens;

const legacyThemes = Object.fromEntries(
  Object.entries(themeTokens).map(([key, value]) => [
    key,
    {
      label: value.label,
      description: value.description,
      css: `${sharedCss}\n${value.vars}`,
      wrapper: "md-theme" as const,
    },
  ]),
) as Record<keyof typeof themeTokens, ThemeDefinition>;

const primerThemes = Object.fromEntries(
  Object.entries(primerThemeTokens).map(([key, value]) => [
    key,
    {
      label: value.label,
      description: value.description,
      css: value.css,
      wrapper: "markdown-body" as const,
    },
  ]),
) as Record<keyof typeof primerThemeTokens, ThemeDefinition>;

export const themes: Record<ThemeKey, ThemeDefinition> = {
  ...legacyThemes,
  ...primerThemes,
};

export const themeOptions = (Object.keys(themes) as ThemeKey[]).map((key) => ({
  key,
  label: themes[key].label,
  description: themes[key].description,
}));

export function isThemeKey(value?: string | null): value is ThemeKey {
  if (!value) return false;
  return value in themes;
}

export function buildThemeCss(key: ThemeKey, customCss?: string) {
  return [themes[key].css, customCss?.trim()].filter(Boolean).join("\n\n");
}

export function getWrapperClass(key: ThemeKey): ThemeWrapper {
  return themes[key].wrapper;
}

export function getHighlightThemeForDocumentTheme(
  themeKey: ThemeKey,
): "github-light" | "github-dark" {
  if (themeKey === "midnight" || themeKey === "github-dark") {
    return "github-dark";
  }
  return "github-light";
}

export function getMermaidThemeForDocumentTheme(
  themeKey: ThemeKey,
): "default" | "dark" {
  return themeKey === "midnight" || themeKey === "github-dark"
    ? "dark"
    : "default";
}
