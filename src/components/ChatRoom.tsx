import { useEffect, useRef, useState } from "react";
import MessageList from "@components/MessageList";
import MessageInput from "@components/MessageInput";
import Header from "@components/Header";
import { useRealtime } from "@hooks/useRealtime";

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

  const { sendMessage, sendTyping, isConnected, ws } = useRealtime({
    room,
    username,
    onMessage: (msg) => {
      if (msg.type === "history") setMessages(msg.messages);
      else if (msg.type === "message") setMessages((prev) => [...prev, msg]);
      else if (msg.type === "system" && msg.users)
        setUsersOnline(msg.users || []);
      if (msg.clear) setMessages([]);
    },
    onTyping: (user) => {
      setTypingUsers((prev) =>
        prev.includes(user) ? prev : [...prev, user]
      );
      setTimeout(
        () => setTypingUsers((prev) => prev.filter((u) => u !== user)),
        2000
      );
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⚙️ Identifica se o usuário é criador da sala
  useEffect(() => {
    const userId = localStorage.getItem("sharkchat_userid");
    fetch(
      window.location.hostname === "localhost"
        ? `http://localhost:8080/rooms`
        : `https://sharkchat-production.up.railway.app/rooms`
    )
      .then((res) => res.json())
      .then((rooms) => {
        const found = rooms.find((r: any) => r.name === room);
        setIsCreator(found?.creator === userId);
      })
      .catch(console.error);
  }, [room]);

  // 🧹 Limpar chat
  const handleClear = () => {
    if (isCreator && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "clear" }));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Área principal */}
      <div className="flex flex-col flex-1">
        <Header
          room={room}
          theme={theme}
          toggleTheme={toggleTheme}
          openSidebar={openSidebar}
          onClear={handleClear}
          usersOnline={usersOnline}
        />

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} typingUsers={typingUsers} />
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-300 dark:border-slate-700">
          <MessageInput
            onSend={sendMessage}
            onTyping={sendTyping}
            disabled={!isConnected}
          />
        </div>
      </div>

      {/* Painel lateral de usuários online */}
      <aside className="hidden md:block w-64 border-l border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Usuários online
        </h3>
        {usersOnline.length === 0 ? (
          <p className="text-slate-500 text-sm">Ninguém aqui ainda...</p>
        ) : (
          <ul className="space-y-2">
            {usersOnline.map((user, i) => (
              <li
                key={i}
                className={`text-sm px-2 py-1 rounded ${
                  user === username
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                {user}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
