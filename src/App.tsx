import React, { useEffect, useMemo, useState } from "react";
import ChatRoom from "./ChatRoom";
import Sidebar from "./components/Sidebar";
import Splash from "./components/Splash";
import LoginCard from "./components/LoginCard";
import { getServerHttp } from "./lib/ws";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);           // splash
  const [userName, setUserName] = useState<string>(localStorage.getItem("userName") || "");
  const [entered, setEntered] = useState<boolean>(false);       // SEM auto-enter
  const [room, setRoom] = useState<string>("geral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverHttp = useMemo(() => getServerHttp(), []);

  // Splash de 2.5s
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = async () => {
    setError(null);
    if (!userName.trim()) return;
    setLoading(true);
    try {
      // Ping opcional (não bloqueia)
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
    <div className="flex min-h-screen bg-[#061720] text-white">
      <Sidebar
        serverHttp={serverHttp}
        currentRoom={room}
        onSelectRoom={setRoom}
        userName={userName}
      />
      <div className="flex-1">
        <ChatRoom room={room} userName={userName} serverHttp={serverHttp} />
      </div>
    </div>
  );
}
