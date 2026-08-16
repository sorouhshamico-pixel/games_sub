import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for Docker — see apps/web/Dockerfile.
  output: "standalone",
  transpilePackages: ["@gcc-store/ui", "@gcc-store/contracts", "@gcc-store/i18n"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // No Content-Security-Policy yet — getting script-src wrong would
          // silently break client-side interactivity (cart, login, ...)
          // with no server-side signal, and there's no headless-browser
          // check in this environment's toolset to verify a strict policy
          // doesn't. Needs to be added and tested in a real browser before
          // launch — see docs/SECURITY.md.
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
