"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ListTree,
  PanelLeft,
  RefreshCw,
  Share2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  buildThemeCss,
  getMermaidThemeForDocumentTheme,
  getWrapperClass,
  themeOptions,
  type ThemeKey,
} from "@/lib/themes";
import { alertCss } from "@/lib/alert-css";
import { sampleMarkdown } from "@/lib/sample-markdown";
import { MermaidDiagram } from "./mermaid-diagram";
import { CodeBlock } from "./code-block";
import { TableOfContents } from "./toc";

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

const defaultMetadata = {
  title: "Strategy Brief",
  author: "Product Team",
};

export function PdfWorkbench() {
  const [markdown, setMarkdown] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("markdown-content");
      return saved || sampleMarkdown;
    }
    return sampleMarkdown;
  });
  const [customCss, setCustomCss] = useState("");
  const [theme, setTheme] = useState<ThemeKey>("serif");
  const [fileName, setFileName] = useState("strategy-brief");
  const [metadata, setMetadata] = useState(defaultMetadata);
  const [isExporting, setIsExporting] = useState(false);
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-visible");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [showToc, setShowToc] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("show-toc");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to local storage when changed
  useEffect(() => {
    localStorage.setItem("markdown-content", markdown);
  }, [markdown]);

  useEffect(() => {
    localStorage.setItem("sidebar-visible", String(showSidebar));
  }, [showSidebar]);

  useEffect(() => {
    localStorage.setItem("show-toc", String(showToc));
  }, [showToc]);

  const stats = useMemo(() => {
    const trimmed = markdown.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    return { characters: markdown.length, words };
  }, [markdown]);

  const wrapperClass = useMemo(() => getWrapperClass(theme), [theme]);
  const mermaidTheme = useMemo(
    () => getMermaidThemeForDocumentTheme(theme),
    [theme],
  );

  const previewCss = useMemo(() => {
    const baseCss = buildThemeCss(theme, customCss);
    const extras = `\n${previewExtraCss}`;
    if (!roundedCorners) {
      const flatten = wrapperClass === "md-theme"
        ? `
.md-theme {
  border: none !important;
  border-radius: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  width: 100% !important;
}`
        : `
.markdown-body {
  border: none !important;
  border-radius: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  width: 100% !important;
}`;
      return `${baseCss}${extras}${flatten}`;
    }
    return `${baseCss}${extras}`;
  }, [customCss, theme, roundedCorners, wrapperClass]);

  const markdownComponents = useMemo(
    () => ({
      pre(props: { children?: React.ReactNode }) {
        const child = props.children as ReactElement<{
          className?: string;
          children?: React.ReactNode;
        }> | undefined;
        const codeClass = child?.props?.className ?? "";
        const codeText = String(child?.props?.children ?? "").replace(/\n$/, "");
        const langMatch = /language-([\w-]+)/.exec(codeClass);
        const lang = langMatch?.[1] ?? "";

        if (lang === "mermaid") {
          return <MermaidDiagram code={codeText} theme={mermaidTheme} />;
        }
        // Primer themes match GitHub's web rendering, which has no header chrome.
        // Use the default <pre><code> so Primer's CSS owns the styling.
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

  const sanitizeFileName = (value: string) =>
    value
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "markdown-document";

  const handleFileSelection = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        setMarkdown(text);
        if (file.name.endsWith(".md")) {
          setFileName(sanitizeFileName(file.name.replace(/\.md$/i, "")));
        }
        toast.success(`Loaded ${file.name}`);
      } catch (error) {
        console.error(error);
        toast.error("Unable to read that file");
      }
    },
    [],
  );

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await handleFileSelection(file);
      event.target.value = "";
    },
    [handleFileSelection],
  );

  const handleDownload = useCallback(async () => {
    if (!markdown.trim()) {
      toast.error("Add some Markdown before exporting");
      return;
    }

    setIsExporting(true);
    try {
      const payload = {
        markdown,
        theme,
        customCss,
        fileName: sanitizeFileName(fileName),
        metadata,
        roundedCorners,
        showToc,
      };

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sanitizeFileName(fileName)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Unable to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [customCss, fileName, markdown, metadata, theme, roundedCorners, showToc]);

  const resetToSample = useCallback(() => {
    setMarkdown(sampleMarkdown);
    setCustomCss("");
    setTheme("serif");
    setMetadata(defaultMetadata);
    setFileName("strategy-brief");
    setRoundedCorners(false);
  }, []);

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!markdown.trim()) {
      toast.error("Add some Markdown before sharing");
      return;
    }
    setIsSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          theme,
          customCss,
          metadata,
          roundedCorners,
          showToc,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Share failed");
      }
      const { id } = (await response.json()) as { id: string };
      const url = `${window.location.origin}/v/${id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard");
      } catch {
        toast.success(`Share link: ${url}`);
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to create share link";
      toast.error(message);
    } finally {
      setIsSharing(false);
    }
  }, [customCss, markdown, metadata, roundedCorners, showToc, theme]);

  // One-shot import from /v/[id]'s "Open in editor" button.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("binderly-import-share");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        markdown?: string;
        theme?: string;
        customCss?: string;
        metadata?: { title?: string; author?: string };
        roundedCorners?: boolean;
        showToc?: boolean;
      };
      if (parsed.markdown) setMarkdown(parsed.markdown);
      if (parsed.theme) setTheme(parsed.theme as ThemeKey);
      if (typeof parsed.customCss === "string") setCustomCss(parsed.customCss);
      if (parsed.metadata) {
        setMetadata({
          title: parsed.metadata.title ?? "",
          author: parsed.metadata.author ?? "",
        });
      }
      if (typeof parsed.roundedCorners === "boolean") {
        setRoundedCorners(parsed.roundedCorners);
      }
      if (typeof parsed.showToc === "boolean") setShowToc(parsed.showToc);
      toast.success("Imported shared document");
    } catch {
      // fall through
    } finally {
      try {
        sessionStorage.removeItem("binderly-import-share");
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-label={showSidebar ? "Hide controls" : "Show controls"}
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetToSample}
            disabled={isExporting}
          >
            <RefreshCw className="size-4" /> Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isSharing || isExporting}
          >
            <Share2 className="size-4" />
            {isSharing ? "Creating link" : "Share"}
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

      <div className="flex items-start">
        <div
          className={`shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${showSidebar ? "w-[320px] mr-6 opacity-100" : "w-0 mr-0 opacity-0"
            }`}
        >
          <div className="flex w-[320px] flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document controls</CardTitle>
                <CardDescription>
                  Upload a Markdown file, adjust metadata, and choose a theme before
                  exporting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Markdown file</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="size-4" /> Upload .md
                    </Button>
                    <div className="text-muted-foreground text-sm">
                      {stats.words} words · {stats.characters} characters
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,text/markdown"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fileName">File name</Label>
                    <Input
                      id="fileName"
                      value={fileName}
                      onChange={(event) => setFileName(event.target.value)}
                      placeholder="e.g. quarterly-planning"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">PDF title</Label>
                      <Input
                        id="title"
                        value={metadata.title}
                        onChange={(event) =>
                          setMetadata((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Displayed in PDF metadata"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={metadata.author}
                        onChange={(event) =>
                          setMetadata((prev) => ({
                            ...prev,
                            author: event.target.value,
                          }))
                        }
                        placeholder="Name or team"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Theme</Label>
                  <Select
                    value={theme}
                    onValueChange={(value) => setTheme(value as ThemeKey)}
                  >
                    <SelectTrigger className="w-full justify-between">
                      <span className="truncate">
                        {themeOptions.find((option) => option.key === theme)
                          ?.label || "Select a theme"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="rounded-corners" className="text-base">
                      Rounded corners
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Apply card styling with rounded corners to the PDF.
                    </p>
                  </div>
                  <Switch
                    id="rounded-corners"
                    checked={roundedCorners}
                    onCheckedChange={setRoundedCorners}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTree className="size-4" /> Outline
                </CardTitle>
                <CardDescription>
                  Generated from your headings. Include in PDF when enabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-2.5">
                  <Label htmlFor="show-toc" className="text-sm">
                    Include in PDF
                  </Label>
                  <Switch
                    id="show-toc"
                    checked={showToc}
                    onCheckedChange={setShowToc}
                  />
                </div>
                <TableOfContents markdown={markdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>
                  Paste additional CSS tokens to align with a design system. They will
                  be merged with the active theme for preview and PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customCss}
                  onChange={(event) => setCustomCss(event.target.value)}
                  placeholder={`.md-theme h1 {
  letter-spacing: 0.08em;
}`}
                  className="font-mono text-sm"
                  rows={8}
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="h-full min-w-0 flex-1 p-0">
          <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
            <ResizablePanel defaultSize={50} minSize={35}>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Markdown editor</p>
                    <p className="text-muted-foreground text-xs">
                      Write or edit directly. Supports GitHub Flavored Markdown.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    .md
                  </span>
                </div>
                <Textarea
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  spellCheck={false}
                  className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-4 font-mono text-sm focus-visible:border-none focus-visible:ring-0"
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle={true} />
            <ResizablePanel defaultSize={50} minSize={35}>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Live preview</p>
                    <p className="text-muted-foreground text-xs">
                      Rendered with the selected theme + CSS.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    <SparklesIcon /> Styled
                  </span>
                </div>
                <ScrollArea className="flex-1 min-w-0" horizontal>
                  <div className="px-6 py-6">
                    <style>{previewCss}</style>
                    <div className={wrapperClass}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkAlert]}
                        rehypePlugins={[
                          rehypeRaw,
                          rehypeSlug,
                          [rehypeAutolinkHeadings, { behavior: "wrap" }],
                        ]}
                        components={markdownComponents}
                      >
                        {markdown || "_Start typing to preview your document..._"}
                      </ReactMarkdown>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Card>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5 fill-current"
      role="img"
    >
      <path d="M12 2l1.5 4.3L18 8l-4.5 1.7L12 14l-1.5-4.3L6 8l4.5-1.7L12 2zm6 6l1 2.5 2.5 1L19 13l-1 2.5L16.5 14 14 12.5l2.5-1L18 8zm-12 0l1 2.5 2.5 1L7 13l-1 2.5L4.5 14 2 12.5l2.5-1L6 8zm6 6l1.2 3.5L18 19l-3.8 1.5L12 24l-1.2-3.5L7 19l3.8-1.5L12 14z" />
    </svg>
  );
}
