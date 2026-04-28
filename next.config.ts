import type { NextConfig } from "next";

// Hosted vs self-hosted: when NEXT_PUBLIC_SITE_URL is set, the build is treated
// as the canonical hosted instance and SEO is enabled (no noindex header,
// crawlers allowed). Self-hosters leave it unset and stay private by default.
const SEO_ENABLED = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());

const nextConfig: NextConfig = {
  allowedDevOrigins: ["codeserver-3000.msantoki.com"],
  async headers() {
    if (SEO_ENABLED) {
      return [];
    }
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
        ],
      },
    ];
  },
};

export default nextConfig;