"use client";

import { useEffect, useState } from "react";

type MermaidTheme = "default" | "dark";

type Props = {
  code: string;
  theme: MermaidTheme;
};

export function MermaidDiagram({ code, theme }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "loose",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
        });

        const renderId = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
        const { svg: rendered } = await mermaid.render(renderId, code);

        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Mermaid render failed",
          );
          setSvg(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, theme]);

  if (error) {
    return (
      <div
        style={{
          border: "1px solid #f3a4a4",
          background: "#fef2f2",
          color: "#991b1b",
          borderRadius: 8,
          padding: "12px 16px",
          margin: "16px 0",
          fontFamily: "monospace",
          fontSize: 13,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <strong>Mermaid syntax error</strong>
        {"\n"}
        {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        style={{
          color: "#6b7280",
          fontStyle: "italic",
          padding: "12px 0",
        }}
      >
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram"
      style={{ margin: "16px 0", textAlign: "center" }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid output is sanitized SVG
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
