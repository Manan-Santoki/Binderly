import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["codeserver-3000.msantoki.com"],
  async headers() {
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