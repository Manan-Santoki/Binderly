# Contributing to Binderly

Thanks for your interest in contributing! Binderly is a small open-source project and contributions of any size — bug reports, fixes, theme additions, docs improvements — are welcome.

## Ground rules

- **Be kind and constructive.** This is a side project, not a corporate codebase.
- **Keep PRs focused.** One concern per PR. A bug fix + a refactor + a new feature in one PR is harder to review than three separate PRs.
- **Match the existing code style.** The project uses [Biome](https://biomejs.dev/) for linting and formatting; run it before pushing.
- **No CLA, no DCO.** Just submit a PR.

## Reporting bugs

Open an issue on [GitHub Issues](https://github.com/Manan-Santoki/Binderly/issues) with:

- What you expected to happen
- What actually happened
- A minimal Markdown sample that reproduces it (if applicable)
- Browser / OS / Node version

For rendering bugs, a screenshot of the preview pane and the resulting PDF page is gold.

## Suggesting features

Open an issue with the `enhancement` label. Before opening, check if there's already a discussion. Briefly describe:

- The use case (what are you trying to do?)
- Why the current behavior doesn't cover it
- Rough idea of the desired behavior

## Development setup

### Prerequisites

- **Node.js** 22+
- **pnpm** 9.15.2+
- **Postgres** 14+ (only required if you want to work on the share-link feature; the editor + PDF export work without it)
- **Docker** (optional, for running Postgres locally)

### Clone & install

```bash
git clone https://github.com/Manan-Santoki/Binderly
cd Binderly
pnpm install
```

`pnpm install` will also download a Chromium binary for Puppeteer (~170 MB on first install).

### Postgres (only if you're touching share links)

The fastest path is Docker:

```bash
docker run -d --name binderly-pg \
  -p 5432:5432 \
  -e POSTGRES_USER=binderly \
  -e POSTGRES_PASSWORD=devpw \
  -e POSTGRES_DB=binderly \
  postgres:16-alpine
```

Then create `.env.local`:

```bash
cat > .env.local <<'EOF'
DATABASE_URL=postgres://binderly:devpw@127.0.0.1:5432/binderly
DATABASE_SSL=false
EOF
```

Apply the schema:

```bash
pnpm db:migrate
```

If you skip the database, the editor and PDF export work fine — only the **Share** button and `/v/[id]` viewer page will fail.

### Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000.

## Project layout

```
src/
├── app/
│   ├── api/pdf/route.ts          # POST: render markdown -> PDF (Puppeteer)
│   ├── api/share/route.ts        # POST: persist a snapshot, return UUID
│   ├── v/[id]/page.tsx           # public read-only viewer page
│   ├── layout.tsx                # metadata + JSON-LD
│   ├── page.tsx                  # home — workbench + SEO landing
│   ├── robots.ts                 # gated on NEXT_PUBLIC_SITE_URL
│   └── sitemap.ts                # gated on NEXT_PUBLIC_SITE_URL
├── components/
│   ├── pdf-workbench/            # main editor (workbench, mermaid, code, toc)
│   ├── shared-doc-viewer.tsx     # read-only viewer used by /v/[id]
│   ├── seo-landing.tsx           # SSR'd FAQ + features for crawlers
│   └── ui/                       # Radix-based primitives
└── lib/
    ├── pdf.ts                    # marked + Puppeteer pipeline (server)
    ├── themes.ts                 # theme registry + helpers
    ├── db.ts                     # Postgres queries
    ├── seo.ts                    # SITE_URL / SEO_ENABLED / metadata constants
    ├── alert-css.ts              # bundled GFM alert CSS
    ├── highlight-themes/         # bundled highlight.js CSS
    └── github-markdown-themes/   # bundled github-markdown-css (Primer)
migrations/
└── 0001_shared_documents.sql     # schema for shareable links
scripts/
└── migrate.ts                    # tiny migration runner (`pnpm db:migrate`)
```

## Where to make changes

| You want to | Edit |
| --- | --- |
| Add or tweak a theme | `src/lib/themes.ts` |
| Change PDF page layout, headers, footers | `src/lib/pdf.ts` |
| Add a markdown plugin to the live preview | `src/components/pdf-workbench/workbench.tsx` |
| Change the home-page SEO content / FAQ | `src/components/seo-landing.tsx` |
| Update the share-link schema | `migrations/000N_*.sql` (new file) + `src/lib/db.ts` |

The preview uses [`react-markdown`](https://github.com/remarkjs/react-markdown) (good plugin ecosystem, runs in browser); the PDF render path uses [`marked`](https://github.com/markedjs/marked) (faster, server-friendly). If you add a new GFM extension, it usually needs to be wired into both.

## Code style

```bash
pnpm lint         # check
pnpm lint:fix     # auto-fix safe issues
```

The project uses Biome (configured in `biome.json`). Run `pnpm lint` before pushing — CI will run it too.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) where it makes sense:

- `feat:` — new user-facing feature
- `fix:` — bug fix
- `chore:` — tooling, deps, config
- `docs:` — README / CONTRIBUTING changes
- `refactor:` — internal restructure with no behavior change

Examples from the actual log:

```
feat: mermaid diagrams, GitHub Primer theming, and PDF polish
fix: load mermaid UMD via Puppeteer, drop custom code wrapper on Primer
feat: shareable view-only links via Postgres + slim workbench UI
chore: footer tagline — Open source. No size caps. No watermarks.
```

## Pull request process

1. Fork the repo and create a feature branch from `main`.
2. Make your changes. Run `pnpm lint` and `pnpm build` locally.
3. Manually verify the affected feature in the dev server. There's no automated test suite yet — manual QA is the bar.
4. Open a PR against `main`. Describe what changed and why. Screenshots help for any UI change.
5. I'll review and either merge or leave comments.

## Adding a theme

Themes live in `src/lib/themes.ts`. Two flavors:

- **`.md-theme` (legacy)** — uses CSS variables (`--md-bg`, `--md-text`, etc.) defined in `themeTokens`. Best for hand-rolled themes (serif, neutral, midnight).
- **`.markdown-body` (Primer)** — wraps the rendered HTML in `<div class="markdown-body">` and uses a full stylesheet. Best when you want pixel-matched parity with another markdown renderer.

A `.md-theme` addition needs three things:

```ts
const themeTokens = {
  // ...
  yourTheme: {
    label: "Your Theme Name",
    description: "One-line pitch.",
    vars: `
      .md-theme {
        --md-bg: #...;
        --md-text: #...;
        /* etc. */
      }
    `,
  },
};
```

…and the type system + `themes` record will pick it up automatically. Test it in both the preview and PDF (the same CSS is applied to both).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
