import { useEffect, useState } from "react";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { ChatRoom } from "./components/ChatRoom"; // opcional, se já quiser pular o login

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // ⏱️ Aumenta o tempo do splash para 3.5s
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000C13] text-[#E9D8A6] transition-all duration-700">
      {showSplash ? (
        <div className="splash-enter">
          <Splash />
        </div>
      ) : !user ? (
        <Login onLogin={(u) => setUser(u)} />
      ) : (
        <ChatRoom room="geral" username={user.name} />
      )}
    </div>
  );
}
