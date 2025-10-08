import React from "react";

interface Props {
  userName: string;
  setUserName: (s: string) => void;
  onEnter: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function LoginCard({ userName, setUserName, onEnter, loading, error }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#041923] to-[#031219] text-white p-6">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-900/40 bg-[#0b1f29]/60 backdrop-blur-xl shadow-2xl p-10">
        <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-teal-400 text-center drop-shadow-lg">
          SharkChat
        </h1>
        <p className="mt-3 text-center text-cyan-200/80">mergulhe na conversa</p>

        <div className="mt-10 space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="Digite seu nome..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEnter()}
            className="w-full px-4 py-3 rounded-2xl bg-[#0b1f29] border border-cyan-900/50 text-white placeholder-cyan-200/50 outline-none focus:ring-2 focus:ring-cyan-500/70"
          />
          {loading && <p className="text-center text-cyan-300 animate-pulse">Conectando…</p>}
          {error && <p className="text-center text-yellow-300/80">{error}</p>}
          <button
            onClick={onEnter}
            disabled={loading || !userName.trim()}
            className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-60 transition-all"
          >
            ↳ Entrar
          </button>
        </div>

        <p className="text-center text-cyan-200/70 mt-8">
          Feito por <span className="text-cyan-300 font-semibold">Victor</span>
        </p>
      </div>
    </div>
  );
}
