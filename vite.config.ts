import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚙️ Configuração automática para Vercel + Railway
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/rooms": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
