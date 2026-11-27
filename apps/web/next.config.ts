import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() { //Возвращаем правила proxy
    return [         //Возвращаем массив правил
      {
        source: "/api/:path*", // Перехватываем все запросы /api/*
        destination: `${process.env.API_URL ?? "http://localhost:3001"}/api/:path*`, // Адрес назначения на NestJS. Берём адрес из env или локальный fallback
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig; //Передаём конфигурацию Next.js.
