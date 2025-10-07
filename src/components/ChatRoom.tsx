import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, Users } from "lucide-react";
import { useRealtime } from "../hooks/useRealtime";

/* 🎨 Gera uma cor de avatar consistente com base no nome */
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

/* 🧩 Componente de avatar com indicador online/offline */
function Avatar({
  name,
  isOnline,
}: {
  name: string;
  isOnline: boolean;
}) {
  const initial = name.charAt(0).toUpperCase();
  const color = stringToColor(name);
  return (
    <div className="relative flex items-center justify-center rounded-full text-white font-semibold select-none"
      style={{
        backgroundColor: color,
        width: "38px",
        height: "38px",
        flexShrink: 0,
      }}
      title={name}
    >
      {initial}
      {/* 🟢 Indicador de status */}
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#001823]
          ${isOnline ? "bg-green-400" : "bg-gray-500/60"}`}
      />
    </div>
  );
}

export function ChatRoom({ room, username }: { room: string; username: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, sendMessage } = useRealtime({
    room,
    username,
    onMessage: (msg) => {
      if (msg.type === "history") setMessages(msg.messages || []);
      else if (msg.type === "users") setUsers(msg.users || []);
      else if (msg.type === "typing")
        setTypingUsers(msg.users.filter((u: string) => u !== username));
      else setMessages((prev) => [...prev, msg]);
    },
  });

  // ✏️ Dispara evento "typing" com debounce
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    if (!isConnected) return;

    sendMessage({ type: "typing" });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendMessage({ type: "stop_typing" });
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim() && !image) return;
    sendMessage({ type: "message", text, image });
    setText("");
    setImage(null);
  };

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Imagem muito grande (máx. 5 MB)");
      return;
    }
    const reader = new FileReader();
    setUploading(true);
    reader.onload = () => {
      setImage(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const box = document.getElementById("chat-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#000C13] text-[#E9D8A6] transition-colors">
      {/* Cabeçalho */}
      <header className="p-4 border-b border-[#0A9396]/40 bg-[#001823] flex items-center justify-between">
        <div>
          <h3 className="font-bold text-cyan-400">💬 Sala: {room}</h3>
          <div className="flex items-center gap-1 text-sm text-cyan-300 mt-1">
            <Users size={14} /> {users.length} online
          </div>
        </div>
        <span className={isConnected ? "text-[#0A9396]" : "text-red-500"}>
          {isConnected ? "Conectado" : "Desconectado"}
        </span>
      </header>

      {/* Indicador de digitação */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-sm text-cyan-300/70 italic">
          {typingUsers.length === 1
            ? `${typingUsers[0]} está digitando...`
            : `${typingUsers.join(", ")} estão digitando...`}
        </div>
      )}

      {/* Mensagens */}
      <main id="chat-box" className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) =>
          msg.type === "system" ? (
            <div
              key={msg.id || Math.random()}
              className="mx-auto text-center text-gray-400 italic text-sm"
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={msg.id || Math.random()}
              className={`flex items-end gap-2 max-w-[80%] ${
                msg.user === username ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar com status */}
              <Avatar name={msg.user} isOnline={users.includes(msg.user)} />

              {/* Caixa de mensagem */}
              <div
                className={`p-2 rounded-xl shadow-sm ${
                  msg.user === username
                    ? "bg-[#0A9396] text-white"
                    : "bg-[#002733] text-[#E9D8A6]"
                }`}
              >
                <span className="block text-[11px] opacity-70 mb-0.5">
                  {msg.user} • {msg.time}
                </span>
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Imagem enviada"
                    className="rounded-lg max-w-[240px] mt-1 border border-[#0A9396]/40"
                  />
                ) : (
                  <span className="block whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* Preview da imagem */}
      {image && (
        <div className="relative p-3 bg-[#001B26] flex items-center justify-between border-t border-[#0A9396]/30">
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-cyan-400 font-semibold">
              Enviando imagem...
            </div>
          )}
          <div className="flex items-center gap-3">
            <img
              src={image}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-[#0A9396]/40"
            />
            <span className="text-sm text-cyan-300">Imagem pronta</span>
          </div>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => setImage(null)}
          >
            ✕ Remover
          </button>
        </div>
      )}

      {/* Input */}
      <footer className="p-3 border-t border-[#0A9396]/40 flex items-center gap-3 bg-[#001B26]">
        <label
          className="cursor-pointer text-cyan-400 hover:text-cyan-300"
          title="Enviar imagem"
        >
          <ImagePlus size={22} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
        </label>

        <input
          ref={inputRef}
          className="flex-1 p-2 rounded-lg border border-[#0A9396]/40 bg-[#002733] text-[#E9D8A6] focus:ring-2 focus:ring-[#0A9396]"
          placeholder="Digite sua mensagem..."
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="flex items-center gap-1 bg-[#0A9396] hover:bg-[#0a7f83] text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Send size={18} />
          Enviar
        </button>
      </footer>
    </div>
  );
}
