type ThemeDefinition = {
  label: string;
  description: string;
  css: string;
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
  github: {
    label: "GitHub README",
    description: "Primer-inspired Markdown styling that matches GitHub's rendered docs.",
    vars: `
.md-theme {
  --md-bg: #ffffff;
  --md-text: #1f2328;
  --md-heading: #1f2328;
  --md-muted: #656d76;
  --md-border: #d0d7de;
  --md-code-bg: #eff2f5;
  --md-code-text: #1f2328;
  --md-link: #0969da;
  --md-blockquote-bg: transparent;
  --md-blockquote-border: #d0d7de;
  --md-font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --md-letter-spacing: 0;
  font-size: 16px;
  line-height: 1.5;
  padding: 32px 40px;
  border-radius: 6px;
  box-shadow: none;
}

.md-theme h1,
.md-theme h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--md-border);
}

.md-theme h1 {
  margin: 0 0 16px;
  font-size: 2em;
}

.md-theme h2 {
  font-size: 1.5em;
}

.md-theme h3 {
  font-size: 1.25em;
}

.md-theme h4 {
  font-size: 1em;
}

.md-theme h5 {
  font-size: 0.875em;
}

.md-theme h6 {
  font-size: 0.85em;
  color: var(--md-muted);
  letter-spacing: 0;
  text-transform: none;
}

.md-theme p,
.md-theme ul,
.md-theme ol,
.md-theme blockquote,
.md-theme table,
.md-theme pre {
  margin-top: 0;
  margin-bottom: 16px;
}

.md-theme ul,
.md-theme ol {
  margin-left: 0;
  padding-left: 2em;
}

.md-theme li + li {
  margin-top: 0.25em;
}

.md-theme blockquote {
  margin-left: 0;
  padding: 0 1em;
  border-left: 0.25em solid var(--md-blockquote-border);
  border-radius: 0;
  color: var(--md-muted);
  font-style: normal;
}

.md-theme code {
  border-radius: 6px;
  padding: 0.2em 0.4em;
  font-size: 85%;
}

.md-theme pre {
  border-radius: 6px;
  padding: 16px;
  font-size: 85%;
  line-height: 1.45;
}

.md-theme pre code {
  font-size: 100%;
}

.md-theme table {
  display: table;
  width: 100%;
  overflow: visible;
  border: 0;
  border-radius: 0;
}

.md-theme thead {
  background: transparent;
}

.md-theme tr {
  background: var(--md-bg);
  border-top: 1px solid var(--md-border);
}

.md-theme tr:nth-child(2n) {
  background: #f6f8fa;
}

.md-theme th,
.md-theme td {
  padding: 6px 13px;
}

.md-theme hr {
  height: 0.25em;
  margin: 24px 0;
  background: var(--md-border);
  border: 0;
}

.md-theme a {
  font-weight: 500;
}

.md-theme img,
.md-theme video {
  border-radius: 6px;
}
`,
  },
  serif: {
    label: "Editorial Serif",
    description: "Magazine-inspired layout with warm neutrals for long-form reading.",
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

export type ThemeKey = keyof typeof themeTokens;

export const themes: Record<ThemeKey, ThemeDefinition> = Object.fromEntries(
  Object.entries(themeTokens).map(([key, value]) => [
    key,
    {
      label: value.label,
      description: value.description,
      css: `${sharedCss}\n${value.vars}`,
    },
  ]),
) as Record<ThemeKey, ThemeDefinition>;

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

export function getHighlightThemeForDocumentTheme(themeKey: ThemeKey): "github-light" | "github-dark" {
  // Midnight theme has dark background, use dark syntax highlighting
  if (themeKey === "midnight") {
    return "github-dark";
  }
  // All light themes, including GitHub, use the light syntax highlighting palette
  return "github-light";
}

export function buildThemeCssForPdf(key: ThemeKey, customCss?: string) {
  // Build PDF-specific CSS without container styles (padding, border, max-width, margin)
  const sharedCssForPdf = `
@page {
  margin: 22mm;
}

:where(body, body *) {
  box-sizing: border-box;
}

body {
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
  margin: 0;
  padding: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  line-height: 1.25;
  margin: 1.6em 0 0.6em;
  font-weight: 600;
  color: var(--md-heading);
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-size: 1.55rem;
}

h4 {
  font-size: 1.25rem;
}

h5 {
  font-size: 1.1rem;
}

h6 {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

p {
  margin: 0 0 1.1em;
}

ul,
ol {
  margin: 0 0 1.25em 1.25em;
  padding: 0;
}

li + li {
  margin-top: 0.35em;
}

blockquote {
  background: var(--md-blockquote-bg);
  border-left: 3px solid var(--md-blockquote-border);
  margin: 1.5em 0;
  padding: 1.2em 1.5em;
  border-radius: 0 18px 18px 0;
  color: var(--md-muted);
  font-style: italic;
}

code {
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace;
  background: var(--md-code-bg);
  color: var(--md-code-text);
  border-radius: 6px;
  padding: 0.15em 0.35em;
  font-size: 0.9em;
}

pre {
  background: var(--md-code-bg);
  border-radius: 18px;
  padding: 1.25em 1.5em;
  overflow-x: auto;
  font-size: 0.95em;
  border: 1px solid var(--md-border);
}

pre code {
  padding: 0;
  background: transparent;
  color: inherit;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border: 1px solid var(--md-border);
  border-radius: 16px;
  overflow: hidden;
}

th,
td {
  border: 1px solid var(--md-border);
  padding: 0.9em 1em;
  text-align: left;
}

thead {
  background: color-mix(in srgb, var(--md-border) 25%, transparent);
  font-weight: 600;
}

img,
video {
  max-width: 100%;
  border-radius: 18px;
  margin: 1.25em 0;
}

hr {
  border: none;
  border-top: 1px solid var(--md-border);
  margin: 2.5em 0;
}

a {
  color: var(--md-link);
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}

.callout {
  border-radius: 18px;
  border: 1px solid var(--md-border);
  padding: 1.1em 1.25em;
  background: color-mix(in srgb, var(--md-border) 20%, transparent);
  margin: 1.5em 0;
}
`;

  const themeVars = themeTokens[key].vars.replaceAll(".md-theme", "body");

  return [sharedCssForPdf, themeVars, customCss?.trim()].filter(Boolean).join("\n\n");
}
