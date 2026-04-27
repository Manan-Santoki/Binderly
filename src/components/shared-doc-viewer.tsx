"use client";

import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { ArrowDownToLine, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { alertCss } from "@/lib/alert-css";
import {
  buildThemeCss,
  getMermaidThemeForDocumentTheme,
  getWrapperClass,
  isThemeKey,
  type ThemeKey,
} from "@/lib/themes";

import { CodeBlock } from "./pdf-workbench/code-block";
import { MermaidDiagram } from "./pdf-workbench/mermaid-diagram";
import { TableOfContents } from "./pdf-workbench/toc";

const previewExtraCss = `
${alertCss}

.code-block-wrapper {
  margin: 16px 0;
  border: 1px solid var(--md-border, #d0d7de);
  border-radius: 6px;
  overflow: hidden;
  background: var(--md-code-bg, #f6f8fa);
}
.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  border-bottom: 1px solid var(--md-border, #d0d7de);
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
.code-block-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--md-muted, #656d76);
  font: inherit;
  padding: 4px 6px;
  border-radius: 4px;
}
.code-block-copy:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
}
.code-block-pre {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 12px 16px !important;
  overflow-x: auto;
}
.mermaid-diagram svg { max-width: 100%; height: auto; }
`;

export type SharedDocPayload = {
  id: string;
  markdown: string;
  theme: string;
  customCss: string | null;
  metadataTitle: string | null;
  metadataAuthor: string | null;
  roundedCorners: boolean;
  showToc: boolean;
};

export function SharedDocViewer({ doc }: { doc: SharedDocPayload }) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const theme: ThemeKey = isThemeKey(doc.theme) ? doc.theme : "serif";
  const wrapperClass = useMemo(() => getWrapperClass(theme), [theme]);
  const mermaidTheme = useMemo(() => getMermaidThemeForDocumentTheme(theme), [theme]);

  const previewCss = useMemo(
    () => `${buildThemeCss(theme, doc.customCss ?? "")}\n${previewExtraCss}`,
    [theme, doc.customCss],
  );

  const markdownComponents = useMemo(
    () => ({
      pre(props: { children?: React.ReactNode }) {
        const child = props.children as
          | ReactElement<{ className?: string; children?: React.ReactNode }>
          | undefined;
        const codeClass = child?.props?.className ?? "";
        const codeText = String(child?.props?.children ?? "").replace(/\n$/, "");
        const langMatch = /language-([\w-]+)/.exec(codeClass);
        const lang = langMatch?.[1] ?? "";

        if (lang === "mermaid") {
          return <MermaidDiagram code={codeText} theme={mermaidTheme} />;
        }
        if (wrapperClass === "markdown-body") {
          return <pre>{child}</pre>;
        }
        return (
          <CodeBlock language={lang} code={codeText}>
            {child}
          </CodeBlock>
        );
      },
    }),
    [mermaidTheme, wrapperClass],
  );

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: doc.markdown,
          theme,
          customCss: doc.customCss ?? "",
          metadata: {
            title: doc.metadataTitle ?? undefined,
            author: doc.metadataAuthor ?? undefined,
          },
          roundedCorners: doc.roundedCorners,
          showToc: doc.showToc,
        }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${doc.metadataTitle?.replace(/\W+/g, "-").toLowerCase() || "shared-doc"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Unable to export PDF");
    } finally {
      setIsExporting(false);
    }
  }, [doc, theme]);

  const handleOpenInEditor = useCallback(() => {
    try {
      sessionStorage.setItem(
        "binderly-import-share",
        JSON.stringify({
          markdown: doc.markdown,
          theme,
          customCss: doc.customCss ?? "",
          metadata: {
            title: doc.metadataTitle ?? "",
            author: doc.metadataAuthor ?? "",
          },
          roundedCorners: doc.roundedCorners,
          showToc: doc.showToc,
        }),
      );
    } catch {
      // sessionStorage may be unavailable; navigation still proceeds.
    }
    router.push("/");
  }, [doc, router, theme]);

  return (
    <div className="flex w-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {doc.metadataTitle || "Shared document"}
          </p>
          {doc.metadataAuthor ? (
            <p className="truncate text-muted-foreground text-xs">
              by {doc.metadataAuthor}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenInEditor}
          >
            <ExternalLink className="size-4" /> Open in editor
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={isExporting}
          >
            <ArrowDownToLine className="size-4" />
            {isExporting ? "Preparing PDF" : "Download PDF"}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-w-0" horizontal>
        <div className="px-6 py-6">
          <style>{previewCss}</style>
          <div className={wrapperClass}>
            {doc.showToc ? (
              <aside className="pdf-toc-preview" aria-label="Table of contents">
                <TableOfContents markdown={doc.markdown} />
              </aside>
            ) : null}
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkAlert]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
              ]}
              components={markdownComponents}
            >
              {doc.markdown}
            </ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
