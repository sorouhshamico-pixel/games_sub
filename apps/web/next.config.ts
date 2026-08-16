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
};

export default withNextIntl(nextConfig);
