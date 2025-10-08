import React, { useEffect, useState } from "react";

interface Room {
  name: string;
  creator: string;
}

interface Props {
  serverHttp: string;
  currentRoom: string;
  userName: string;
  onSelectRoom: (room: string) => void;
}

export default function Sidebar({ serverHttp, currentRoom, userName, onSelectRoom }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState("");

  const loadRooms = async () => {
    try {
      const res = await fetch(`${serverHttp}/rooms`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    }
  };

  const createRoom = async () => {
    const name = newRoom.trim().toLowerCase();
    if (!name) return;
    try {
      await fetch(`${serverHttp}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, creator: userName }),
      });
      setNewRoom("");
      await loadRooms();
      onSelectRoom(name);
    } catch (err) {
      console.error("Erro ao criar sala:", err);
    }
  };

  const deleteRoom = async (name: string) => {
    const confirmDelete = confirm(`Excluir sala #${name}?`);
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `${serverHttp}/rooms/${encodeURIComponent(name)}?by=${encodeURIComponent(userName)}`,
        { method: "DELETE" }
      );
      const result = await res.json();

      if (result.ok) {
        await loadRooms();
        if (currentRoom === name) onSelectRoom("geral");
      } else {
        alert(result.error || "Não foi possível excluir a sala.");
      }
    } catch (err) {
      console.error("Erro ao excluir sala:", err);
      alert("Erro ao excluir a sala.");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <aside className="w-64 bg-[#0b1f29]/80 backdrop-blur-md border-r border-cyan-900/40 p-4 flex flex-col gap-3">
      <div className="text-cyan-300 font-semibold">Salas</div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {rooms.map((r) => (
          <div key={r.name} className="flex items-center gap-2">
            <button
              onClick={() => onSelectRoom(r.name)}
              className={`flex-1 text-left px-3 py-2 rounded-xl border ${
                r.name === currentRoom
                  ? "bg-teal-600/20 border-teal-500/40 text-cyan-100"
                  : "bg-[#0a1a23] border-cyan-900/40 text-cyan-200/80 hover:bg-[#0f2430]"
              }`}
              title={`Criador: ${r.creator}`}
            >
              #{r.name}
            </button>

            {/* Botão de excluir visível só pro criador */}
            {r.creator === userName && r.name !== "geral" && (
              <button
                onClick={() => deleteRoom(r.name)}
                title="Excluir (apenas criador)"
                className="px-2 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 mt-2">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="nova sala..."
          className="w-full px-3 py-2 rounded-xl bg-[#0a1a23] text-white border border-cyan-900/50 outline-none focus:ring-2 focus:ring-cyan-500/70"
        />
        <button
          onClick={createRoom}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 font-semibold"
        >
          + Criar sala
        </button>
      </div>
    </aside>
  );
}
