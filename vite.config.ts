import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/rooms": "http://localhost:8080",
      "/login": "http://localhost:8080",
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: "dist",
  },
});
