import { Moon, Sun, Users, Trash2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  roomName: string;
  onClear: () => void;
  onLogout: () => void;
  usersOnline: string[];
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({
  roomName,
  onClear,
  onLogout,
  usersOnline,
  darkMode,
  toggleDarkMode,
}: HeaderProps) {
  const [formattedRoom, setFormattedRoom] = useState("");

  useEffect(() => {
    // 🧠 Exibe o nome real da sala (sem ID)
    if (!roomName) return;
    if (roomName.startsWith("#")) {
      setFormattedRoom(roomName);
    } else {
      setFormattedRoom(`#${roomName}`);
    }
  }, [roomName]);

  return (
    <header
      className={`flex items-center justify-between px-4 py-2 border-b ${
        darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-300"
      }`}
    >
      {/* 🦈 Nome da sala */}
      <div className="flex items-center gap-3">
        <h2
          className={`font-semibold text-lg ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          {formattedRoom || "#geral"}
        </h2>
      </div>

      {/* 🔘 Botões de ação */}
      <div className="flex items-center gap-4">
        {/* 👥 Usuários online */}
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <Users size={18} />
          <span>{usersOnline.length}</span>
          <span className="hidden sm:inline">online</span>
        </div>

        {/* 🧹 Limpar chat (apenas criador) */}
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-red-500 transition"
          title="Limpar mensagens da sala"
        >
          <Trash2 size={18} />
        </button>

        {/* ☀️🌙 Tema */}
        <button
          onClick={toggleDarkMode}
          className="text-slate-400 hover:text-yellow-400 transition"
          title="Alternar tema"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 🚪 Sair */}
        <button
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 transition"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
