import { useEffect, useRef, useState } from "react";

interface RealtimeOptions {
  room: string;
  username: string;
  onMessage: (msg: any) => void;
  onTyping?: (user: string) => void;
}

export function useRealtime({ room, username, onMessage, onTyping }: RealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!room || !username) return;

    const WS_URL = "ws://localhost:8080";
    let id = localStorage.getItem("sharkchat_userid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sharkchat_userid", id);
    }

    const ws = new WebSocket(`${WS_URL}/?room=${room}&id=${id}&name=${encodeURIComponent(username)}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing" && onTyping) onTyping(data.user);
        else onMessage(data);
      } catch (e) {
        console.error("Erro WS:", e);
      }
    };

    return () => ws.close();
  }, [room, username]);

  const sendMessage = (msg: { text?: string; image?: string }) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "message", text: msg.text || "", image: msg.image || null }));
  };

  const sendTyping = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "typing" }));
  };

  return { isConnected, sendMessage, sendTyping, ws: wsRef.current };
}
