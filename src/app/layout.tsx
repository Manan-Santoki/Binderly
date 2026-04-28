import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  SEO_DESCRIPTION,
  SEO_ENABLED,
  SEO_KEYWORDS,
  SEO_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

import "@/app/globals.css";

// Tracking is opt-in via env var so self-hosters never send data anywhere.
// Set NEXT_PUBLIC_RYBBIT_SITE_ID on your hosted deployment only.
const RYBBIT_SITE_ID = process.env.NEXT_PUBLIC_RYBBIT_SITE_ID;
const RYBBIT_SRC =
  process.env.NEXT_PUBLIC_RYBBIT_SRC ?? "https://rybbit.msantoki.com/api/script.js";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  category: "developer tools",
  authors: [
    { name: "Manan Santoki", url: "https://github.com/Manan-Santoki" },
  ],
  creator: "Manan Santoki",
  publisher: "Manan Santoki",
  alternates: SITE_URL ? { canonical: SITE_URL } : undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL ?? undefined,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Markdown to PDF converter`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@manansantoki",
  },
  robots: SEO_ENABLED
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false },
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

const GeistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const GeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const MontserratSerif = Montserrat({
  subsets: ["latin"],
  variable: "--font-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        MontserratSerif.variable,
        "bg-background text-foreground",
      )}
    >
      <body className="flex grow flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {RYBBIT_SITE_ID ? (
          <Script
            src={RYBBIT_SRC}
            data-site-id={RYBBIT_SITE_ID}
            strategy="afterInteractive"
            defer
          />
        ) : null}
      </body>
    </html>
  );
}
