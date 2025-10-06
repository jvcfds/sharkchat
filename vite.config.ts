import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ⚙️ Configuração completa para SharkChat
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@types": path.resolve(__dirname, "./src/types"),
    },
  },
  server: {
    port: 5173,
    proxy:
      mode === "development"
        ? {
            "/rooms": {
              target: "http://localhost:8080",
              changeOrigin: true,
            },
            "/login": {
              target: "http://localhost:8080",
              changeOrigin: true,
            },
          }
        : undefined,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "1.0.0"),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
}));
