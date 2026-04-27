"use client";

import GithubSlugger from "github-slugger";
import { useMemo } from "react";

type Heading = {
  level: number;
  text: string;
  slug: string;
};

function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  const result: Heading[] = [];
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;

    result.push({ level, text, slug: slugger.slug(text) });
  }

  return result;
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  if (headings.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        Add headings to your document to populate the outline.
      </p>
    );
  }

  return (
    <nav aria-label="Table of contents">
      <ul className="space-y-1 text-sm">
        {headings.map((h, idx) => (
          <li
            key={`${h.slug}-${idx}`}
            style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
          >
            <a
              href={`#${h.slug}`}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
