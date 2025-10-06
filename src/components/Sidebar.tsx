import { useState, useEffect } from "react";

interface SidebarProps {
  onSelectRoom: (room: string) => void;
  currentRoom: string;
}

export default function Sidebar({ onSelectRoom, currentRoom }: SidebarProps) {
  const [rooms, setRooms] = useState<{ id: string; name: string; creator: string }[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");

  // Detecta ambiente local ou produção
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const API_URL = isLocalhost
    ? "http://localhost:8080"
    : "https://sharkchat-production.up.railway.app";

  // 🔹 Carrega lista de salas
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 🦈 Criar nova sala
  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;

    try {
      const res = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoom.trim(),
          creator: localStorage.getItem("sharkchat_userid"),
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar sala");

      setNewRoom("");
      fetchRooms(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao criar sala:", err);
      setError("Erro ao criar sala.");
    }
  };

  // 🗑️ Excluir sala
  const handleDeleteRoom = async (id: string, creator: string) => {
    const userId = localStorage.getItem("sharkchat_userid");
    if (!userId || creator !== userId) {
      alert("Apenas o criador pode excluir esta sala.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta sala?")) return;

    try {
      const res = await fetch(`${API_URL}/rooms/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Erro ao excluir sala");
      fetchRooms();
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
    }
  };

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col p-3 text-slate-100">
      <h2 className="text-lg font-semibold mb-2">Salas</h2>

      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
              currentRoom === room.id
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800"
            }`}
            onClick={() => onSelectRoom(room.id)}
          >
            <span>#{room.name}</span>
            {room.name !== "geral" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(room.id, room.creator);
                }}
                className="text-red-400 hover:text-red-500 text-xs ml-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="nova sala..."
          className="w-full px-3 py-2 text-sm rounded bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleCreateRoom}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Criar
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </aside>
  );
}