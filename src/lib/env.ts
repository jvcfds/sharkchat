// src/lib/env.ts
export const API_ORIGIN =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://sharkchat-production.up.railway.app";

export const WS_ORIGIN =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "ws://localhost:8080"
    : "wss://sharkchat-production.up.railway.app";