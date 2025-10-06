// src/components/NewRoomModal.tsx
import { useState } from "react";

export default function NewRoomModal({
  onCreate,
  onClose,
}: {
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-3">Nova sala</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex.: geral"
          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded border" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => onCreate(name.trim())}
            disabled={!name.trim()}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
