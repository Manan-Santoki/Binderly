export const sampleMarkdown = `# Binderly — feature tour

Markdown rendered like GitHub. Exported like print.

## Why this exists

Most online Markdown-to-PDF tools cap document size, paywall the export, can't draw diagrams, and don't match how GitHub renders your file. Binderly does all of that, with no caps and no watermarks.

## GitHub Flavored Markdown

Inline \`code\`, **bold**, *italics*, ~~strikethrough~~, [links](https://github.com), and footnotes[^1] all behave the way you expect.

[^1]: Footnotes link forward and back inside the document.

### Task list

- [x] Live preview with Primer light/dark themes
- [x] Mermaid diagrams in both preview and PDF
- [x] GFM alerts (\`> [!NOTE]\`, \`[!WARNING]\`, …)
- [x] Auto-generated table of contents and heading anchors
- [ ] Your custom CSS — paste it in the sidebar

### Table

| Feature | Preview | PDF |
| --- | :---: | :---: |
| GitHub themes (light + dark) | ✅ | ✅ |
| Mermaid (sequence, gantt, flow) | ✅ | ✅ |
| GFM alerts | ✅ | ✅ |
| Page-numbered footer | — | ✅ |
| Page-break controls | — | ✅ |

## GFM alerts

> [!NOTE]
> Add context, caveats, or footguns inline — same syntax GitHub uses on \`README.md\`.

> [!TIP]
> Click **Share** to mint a public view-only link backed by Postgres.

> [!WARNING]
> Each Share is an immutable snapshot. Edits in the workbench don't update existing links.

> [!CAUTION]
> Embedded raw HTML renders as-is — only paste content you trust.

## Code blocks

Code blocks pick up syntax highlighting from highlight.js. Languages, theme-aware:

\`\`\`ts
import { renderMarkdownToPdf } from "@/lib/pdf";

export async function POST(req: Request) {
  const { markdown, theme } = await req.json();
  const pdf = await renderMarkdownToPdf({ markdown, theme });
  return new Response(pdf, { headers: { "content-type": "application/pdf" } });
}
\`\`\`

\`\`\`bash
pnpm install
pnpm db:migrate
pnpm dev
\`\`\`

## Diagrams (Mermaid)

### Sequence diagram

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant W as Workbench
    participant API as /api/share
    participant DB as Postgres
    U->>W: Click "Share"
    W->>API: POST { markdown, theme, ... }
    API->>DB: INSERT shared_documents
    DB-->>API: id
    API-->>W: { id }
    W-->>U: /v/<id> (copied)
\`\`\`

### Flowchart

\`\`\`mermaid
flowchart LR
    A[Markdown] --> B{Has mermaid?}
    B -- yes --> C[Inject mermaid UMD]
    B -- no --> D[Skip UMD]
    C --> E[Puppeteer renders]
    D --> E
    E --> F[A4 PDF + page numbers]
\`\`\`

### Gantt

\`\`\`mermaid
gantt
    dateFormat YYYY-MM-DD
    title       Sample roadmap
    section Build
    Scaffold        :done, a1, 2026-04-01, 5d
    Core features   :active, a2, after a1, 12d
    section Ship
    Docs            : a3, after a2, 6d
    Launch          : milestone, after a3, 0d
\`\`\`

## Quotes

> "The best documentation is the kind you actually open."
>
> — every team that has ever shipped

---

## Try it

1. Edit anything on the left — preview updates live.
2. Pick a theme: **GitHub Light**, **GitHub Dark**, or one of the curated typographic themes.
3. Click **Download PDF** for a print-ready file, or **Share** for a public view-only link.
`;
