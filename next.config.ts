import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\/data\/lawpacks\/.*\.(json|bin)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "lawpacks-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/src\/lib\/i18n\/messages\/.*\.json$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "locales-cache",
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // @ts-ignore
  turbopack: {
    root: process.cwd(),
  },
};

export default withPWA(nextConfig);
