import React, { useEffect, useMemo, useState } from "react";
import ChatRoom from "./ChatRoom";
import Sidebar from "./components/Sidebar";
import Splash from "./components/Splash";
import LoginCard from "./components/LoginCard";
import { getServerHttp } from "./lib/ws";
import { Menu } from "lucide-react"; // ícone ☰

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userName, setUserName] = useState<string>(
    localStorage.getItem("userName") || ""
  );
  const [entered, setEntered] = useState<boolean>(false);
  const [room, setRoom] = useState<string>("geral");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverHttp = useMemo(() => getServerHttp(), []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = async () => {
    setError(null);
    if (!userName.trim()) return;
    setLoading(true);
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 2000);
      await fetch(serverHttp + "/", { signal: ctrl.signal }).catch(() => {});
      clearTimeout(to);
    } finally {
      localStorage.setItem("userName", userName);
      setEntered(true);
      setLoading(false);
    }
  };

  if (showSplash) return <Splash />;

  if (!entered) {
    return (
      <LoginCard
        userName={userName}
        setUserName={setUserName}
        onEnter={handleEnter}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#061720] text-white relative overflow-hidden">
      {/* Botão menu mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-[#0b1f29]/80 border border-cyan-900/50 hover:bg-[#113746]/60 transition"
      >
        <Menu className="w-6 h-6 text-cyan-300" />
      </button>

      {/* Sidebar fixa no desktop */}
      <div
        className={`fixed md:static top-0 left-0 h-full md:h-auto bg-[#0b1f29]/80 backdrop-blur-md border-r border-cyan-900/40 z-20 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          serverHttp={serverHttp}
          currentRoom={room}
          onSelectRoom={(r) => {
            setRoom(r);
            setSidebarOpen(false); // fecha ao clicar no mobile
          }}
          userName={userName}
        />
      </div>

      {/* Área principal */}
      <div className="flex-1 md:ml-64">
        <ChatRoom room={room} userName={userName} serverHttp={serverHttp} />
      </div>
    </div>
  );
}
