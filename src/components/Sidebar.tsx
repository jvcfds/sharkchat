import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

interface SidebarProps {
  onSelectRoom: (roomId: string) => void;
  currentRoom: string;
  username: string;
  closeSidebar: () => void;
}

export default function Sidebar({
  onSelectRoom,
  currentRoom,
  username,
  closeSidebar,
}: SidebarProps) {
  const [rooms, setRooms] = useState<{ id: string; name: string; creator: string }[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");
  const userId = localStorage.getItem("sharkchat_userid");

  // 🔄 Carrega salas
  const fetchRooms = async () => {
    try {
      const res = await fetch("https://sharkchat-production.up.railway.app/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
      setError("Erro ao carregar salas.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ➕ Criar nova sala
  const createRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await fetch("https://sharkchat-production.up.railway.app/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoom.trim(), creator: userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao criar sala.");
        return;
      }

      setNewRoom("");
      fetchRooms();
    } catch (err) {
      console.error("Erro ao criar sala:", err);
      setError("Erro ao criar sala.");
    }
  };

  // 🗑️ Excluir sala (somente criador)
  const deleteRoom = async (roomId: string) => {
    try {
      const res = await fetch(`https://sharkchat-production.up.railway.app/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao excluir sala.");
        return;
      }

      fetchRooms();
      if (currentRoom === roomId) onSelectRoom("geral");
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-slate-800 border-r border-slate-700 text-slate-100 h-full">
      {/* 🔹 Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-base font-semibold">Conectado como</h2>
        <button
          className="md:hidden text-slate-400 hover:text-slate-200"
          onClick={closeSidebar}
        >
          <X size={18} />
        </button>
      </div>

      {/* 👤 Nome do usuário */}
      <div className="px-4 py-2 text-blue-400 text-sm font-medium border-b border-slate-700 truncate">
        {username}
      </div>

      {/* 📜 Lista de salas */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <h3 className="text-sm text-slate-400 mb-2">Salas</h3>
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition ${
              currentRoom === room.id
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-700"
            }`}
          >
            <span onClick={() => onSelectRoom(room.id)} className="truncate">
              #{room.name}
            </span>

            {/* 🗑️ Só o criador pode excluir */}
            {room.creator === userId && room.name !== "geral" && (
              <button
                onClick={() => deleteRoom(room.id)}
                className="ml-2 text-slate-400 hover:text-red-500"
                title="Excluir sala"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {rooms.length === 0 && (
          <p className="text-slate-500 text-sm">Nenhuma sala encontrada.</p>
        )}
      </div>

      {/* ➕ Criar nova sala */}
      <div className="p-3 border-t border-slate-700">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="nova sala..."
          className="w-full mb-2 px-3 py-2 rounded bg-slate-900 text-slate-100 border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={createRoom}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
        >
          <Plus size={14} /> Criar
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
