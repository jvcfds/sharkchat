import { motion } from "framer-motion";

export function Splash() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000C13]">
      {/* Luz subaquática sutil (gradiente em movimento) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0, 173, 181, 0.18), transparent 60%), radial-gradient(1000px 500px at 30% 110%, rgba(10,147,150,0.10), transparent 60%), linear-gradient(180deg, #00121A 0%, #000C13 60%)",
        }}
        animate={{ backgroundPosition: ["0% 0%, 0% 0%, 0% 0%", "100% 20%, 0% 100%, 0% 0%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Marca SharkChat (apenas tipografia, sem ícone) */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center select-none">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-wide text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #9ff1f6 0%, #43c1c4 45%, #0A9396 100%)",
            filter: "drop-shadow(0 0 24px rgba(67, 193, 196, 0.25))",
          }}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          SharkChat
        </motion.h1>

        {/* Linha de brilho minimal */}
        <motion.div
          className="mt-4 h-[2px] w-48 rounded-full bg-cyan-400/50"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        />

        <motion.p
          className="mt-5 text-cyan-50/80 tracking-wide"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          mergulhe na conversa
        </motion.p>
      </div>

      {/* Glow difuso girando (bem sutil) */}
      <motion.div
        className="absolute -right-40 -bottom-40 w-[520px] h-[520px] rounded-full bg-cyan-700/10 blur-3xl"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
