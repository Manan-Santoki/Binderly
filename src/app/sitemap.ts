import type { MetadataRoute } from "next";

import { SEO_ENABLED, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SEO_ENABLED || !SITE_URL) return [];

  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
