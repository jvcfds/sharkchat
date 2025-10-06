import { useState } from "react";

interface LoginProps {
  onLogin: (name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Digite um nome válido.");

    try {
      // Detecta ambiente automaticamente
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const API_URL = isLocalhost
        ? "http://localhost:8080"
        : "https://sharkchat-production.up.railway.app";

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Falha ao conectar com o servidor.");
      const data = await res.json();

      localStorage.setItem("sharkchat_username", data.name);
      localStorage.setItem("sharkchat_userid", data.id);

      onLogin(data.name);
    } catch (err) {
      console.error(err);
      setError("Falha ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl shadow-xl p-8 w-80 text-center"
      >
        <h1 className="text-2xl font-bold text-blue-400 mb-3">SharkChat</h1>
        <p className="text-sm text-slate-400 mb-5">
          Escolha um nome para conversar com a galera 🦈
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome..."
          className="w-full px-3 py-2 rounded bg-slate-900 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
