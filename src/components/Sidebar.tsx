import { useEffect, useState } from "react";

interface SidebarProps {
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
  username: string;
  onClose?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  currentRoom,
  setCurrentRoom,
  username,
  onClose,
  onLogout,
}: SidebarProps) {
  const [rooms, setRooms] = useState<{ id: string; name: string; creator: string }[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");

  // 🌍 Detecta ambiente
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // ✅ URL base da API
  const API_BASE = isLocalhost
    ? "http://localhost:8080"
    : "https://sharkchat-production.up.railway.app";

  // 🔄 Carregar lista de salas
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`);
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
  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoom.trim(),
          creator: localStorage.getItem("sharkchat_userid"),
        }),
      });

      if (!res.ok) throw new Error();
      setNewRoom("");
      fetchRooms();
    } catch (err) {
      console.error(err);
      setError("Erro ao criar sala.");
    }
  };

  // 🗑️ Excluir sala (apenas criador)
  const handleDeleteRoom = async (roomId: string) => {
    const userId = localStorage.getItem("sharkchat_userid");
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao excluir sala.");
      }

      fetchRooms();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir sala.");
    }
  };

  return (
    <div
      className="h-full w-64 border-r border-slate-300 dark:border-slate-700 flex flex-col 
                 bg-slate-100 dark:bg-slate-900 transition-colors duration-500"
    >
      {/* Usuário */}
      <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center">
        <span className="font-semibold text-slate-800 dark:text-slate-200">{username}</span>
        <button
          onClick={onLogout}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition"
        >
          sair
        </button>
      </div>

      {/* Salas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-sm text-slate-500 dark:text-slate-400 mb-2">Salas</h3>
        {rooms.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma sala encontrada.</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className={`group flex justify-between items-center p-2 rounded cursor-pointer transition ${
                currentRoom === room.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              onClick={() => {
                setCurrentRoom(room.id);
                onClose?.();
              }}
            >
              <span>#{room.name}</span>
              {room.name !== "geral" &&
                room.creator === localStorage.getItem("sharkchat_userid") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition"
                  >
                    ✕
                  </button>
                )}
            </div>
          ))
        )}
      </div>

      {/* Criar sala */}
      <div className="p-4 border-t border-slate-300 dark:border-slate-700">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="nova sala..."
          className="w-full px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-400 dark:border-slate-700 mb-2"
        />
        <button
          onClick={handleCreateRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded transition"
        >
          Criar
        </button>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
