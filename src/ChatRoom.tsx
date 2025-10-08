// src/ChatRoom.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toWs } from "./lib/ws";

interface Message {
  id?: string;
  user?: string;
  text: string;
  time?: string;
  type: "message" | "system" | "history";
}

interface ChatRoomProps {
  room: string;
  userName: string;
  serverHttp: string; // http(s)://...
}

export default function ChatRoom({ room, userName, serverHttp }: ChatRoomProps) {
  const serverWs = useMemo(() => toWs(serverHttp), [serverHttp]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [firstAttemptDone, setFirstAttemptDone] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const connectWebSocket = () => {
    const id = crypto.randomUUID();
    const url = `${serverWs}/?room=${encodeURIComponent(room)}&id=${id}&name=${encodeURIComponent(userName)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setFirstAttemptDone(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history" && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (data.type === "message" || data.type === "system") {
          setMessages((prev) => [...prev, data]);
        }
      } catch {
        /* ignore parse errors */
      }
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onclose = () => {
      setConnected(false);
      setFirstAttemptDone(true);
      setTimeout(connectWebSocket, 1500); // backoff simples
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, userName, serverWs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !connected) return;
    wsRef.current?.send(JSON.stringify({ type: "message", text }));
    setText("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#061720] to-[#04141e] text-white">
      <header className="p-4 bg-[#0b1f29]/80 backdrop-blur-md flex justify-between items-center border-b border-cyan-900/40">
        <h2 className="font-bold text-xl text-cyan-300">🦈 {room}</h2>
        <span className={connected ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
          {connected ? "🟢 Online" : "🔴 Offline"}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {!connected && !firstAttemptDone && (
          <div className="text-center text-cyan-200/70">Conectando ao servidor…</div>
        )}
        {!connected && firstAttemptDone && (
          <div className="text-center text-yellow-300/80">
            Não conectado. Tentando reconectar…
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id || Math.random()}
            className={`flex flex-col ${
              m.type === "system" ? "text-cyan-200/60 italic text-center"
              : m.user === userName ? "items-end"
              : "items-start"
            }`}
          >
            {m.type !== "system" && (
              <span className="text-xs text-cyan-200/60 mb-1">
                {m.user} • {m.time}
              </span>
            )}
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow ${
                m.type === "system"
                  ? "text-cyan-200/70 bg-transparent"
                  : m.user === userName
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-[#0b1f29] text-cyan-100 rounded-bl-none border border-cyan-900/40"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-[#0b1f29]/80 backdrop-blur-md flex items-center gap-2 border-t border-cyan-900/40">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          className="flex-1 p-3 rounded-2xl bg-[#0a1a23] text-white outline-none border border-cyan-900/50 focus:ring-2 focus:ring-cyan-500/70"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          className={`px-5 py-3 rounded-2xl font-semibold transition-all ${
            connected ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400"
                      : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Enviar
        </button>
      </footer>
    </div>
  );
}
