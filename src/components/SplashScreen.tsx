import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  // 🎵 Função para tocar sons de entrada e saída
  const playSound = (url: string, volume = 0.4) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    // Som de entrada
    playSound("/sounds/intro.mp3", 0.3);

    // Timer para fade-out suave
    const timeout = setTimeout(() => {
      setFadingOut(true);
      playSound("/sounds/whoosh.mp3", 0.35);

      // Após o fade, fecha o splash e mostra o chat
      setTimeout(() => {
        setVisible(false);
        onFinish();
      }, 1200);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="
            fixed inset-0 z-[9999]
            flex flex-col items-center justify-center
            overflow-hidden
            text-white
            bg-gradient-to-b from-blue-900 to-black
            animate-gradient
          "
        >
          {/* === Fundo animado === */}
          <style>{`
            @keyframes gradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient {
              background: linear-gradient(-45deg, #020617, #0f172a, #1e3a8a, #0c4a6e);
              background-size: 400% 400%;
              animation: gradientFlow 8s ease infinite;
            }
          `}</style>

          {/* === Ondas suaves no rodapé === */}
          <div className="absolute bottom-0 w-full">
            <svg
              className="animate-pulse opacity-25"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#3b82f6"
                d="M0,192L60,208C120,224,240,256,360,245.3C480,235,600,181,720,160C840,139,960,149,1080,160C1200,171,1320,181,1380,186.7L1440,192V320H0Z"
              ></path>
            </svg>
          </div>

          {/* === Texto SharkChat com brilho e fade-out === */}
          <motion.h1
            animate={{
              y: [0, -10, 0, 10, 0],
              opacity: fadingOut ? [1, 0.5, 0] : [1, 0.95, 1],
              scale: fadingOut ? [1, 1.2, 0.8] : [1, 1.02, 1],
              textShadow: [
                "0 0 6px #3b82f6",
                "0 0 14px #60a5fa",
                "0 0 6px #3b82f6",
              ],
            }}
            transition={{
              duration: fadingOut ? 1.2 : 4,
              ease: "easeInOut",
              repeat: fadingOut ? 0 : Infinity,
            }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-blue-200 drop-shadow-lg text-center"
          >
            SharkChat
          </motion.h1>

          {/* === camada escura de fade === */}
          {fadingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-black"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
