import { useEffect, useMemo, useState } from "react";
import Sidebar from "@components/Sidebar";
import ChatRoom from "@components/ChatRoom";
import Login from "@components/Login";
import SplashScreen from "@components/SplashScreen";
import { applyTheme, getInitialTheme } from "@lib/theme";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string>(""); // começa sem sala
  const [theme, setTheme] = useState(getInitialTheme());
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Aplica o tema inicial (escuro/claro)
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // ✅ Lê o nome salvo localmente (pra login persistente)
  useEffect(() => {
    const savedName = localStorage.getItem("sharkchat_username");
    if (savedName) setUsername(savedName);
  }, []);

  // ✅ Tenta carregar ou criar a sala "geral" ao iniciar
  useEffect(() => {
    async function ensureGeneralRoom() {
      try {
        const res = await fetch("http://localhost:8080/rooms");
        const data = await res.json();
        const general = data.find((r: any) => r.name === "geral");
        if (general) {
          setCurrentRoom(general.id);
        } else {
          const res2 = await fetch("http://localhost:8080/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "geral",
              creator: localStorage.getItem("sharkchat_userid") || "system",
            }),
          });
          const roomData = await res2.json();
          setCurrentRoom(roomData.id);
        }
      } catch (err) {
        console.error("Erro ao garantir sala geral:", err);
      }
    }

    if (username) ensureGeneralRoom();
  }, [username]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // ✅ Quando o login for feito
  const handleLogin = (name: string) => {
    setUsername(name);
    localStorage.setItem("sharkchat_username", name);
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("sharkchat_username");
    localStorage.removeItem("sharkchat_userid");
    setUsername(null);
    setCurrentRoom("");
  };

  // ✅ Layout principal do chat
  const chatLayout = useMemo(
    () => (
      <div className="flex h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 transition-colors duration-500">
        {/* Sidebar */}
        <AnimatePresence>
          <motion.div
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="fixed z-40 md:static md:flex h-full"
          >
            <Sidebar
              currentRoom={currentRoom}
              setCurrentRoom={setCurrentRoom}
              username={username!}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </motion.div>
        </AnimatePresence>

        {/* Área principal */}
        <div className="flex-1 flex flex-col">
          {currentRoom ? (
            <ChatRoom
              room={currentRoom}
              username={username!}
              theme={theme}
              toggleTheme={toggleTheme}
              openSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Selecione ou crie uma sala à esquerda.
            </div>
          )}
        </div>
      </div>
    ),
    [sidebarOpen, currentRoom, username, theme]
  );

  // ✅ Splash + Login + Chat
  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <AnimatePresence mode="wait">
          {!username ? (
            // Tela de login
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          ) : (
            // Tela principal (Chat)
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              {chatLayout}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
