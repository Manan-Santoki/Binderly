import { SEO_DESCRIPTION, SEO_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

// SSR'd content for crawlers. The workbench above this is dynamic+ssr:false,
// so without this section search engines see an empty page.
//
// Visually subtle: keep the workbench as the focus for human users while
// giving crawlers a real H1 and rich keyword-friendly copy below the fold.

const FEATURES = [
  {
    title: "GitHub-accurate themes",
    body: "Light and dark themes powered by the actual GitHub Primer stylesheet. Your rendered Markdown matches what you see on github.com — including code blocks, tables, and admonitions.",
  },
  {
    title: "Mermaid diagrams in PDF",
    body: "Sequence diagrams, flowcharts, Gantt charts, and class diagrams render in both the live preview and the exported PDF. No screenshot dance.",
  },
  {
    title: "GFM alerts and footnotes",
    body: "GitHub-flavored callouts (> [!NOTE], [!WARNING], [!CAUTION]), task lists, footnotes, and tables with column alignment all render and export correctly.",
  },
  {
    title: "Page-perfect PDFs",
    body: "A4 export with proper page-break controls, page numbers, and an optional auto-generated table of contents. Code blocks and tables don't split mid-row.",
  },
  {
    title: "Shareable view-only links",
    body: "Click Share to mint a public read-only link backed by Postgres. Anyone with the URL can view the rendered document or download the PDF — no account needed.",
  },
  {
    title: "Open source, no caps",
    body: "MIT-licensed and self-hostable. No document size limits, no watermarks, no paywalled exports. Bring your own Postgres for the share feature.",
  },
];

const FAQ = [
  {
    q: "How do I convert Markdown to PDF for free?",
    a: "Paste your Markdown into the editor, pick a theme (GitHub Light, GitHub Dark, or one of the curated typographic themes), and click Download PDF. The export runs server-side via Puppeteer and produces a print-ready A4 PDF with page numbers — completely free and unwatermarked.",
  },
  {
    q: "Does it support Mermaid diagrams?",
    a: "Yes. Fenced code blocks tagged with the mermaid language render as SVG diagrams in both the live preview and the exported PDF. Sequence diagrams, flowcharts, Gantt charts, state diagrams, and class diagrams are supported.",
  },
  {
    q: "Will the PDF look like GitHub's rendering of the same Markdown?",
    a: "Yes — the GitHub Light and GitHub Dark themes use the official GitHub Primer stylesheet, so headings, code blocks, tables, links, and alerts match what you see on github.com.",
  },
  {
    q: "Is there a document size or page limit?",
    a: "No. There are no caps on document size, page count, or export frequency. Self-hosters control their own Puppeteer resources; the hosted version intentionally avoids artificial limits.",
  },
  {
    q: "Can I share Markdown publicly without an account?",
    a: "Yes. Click Share and you'll get a public read-only URL like /v/<id>. The viewer uses the same renderer as the editor preview, including Mermaid diagrams and the chosen theme.",
  },
  {
    q: "Is it open source?",
    a: "Yes — Binderly is open source on GitHub. You can self-host the entire stack (Next.js + Puppeteer + Postgres) or fork it and modify the themes, plugins, and export pipeline.",
  },
];

export function SeoLanding() {
  const showcase = SITE_URL ?? "https://binderly.msantoki.com/";

  // JSON-LD structured data — gives search engines a rich understanding of
  // the page (SoftwareApplication for the tool itself, FAQPage for the FAQ).
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: SEO_DESCRIPTION,
    url: showcase,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Person",
      name: "Manan Santoki",
      url: "https://github.com/Manan-Santoki",
    },
    softwareHelp: "https://github.com/Manan-Santoki/Binderly",
    featureList: FEATURES.map((f) => f.title),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      aria-labelledby="seo-landing-heading"
      className="border-t bg-muted/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1
          id="seo-landing-heading"
          className="text-balance font-semibold text-2xl tracking-tight sm:text-3xl"
        >
          {SEO_TITLE}
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground text-sm sm:text-base">
          {SEO_DESCRIPTION}
        </p>

        <h2 className="mt-10 font-semibold text-lg">What's inside</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-lg border p-4">
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-semibold text-lg">Frequently asked questions</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-lg border p-4">
              <dt className="font-medium text-sm">{item.q}</dt>
              <dd className="mt-1 text-muted-foreground text-sm">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-muted-foreground text-xs">
          Open source on{" "}
          <a
            href="https://github.com/Manan-Santoki/Binderly"
            className="underline hover:text-foreground"
          >
            GitHub
          </a>
          . Built with Next.js, Puppeteer, and Postgres.
        </p>
      </div>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
