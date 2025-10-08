// src/lib/ws.ts
export const toWs = (url: string) =>
  url.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://");

export const getServerHttp = () =>
  (import.meta.env.VITE_SERVER_URL as string)?.trim() || "http://localhost:8080";

export const makeWsUrl = (params: Record<string, string>) => {
  const serverHttp = getServerHttp();
  const serverWs = toWs(serverHttp);
  const qs = new URLSearchParams(params).toString();
  return `${serverWs}/?${qs}`;
};
