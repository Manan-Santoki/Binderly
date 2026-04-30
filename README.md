# Binderly

> Markdown rendered like GitHub. Exported like print.

An open-source Markdown workbench: live preview, page-perfect PDF export, Mermaid diagrams in the PDF, GitHub-accurate themes, and shareable view-only links. No size caps. No watermarks.

**🌐 Live demo:** https://binderly.msantoki.com/

https://github.com/user-attachments/assets/5a640eae-0e37-4b58-8ada-e71fde64d08f

## Features

- **GitHub-accurate themes** — light + dark variants powered by the official [`github-markdown-css`](https://github.com/sindresorhus/github-markdown-css) Primer stylesheet. Your rendered Markdown matches `github.com`.
- **Mermaid diagrams in the PDF** — sequence, flowchart, gantt, class, state. Rendered server-side via Puppeteer so they survive the trip into the export. Theme auto-pairs with the document theme.
- **GitHub Flavored Markdown** — alerts (`> [!NOTE]`, `[!WARNING]`, `[!CAUTION]`, etc.), footnotes, task lists, tables with column alignment.
- **Auto table of contents** + heading anchors using `github-slugger` for slug parity with GitHub itself.
- **Page-perfect PDFs** — A4, page numbers in footer, `break-inside: avoid` on code blocks, tables, alerts, and Mermaid SVGs so nothing splits awkwardly. Optional rounded-card or full-bleed mode.
- **Shareable view-only links** — click **Share**, get a public URL like `/v/<uuid>`. Backed by Postgres. Each click is an immutable snapshot.
- **Custom CSS injection** for brand-matching, plus four curated typographic themes (GitHub Light/Dark, Editorial Serif, Modern Neutral, Midnight Focus).
- **Privacy-first** — self-hosted instances ship `noindex` by default. Opt-in to indexing and analytics via env vars.
- **Self-hostable** — Next.js + Puppeteer + Postgres. MIT-licensed.

## Quick start

### Prerequisites

- Node.js 22+
- pnpm 9.15.2+
- Postgres 14+ *(only required for the share-link feature; the editor + PDF export work without it)*
- Docker *(optional, for the easiest Postgres setup)*

### Install

```bash
git clone https://github.com/Manan-Santoki/Binderly
cd Binderly
pnpm install
```

`pnpm install` downloads a Chromium binary for Puppeteer (~170 MB on first install).

### Database (only if you want the Share button)

```bash
docker run -d --name binderly-pg \
  -p 5432:5432 \
  -e POSTGRES_USER=binderly \
  -e POSTGRES_PASSWORD=devpw \
  -e POSTGRES_DB=binderly \
  postgres:16-alpine

cat > .env.local <<'EOF'
DATABASE_URL=postgres://binderly:devpw@127.0.0.1:5432/binderly
DATABASE_SSL=false
EOF

pnpm db:migrate
```

### Run

```bash
pnpm dev          # development (turbopack, hot reload)
# or
pnpm build && pnpm start   # production
```

Open http://localhost:3000.

## Configuration

All env vars are optional (except `DATABASE_URL` if you use sharing). See [`.env.example`](./.env.example) for the canonical list.

| Variable | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Share links | Postgres connection string |
| `DATABASE_SSL` | — | `false` (self-hosted), `require` (managed providers), default `prefer` |
| `NEXT_PUBLIC_SITE_URL` | SEO on hosted instance | Set to your canonical URL to enable indexing, sitemap, canonical tag, JSON-LD. **Leave unset for private/internal deploys** — the app ships `noindex` by default. |
| `NEXT_PUBLIC_ANALYTICS_SRC` | Analytics | Script URL for a privacy-friendly analytics provider (Plausible/Umami-style). Both vars must be set; otherwise zero tracking JS loads. |
| `NEXT_PUBLIC_ANALYTICS_SITE_ID` | Analytics | Site identifier passed via `data-site-id` |

`NEXT_PUBLIC_*` vars are inlined at **build time**. Changes require a rebuild, not just a restart.

## How it works

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Workbench (UI)  │────▶│  /api/pdf       │────▶│  Puppeteer   │
│  react-markdown  │     │  marked +       │     │  → A4 PDF    │
│  remark-gfm      │     │  marked-alert + │     └──────────────┘
│  remark-alert    │     │  mermaid UMD    │
│  rehype-slug     │     │  injection      │
└──────────────────┘     └─────────────────┘
        │
        │ Share button
        ▼
┌──────────────────┐     ┌─────────────────┐
│  /api/share      │────▶│  Postgres       │
│  (POST snapshot) │     │  shared_docs    │
└──────────────────┘     └─────────────────┘
        │
        │ /v/[id]  (public read-only viewer)
        ▼
┌──────────────────┐
│  SharedDocViewer │
│  (same renderer  │
│  as workbench)   │
└──────────────────┘
```

Two markdown libraries are used deliberately:

- **`react-markdown`** in the live preview — lots of plugins, runs in the browser, fast.
- **`marked`** in the PDF render path — server-friendly, easier to swap renderers, integrates cleanly with Puppeteer.

GFM alert plugins are paired across the two (`remark-github-blockquote-alert` for the preview, `marked-alert` for the PDF) so both emit the same `markdown-alert markdown-alert-{variant}` classes — one stylesheet covers both.

## Project layout

```
src/
├── app/
│   ├── api/pdf/route.ts          # POST: render markdown -> PDF
│   ├── api/share/route.ts        # POST: persist snapshot, return UUID
│   ├── v/[id]/page.tsx           # public read-only viewer
│   ├── layout.tsx                # metadata + JSON-LD
│   ├── page.tsx                  # home — workbench + SEO landing
│   ├── robots.ts                 # gated on NEXT_PUBLIC_SITE_URL
│   └── sitemap.ts                # gated on NEXT_PUBLIC_SITE_URL
├── components/
│   ├── pdf-workbench/            # editor, mermaid, code-block, toc
│   ├── shared-doc-viewer.tsx     # used by /v/[id]
│   ├── seo-landing.tsx           # SSR feature/FAQ block
│   └── ui/                       # Radix-based primitives
└── lib/
    ├── pdf.ts                    # marked + Puppeteer pipeline
    ├── themes.ts                 # theme registry + helpers
    ├── db.ts                     # Postgres queries
    ├── seo.ts                    # hosted-mode toggle + constants
    ├── github-markdown-themes/   # bundled Primer CSS
    └── highlight-themes/         # bundled highlight.js CSS
migrations/0001_shared_documents.sql
scripts/migrate.ts
```

## Customization

### Add a theme

See [`src/lib/themes.ts`](./src/lib/themes.ts). Existing themes are CSS-variable based and live in `themeTokens`. The Primer-based themes (`github-light`, `github-dark`) wrap the content in `<div class="markdown-body">`; the rest use `<div class="md-theme">`. Adding a new CSS-variable theme is a few lines — see [CONTRIBUTING.md](./CONTRIBUTING.md#adding-a-theme).

### Modify PDF styles

[`src/lib/pdf.ts`](./src/lib/pdf.ts) is the server-side render path. Page break controls, the page-numbered footer template, and theme-aware CSS overrides all live there.

## Hosting

Standard Next.js hosting story — Node 22+, persistent Postgres, and a process supervisor of your choice. The PDF route uses Puppeteer's bundled Chromium and works in containers with `--no-sandbox` (already configured).

For SEO on your hosted instance, set `NEXT_PUBLIC_SITE_URL=https://your-domain` and rebuild. That switches the app into hosted mode (sitemap, canonical, indexable robots, JSON-LD with the right URL).

## Roadmap

Open to suggestions. Things on my list:

- [ ] Editable share links (currently snapshots only)
- [ ] Math support (KaTeX/MathJax)
- [ ] Diagram alternatives — PlantUML, D2, Graphviz
- [ ] Theme builder UI

[Open an issue](https://github.com/Manan-Santoki/Binderly/issues) if you want to discuss any of these or pitch your own.

## Contributing

PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 Manan Santoki
