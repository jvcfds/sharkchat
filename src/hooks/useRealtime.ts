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

    // 🌎 Detecta ambiente automaticamente
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    // 🔗 Escolhe URL correta
    const WS_URL = isLocal
      ? "ws://localhost:8080"
      : "wss://sharkchat-production.up.railway.app"; // ✅ seu backend do Railway

    // 🔑 ID persistente do usuário
    let id = localStorage.getItem("sharkchat_userid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sharkchat_userid", id);
    }

    // 🚀 Cria e gerencia a conexão WebSocket
    const connect = () => {
      const ws = new WebSocket(
        `${WS_URL}/?room=${room}&id=${id}&name=${encodeURIComponent(username)}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conectado ao servidor WebSocket");
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.warn("⚠️ Conexão WebSocket encerrada. Tentando reconectar...");
        setIsConnected(false);
        reconnect();
      };

      ws.onerror = (err) => {
        console.error("❌ Erro na conexão WS:", err);
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

    // 🔁 Reconexão automática
    const reconnect = () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(() => {
        console.log("🔄 Tentando reconectar WebSocket...");
        connect();
      }, 2000);
    };

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [room, username]);

  // ✉️ Enviar mensagem
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

  // ⌨️ Enviar evento de digitação
  const sendTyping = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ type: "typing" }));
  };

  return { isConnected, sendMessage, sendTyping, ws: wsRef.current };
}
