"use client";

import dynamic from "next/dynamic";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SeoLanding } from "@/components/seo-landing";

const PdfWorkbench = dynamic(
  () =>
    import("@/components/pdf-workbench/workbench").then((mod) => mod.PdfWorkbench),
  { ssr: false },
);

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">
        <PdfWorkbench />
        <SeoLanding />
      </main>
      <Footer />
    </>
  );
}
