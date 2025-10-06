import { useEffect, useRef, useState } from "react";
import MessageList from "@components/MessageList";
import MessageInput from "@components/MessageInput";
import { useRealtime } from "@hooks/useRealtime";
import Header from "@components/Header";

interface ChatRoomProps {
  room: string;
  username: string;
  theme: string;
  toggleTheme: () => void;
  openSidebar: () => void;
}

export default function ChatRoom({
  room,
  username,
  theme,
  toggleTheme,
  openSidebar,
}: ChatRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [usersOnline, setUsersOnline] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  // 🌍 Detecta ambiente (local ou produção)
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const API_BASE = isLocalhost
    ? "http://localhost:8080"
    : "https://sharkchat-production.up.railway.app";

  // ⚡ WebSocket hook
  const { sendMessage, sendTyping, isConnected, ws } = useRealtime({
    room,
    username,
    onMessage: (msg) => {
      if (msg.type === "history") setMessages(msg.messages);
      else if (msg.type === "message") setMessages((p) => [...p, msg]);
      else if (msg.type === "system" && msg.users)
        setUsersOnline(msg.users || []);
      if (msg.clear) setMessages([]);
    },
    onTyping: (user) => {
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
      setTimeout(
        () => setTypingUsers((prev) => prev.filter((u) => u !== user)),
        2000
      );
    },
  });

  // 🔍 Verifica se o usuário é o criador da sala
  useEffect(() => {
    const verifyCreator = async () => {
      try {
        const userId = localStorage.getItem("sharkchat_userid");
        const res = await fetch(`${API_BASE}/rooms`);
        const data = await res.json();
        const current = data.find((r: any) => r.id === room);
        if (current?.creator === userId) setIsCreator(true);
        else setIsCreator(false);
      } catch (err) {
        console.error("Erro ao verificar criador:", err);
      }
    };
    verifyCreator();
  }, [room]);

  // 📜 Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🧹 Limpar sala (só criador)
  const handleClear = () => {
    if (isCreator && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "clear" }));
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full ${
        theme === "dark"
          ? "bg-slate-900 text-slate-100"
          : "bg-slate-50 text-slate-900"
      } transition-colors duration-500`}
    >
      {/* Cabeçalho */}
      <Header
        room={room}
        theme={theme}
        toggleTheme={toggleTheme}
        openSidebar={openSidebar}
        usersOnline={usersOnline}
      />

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} typingUsers={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={`border-t ${
          theme === "dark" ? "border-slate-700" : "border-slate-300"
        }`}
      >
        <MessageInput
          onSend={sendMessage}
          onTyping={sendTyping}
          disabled={!isConnected}
        />
        {isCreator && (
          <div className="p-2 text-center">
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              💨 Limpar mensagens da sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
