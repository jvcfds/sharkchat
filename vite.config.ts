import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/rooms": "http://localhost:8080",
      "/login": "http://localhost:8080",
    },
  },
});
