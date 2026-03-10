import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Binderly",
    template: "%s | Binderly",
  },
  description:
    "A professional tool for converting Markdown to PDF. Features live preview, custom CSS styling, dark mode, and instant export. Perfect for documentation, reports, and resumes.",
  keywords: [
    "markdown to pdf",
    "markdown editor",
    "pdf converter",
    "document generator",
    "developer tools",
    "next.js",
    "react",
    "css theming",
  ],
  authors: [
    {
      name: "Manan Santoki",
      url: "https://github.com/Manan-Santoki",
    },
  ],
  creator: "Manan Santoki",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://markdown2pdf.manansantoki.xyz",
    title: "Binderly",
    description:
      "Create beautiful PDFs from Markdown with live preview and custom styling.",
    siteName: "Binderly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Binderly Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Binderly",
    description:
      "Convert Markdown to pixel-perfect PDFs with custom themes and live preview.",
    images: ["/og-image.png"],
    creator: "@manansantoki",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      </body>
    </html>
  );
}
