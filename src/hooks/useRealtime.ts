import { useEffect, useRef, useState } from "react";

interface RealtimeOptions {
  room: string;
  username: string;
  onMessage: (msg: any) => void;
  onTyping?: (user: string) => void;
}

export function useRealtime({
  room,
  username,
  onMessage,
  onTyping,
}: RealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!room || !username) return;

    // 🌍 Detecta ambiente automaticamente (local ou produção)
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    // ✅ WebSocket URL dinâmica
    const WS_URL = isLocalhost
      ? "ws://localhost:8080"
      : "wss://sharkchat-production.up.railway.app"; // 🚀 seu backend do Railway

    // 🔑 ID persistente do usuário
    let id = localStorage.getItem("sharkchat_userid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sharkchat_userid", id);
    }

    // 🚀 Conexão WebSocket
    const ws = new WebSocket(
      `${WS_URL}/?room=${room}&id=${id}&name=${encodeURIComponent(username)}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Conectado ao servidor WebSocket");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.warn("⚠️ Conexão WebSocket encerrada");
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error("❌ Erro na conexão WS:", err);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing" && onTyping) onTyping(data.user);
        else onMessage(data);
      } catch (e) {
        console.error("Erro ao processar WS:", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [room, username]);

  // ✉️ Envia mensagem (texto ou imagem)
  const sendMessage = (msg: { text?: string; image?: string }) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "message",
        text: msg.text || "",
        image: msg.image || null,
      })
    );
  };

  // ⌨️ Notifica digitação
  const sendTyping = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ type: "typing" }));
  };

  return { isConnected, sendMessage, sendTyping, ws: wsRef.current };
}
