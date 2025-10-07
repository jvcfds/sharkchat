import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { ChatRoom } from "./components/ChatRoom";

function MainApp() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [stage, setStage] = useState<"splash" | "login" | "chat">("splash");
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [room, setRoom] = useState("geral");

  // Splash 3.5s e já prepara o fundo (evita flash branco/pretão)
  useEffect(() => {
    document.body.classList.add("dark"); // inicia no escuro
    const t = setTimeout(() => setStage("login"), 3500);
    return () => clearTimeout(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.classList.toggle("dark", next === "dark");
  };

  const handleLogin = (u: { id: string; name: string }) => {
    // força um micro fade sem apagar o fundo
    setUser(u);
    setStage("chat");
  };

  const handleLogout = () => {
    setUser(null);
    setRoom("geral");
    setStage("login");
  };

  // container de fundo SEMPRE presente
  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className={`min-h-screen w-full ${
        theme === "dark" ? "bg-[#000C13] text-[#E9D8A6]" : "bg-[#F2F7F8] text-[#003847]"
      } transition-theme`}
    >
      {children}
    </div>
  );

  if (stage === "splash") {
    return (
      <Shell>
        <Splash />
      </Shell>
    );
  }

  if (stage === "login" || !user) {
    return (
      <Shell>
        <div className="h-screen w-full flex items-center justify-center">
          <Login onLogin={handleLogin} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="h-screen w-full flex">
        <Sidebar
          user={user}
          currentRoom={room}
          onSelectRoom={setRoom}
          onLogout={handleLogout}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
        <div className="flex-1">
          <ChatRoom room={room} username={user.name} />
        </div>
      </div>
    </Shell>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
