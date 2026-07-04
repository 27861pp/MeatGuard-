import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
//
// Base path:
//   - dev            → "/"            (clean localhost)
//   - production     → "./"           (Portable relative base, auto-compatible with GitHub Pages)
//   - override with VITE_BASE=/ for root hosts (Firebase Hosting / Vercel / Netlify)
export default defineConfig(({ command }) => {
  const base =
    command === "build" ? process.env.VITE_BASE ?? "./" : "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "MEAT GUARD — Smart Food Safety System",
          short_name: "MEAT GUARD",
          description:
            "ระบบอัจฉริยะตรวจสอบคุณภาพและความสดของเนื้อสัตว์แบบ Real-Time",
          lang: "th",
          theme_color: "#0a0a0f",
          background_color: "#0a0a0f",
          display: "standalone",
          orientation: "portrait",
          start_url: ".",
          icons: [
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          cleanupOutdatedCaches: true,
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            firebase: ["firebase/app", "firebase/auth", "firebase/database"],
            charts: ["chart.js", "react-chartjs-2"],
            motion: ["framer-motion"],
          },
        },
      },
    },
  };
});
