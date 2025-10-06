import { useEffect, useRef, useState } from "react";

interface RealtimeOptions {
  room: string;
  username: string;
  onMessage: (msg: any) => void;
}

export function useRealtime({ room, username, onMessage }: RealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!room || !username) return;

    const isLocal = window.location.hostname === "localhost";
    const WS_URL = isLocal
      ? "ws://localhost:8080"
      : "wss://sharkchat-production.up.railway.app";

    let id = localStorage.getItem("sharkchat_userid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sharkchat_userid", id);
    }

    const ws = new WebSocket(`${WS_URL}/?room=${room}&id=${id}&name=${username}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));

    return () => ws.close();
  }, [room, username]);

  const sendMessage = (msg: { text: string }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text: msg.text }));
    }
  };

  const sendTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  return { isConnected, sendMessage, sendTyping };
}
