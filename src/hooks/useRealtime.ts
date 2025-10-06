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
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!room || !username) return;

    const connect = () => {
      // 🌍 Detecta ambiente automaticamente
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      // ✅ Define URL de conexão
      const WS_URL = isLocalhost
        ? "ws://localhost:8080"
        : "wss://sharkchat-production.up.railway.app";

      // 🔑 ID único persistente
      let id = localStorage.getItem("sharkchat_userid");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("sharkchat_userid", id);
      }

      // 🚀 Conecta ao WebSocket
      const ws = new WebSocket(
        `${WS_URL}/?room=${room}&id=${id}&name=${encodeURIComponent(username)}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conectado ao servidor WebSocket");
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.warn("⚠️ Conexão WS encerrada, tentando reconectar...");
        setIsConnected(false);

        // 🔁 Reconeção automática em 3s
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("❌ Erro WS:", err);
        setIsConnected(false);
        ws.close();
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
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [room, username]);

  // ✉️ Envia mensagem
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

  // ⌨️ Envia evento de digitação
  const sendTyping = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ type: "typing" }));
  };

  return { isConnected, sendMessage, sendTyping, ws: wsRef.current };
}
