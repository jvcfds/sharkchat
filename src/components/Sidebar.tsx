import { useEffect, useState } from "react";
import { PlusCircle, Trash2, LogOut, Moon, Sun } from "lucide-react";

interface SidebarProps {
  user: { id: string; name: string };
  currentRoom: string;
  onSelectRoom: (room: string) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  theme: "dark" | "light";
}

export function Sidebar({
  user,
  currentRoom,
  onSelectRoom,
  onLogout,
  onThemeToggle,
  theme,
}: SidebarProps) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [newRoom, setNewRoom] = useState("");

  // Carrega as salas
  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:8080/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Criar nova sala
  const createRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await fetch("http://localhost:8080/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoom, creator: user.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRooms((prev) => [...prev, data]);
      setNewRoom("");
    } catch (err) {
      alert("❌ Erro ao criar sala");
    }
  };

  // Excluir sala
  const deleteRoom = async (roomId: string, roomName: string) => {
    if (roomName.toLowerCase() === "geral") return;
    if (!confirm(`Tem certeza que deseja excluir a sala "${roomName}"?`)) return;
    try {
      await fetch(`http://localhost:8080/rooms/${roomId}`, { method: "DELETE" });
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      alert("❌ Erro ao excluir sala");
    }
  };

  return (
    <aside className="flex flex-col bg-[#001823] text-[#E9D8A6] w-full sm:w-64 border-r border-[#0A9396]/40 transition-all">
      {/* 🦈 Cabeçalho do usuário */}
      <div className="flex items-center justify-between p-4 border-b border-[#0A9396]/40">
        <div>
          <h2 className="text-lg font-bold text-cyan-400">{user.name}</h2>
          <p className="text-xs text-cyan-300/70">conectado</p>
        </div>

        {/* Botão de tema */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full hover:bg-[#002733] transition"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-cyan-400" />
          )}
        </button>
      </div>

      {/* 📜 Lista de salas */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-[#0A9396]/40 scrollbar-track-transparent">
        {rooms.map((r) => (
          <div
            key={r.id}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
              currentRoom === r.name
                ? "bg-[#0A9396] text-white"
                : "hover:bg-[#002733]"
            }`}
            onClick={() => onSelectRoom(r.name)}
          >
            <span className="truncate font-medium">{r.name}</span>

            {/* ❌ Só mostra botão de excluir se não for “geral” */}
            {r.name.toLowerCase() !== "geral" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoom(r.id, r.name);
                }}
                className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-500"
                title="Excluir sala"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ➕ Criar nova sala */}
      <div className="border-t border-[#0A9396]/40 p-3 flex items-center gap-2 bg-[#001B26]/80">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="Nova sala"
          className="flex-1 px-3 py-2 rounded-lg bg-[#002733] text-[#E9D8A6] border border-[#0A9396]/40 focus:ring-2 focus:ring-[#0A9396] outline-none"
        />
        <button
          onClick={createRoom}
          className="p-2 rounded-lg bg-[#0A9396] hover:bg-[#0a7f83] transition"
          title="Criar sala"
        >
          <PlusCircle size={18} className="text-white" />
        </button>
      </div>

      {/* 🚪 Logout */}
      <div className="border-t border-[#0A9396]/40 p-3 bg-[#001B26]/80 flex justify-center">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
