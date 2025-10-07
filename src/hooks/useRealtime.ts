import { useEffect, useRef, useState } from "react";

export function useRealtime({
  room,
  username,
  onMessage,
}: {
  room: string;
  username: string;
  onMessage: (msg: any) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const connectedOnce = useRef(false);

  const connect = () => {
    if (!room || !username || connectedOnce.current) return;
    connectedOnce.current = true;

    const isLocalhost = window.location.hostname === "localhost";
    const WS_URL = isLocalhost
      ? "ws://localhost:8080"
      : "wss://sharkchat-production.up.railway.app";

    const ws = new WebSocket(`${WS_URL}/?room=${room}&id=${username}&name=${username}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log(`✅ Conectado à sala "${room}"`);
    };

    ws.onclose = () => {
      setIsConnected(false);
      connectedOnce.current = false;
      console.warn("⚠️ Conexão encerrada. Tentando reconectar em 3s...");
      reconnectTimer.current = window.setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("❌ Erro no WebSocket:", err);
      ws.close();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      connectedOnce.current = false;
    };
  }, [room, username]);

  const sendMessage = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text: msg }));
    }
  };

  return { isConnected, sendMessage };
}
