import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SharedDocViewer } from "@/components/shared-doc-viewer";
import { getSharedDoc } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const doc = await getSharedDoc(id);
    if (!doc) return { title: "Binderly" };
    return {
      title: doc.metadata_title || "Shared document — Binderly",
      description: doc.metadata_author
        ? `Shared by ${doc.metadata_author}`
        : undefined,
    };
  } catch {
    return { title: "Binderly" };
  }
}

export default async function ShareViewerPage({ params }: Props) {
  const { id } = await params;
  const doc = await getSharedDoc(id);
  if (!doc) notFound();

  return (
    <SharedDocViewer
      doc={{
        id: doc.id,
        markdown: doc.markdown,
        theme: doc.theme,
        customCss: doc.custom_css,
        metadataTitle: doc.metadata_title,
        metadataAuthor: doc.metadata_author,
        roundedCorners: doc.rounded_corners,
        showToc: doc.show_toc,
      }}
    />
  );
}
