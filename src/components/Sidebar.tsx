import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";

interface SidebarProps {
  serverHttp: string;
  currentRoom: string;
  onSelectRoom: (room: string) => void;
  userName: string;
}

interface Room {
  name: string;
  creator: string;
}

export default function Sidebar({
  serverHttp,
  currentRoom,
  onSelectRoom,
  userName,
}: SidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega salas do servidor
  const loadRooms = async () => {
    try {
      const res = await fetch(`${serverHttp}/rooms`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Criar sala nova
  const createRoom = async () => {
    if (!newRoom.trim()) return;
    setLoading(true);
    try {
      await fetch(`${serverHttp}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoom, creator: userName }),
      });
      setNewRoom("");
      await loadRooms();
    } catch (err) {
      console.error("Erro ao criar sala:", err);
    } finally {
      setLoading(false);
    }
  };

  // Excluir sala (somente se o usuário for o criador)
  const deleteRoom = async (roomName: string) => {
    if (!confirm(`Deseja realmente excluir a sala "${roomName}"?`)) return;
    try {
      await fetch(`${serverHttp}/rooms/${roomName}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester: userName }),
      });
      await loadRooms();
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
    }
  };

  return (
    <aside className="w-64 md:w-72 bg-[#0b1f29]/90 backdrop-blur-md border-r border-cyan-900/40 p-4 flex flex-col gap-4 h-full md:h-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-cyan-400">🦈 SharkChat</h2>
      </div>

      {/* Criar nova sala */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Nova sala..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createRoom()}
          className="flex-1 p-2 rounded-lg bg-[#112733] border border-cyan-900/40 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
        />
        <button
          onClick={createRoom}
          disabled={loading}
          className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition disabled:opacity-50"
          title="Criar sala"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de salas */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-cyan-900/40 scrollbar-track-transparent">
        {rooms.map((room) => (
          <div
            key={room.name}
            onClick={() => onSelectRoom(room.name)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              currentRoom === room.name
                ? "bg-cyan-700/50 border border-cyan-700"
                : "hover:bg-[#0e2531]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">{room.name}</span>
            </div>

            {/* Excluir sala — só criador pode */}
            {room.creator === userName && room.name !== "geral" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoom(room.name);
                }}
                className="p-1 rounded hover:bg-red-500/20"
                title="Excluir sala"
              >
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="text-xs text-gray-400 border-t border-cyan-900/40 pt-3">
        Logado como{" "}
        <span className="text-cyan-300 font-medium">{userName}</span>
      </div>
    </aside>
  );
}
