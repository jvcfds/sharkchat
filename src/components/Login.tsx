import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

interface LoginProps {
  onLogin: (user: { id: string; name: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!name.trim()) {
      setError("Digite seu nome para entrar 🦈");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no servidor");

      onLogin(data);
    } catch (err: any) {
      setError(err.message || "Falha ao conectar com o servidor 🛠️");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full bg-[#000C13] overflow-hidden">
      {/* Fundo animado (gradiente sutil oceano profundo) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0, 173, 181, 0.16), transparent 60%), radial-gradient(1000px 500px at 30% 110%, rgba(10,147,150,0.08), transparent 60%), linear-gradient(180deg, #00121A 0%, #000C13 60%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Marca */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text z-10 select-none"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #9ff1f6 0%, #43c1c4 45%, #0A9396 100%)",
          filter: "drop-shadow(0 0 24px rgba(67,193,196,0.25))",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        SharkChat
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        className="mt-3 text-cyan-100/80 text-sm md:text-base z-10 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        mergulhe na conversa
      </motion.p>

      {/* Container do formulário */}
      <motion.div
        className="z-10 mt-10 w-[90%] max-w-[400px] flex flex-col items-center gap-4 bg-[#001B26]/60 p-6 rounded-2xl border border-[#0A9396]/40 backdrop-blur-md shadow-[0_4px_25px_rgba(10,147,150,0.15)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        {/* Campo nome */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Digite seu nome"
          className="w-full px-4 py-3 rounded-lg bg-[#002733]/90 text-[#E9D8A6] border border-[#0A9396]/40 placeholder-[#E9D8A6]/40 focus:ring-2 focus:ring-[#0A9396] focus:outline-none transition"
          disabled={loading}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Botão entrar */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#0A9396] hover:bg-[#0a7f83] text-white font-semibold px-4 py-3 rounded-lg shadow-md transition disabled:opacity-60"
        >
          {loading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"
              aria-label="Carregando"
            />
          ) : (
            <>
              <LogIn size={18} />
              Entrar
            </>
          )}
        </button>
      </motion.div>

      {/* Luz suave de fundo */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-700/10 blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
