import type { MetadataRoute } from "next";

import { SEO_ENABLED, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!SEO_ENABLED || !SITE_URL) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: [],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /v/* are public-by-link snapshots — let users index them if they want,
        // but don't let crawlers follow ad-hoc URLs they haven't been given.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
