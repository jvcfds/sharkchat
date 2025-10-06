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
  const [roomName, setRoomName] = useState<string>("");

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
      setTypingUsers((prev) =>
        prev.includes(user) ? prev : [...prev, user]
      );
      setTimeout(
        () => setTypingUsers((prev) => prev.filter((u) => u !== user)),
        2000
      );
    },
  });

  // 📜 Busca o nome correto da sala
  useEffect(() => {
    const fetchRoomName = async () => {
      try {
        const res = await fetch("https://sharkchat-production.up.railway.app/rooms");
        const data = await res.json();
        const current = data.find((r: any) => r.id === room);
        setRoomName(current ? current.name : room);
        if (current?.creator === localStorage.getItem("sharkchat_userid"))
          setIsCreator(true);
      } catch (err) {
        console.error("Erro ao buscar nome da sala:", err);
        setRoomName(room);
      }
    };
    fetchRoomName();
  }, [room]);

  // 🔄 Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🗑️ Limpar mensagens (apenas criador)
  const handleClear = () => {
    if (isCreator && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "clear" }));
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100">
      {/* 🗨️ Conteúdo principal */}
      <div className="flex flex-col flex-1">
        <Header
          room={roomName}
          theme={theme}
          toggleTheme={toggleTheme}
          openSidebar={openSidebar}
          onClear={handleClear}
          usersOnline={usersOnline}
        />

        {/* 📜 Lista de mensagens */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} typingUsers={typingUsers} />
          <div ref={bottomRef} />
        </div>

        {/* 💬 Campo de mensagem */}
        <div className="border-t border-slate-700">
          <MessageInput
            onSend={sendMessage}
            onTyping={sendTyping}
            disabled={!isConnected}
          />
        </div>
      </div>

      {/* 👥 Barra lateral direita — usuários online */}
      <div className="hidden md:block w-56 border-l border-slate-700 bg-slate-800/40 p-4">
        <h3 className="text-sm text-slate-400 mb-2">Usuários online</h3>
        {usersOnline.length > 0 ? (
          <ul className="space-y-1">
            {usersOnline.map((user) => (
              <li
                key={user}
                className="text-slate-200 text-sm bg-slate-700/30 px-2 py-1 rounded"
              >
                {user}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-xs">Ninguém online</p>
        )}
      </div>
    </div>
  );
}
