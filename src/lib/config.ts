// Detecta ambiente e centraliza URLs do backend
export const IS_LOCAL =
  typeof window !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1");

export const API_BASE = IS_LOCAL
  ? "http://localhost:8080"
  : (import.meta.env.VITE_API_URL || "https://sharkchat-production.up.railway.app");

export const WS_BASE = IS_LOCAL
  ? "ws://localhost:8080"
  : (import.meta.env.VITE_WS_URL || "wss://sharkchat-production.up.railway.app");