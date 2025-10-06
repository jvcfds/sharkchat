import { useEffect, useRef, useState } from "react";
import MessageList from "@components/MessageList";
import MessageInput from "@components/MessageInput";
import { useRealtime } from "@hooks/useRealtime";
import Header from "@components/Header";

interface ChatRoomProps {
  room: string;                // ID da sala (uuid)
  username: string;
  theme: string;
  toggleTheme: () => void;
  openSidebar: () => void;     // (mantido na assinatura caso use no futuro)
}

type ChatMsg = {
  id: string;
  user: string;
  text?: string;
  image?: string | null;
  time?: string | number | Date; // servidor pode mandar em formatos diferentes
};

export default function ChatRoom({
  room,
  username,
  theme,
  toggleTheme,
}: ChatRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [usersOnline, setUsersOnline] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>("geral");

  // 🔧 normaliza qualquer formato de "time" para ISO (para evitar Invalid Date em MessageBubble)
  const normalizeToISO = (t: ChatMsg["time"]): string => {
    try {
      if (!t) return new Date().toISOString();

      // já é Date
      if (t instanceof Date) return t.toISOString();

      // número (epoch)
      if (typeof t === "number") return new Date(t).toISOString();

      // string "HH:MM" → usa hoje com esse horário
      if (typeof t === "string" && /^\d{2}:\d{2}/.test(t)) {
        const [H, M] = t.slice(0, 5).split(":").map(Number);
        const d = new Date();
        d.setHours(H ?? 0, M ?? 0, 0, 0);
        return d.toISOString();
      }

      // string ISO ou válida para Date
      const d = new Date(t as string);
      if (isNaN(d.getTime())) return new Date().toISOString();
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  // 🔌 websocket + eventos
  const { sendMessage, sendTyping, isConnected } = useRealtime({
    room,
    username,
    onMessage: (msg: any) => {
      if (msg.type === "history") {
        const fixed = (msg.messages as ChatMsg[]).map((m) => ({
          ...m,
          time: normalizeToISO(m.time),
        }));
        setMessages(fixed);
        return;
      }

      if (msg.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            ...msg,
            time: normalizeToISO(msg.time),
          },
        ]);
        return;
      }

      if (msg.type === "system" && msg.users) {
        setUsersOnline(msg.users || []);
      }

      if (msg.clear) {
        setMessages([]);
      }
    },
    onTyping: (user) => {
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== user));
      }, 2000);
    },
  });

  // 📛 resolve o nome legível da sala a partir do ID
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/rooms");
        const data: { id: string; name: string }[] = await res.json();
        const current = data.find((r) => r.id === room);
        if (alive) setRoomName(current?.name || "geral");
      } catch {
        if (alive) setRoomName("geral");
      }
    })();
    return () => {
      alive = false;
    };
  }, [room]);

  // 📜 rola pro fim sempre que chegam mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Coluna principal */}
      <div className="flex flex-col flex-1">
        <Header
          room={roomName}                 // 👉 agora o Header recebe o NOME (não o ID)
          theme={theme}
          toggleTheme={toggleTheme}
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

      {/* Sidebar direita — usuários online */}
      <aside className="hidden md:flex flex-col w-52 border-l border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Usuários online
        </h3>
        <ul className="space-y-1">
          {usersOnline.length > 0 ? (
            usersOnline.map((user, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 dark:text-slate-100 bg-slate-200/70 dark:bg-slate-700/50 px-2 py-1 rounded"
              >
                {user}
              </li>
            ))
          ) : (
            <li className="text-slate-500 dark:text-slate-400 text-xs italic">
              Nenhum online
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
}
