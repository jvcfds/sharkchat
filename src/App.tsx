import { useState } from "react";
import Sidebar from "@components/Sidebar";
import ChatRoom from "@components/ChatRoom";

export default function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const username = localStorage.getItem("sharkchat_username") || "Convidado";

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-950 text-white overflow-hidden">
      {/* Sidebar responsiva */}
      <Sidebar
        currentRoom={currentRoom || ""}
        setCurrentRoom={setCurrentRoom}
        username={username}
      />

      {/* Área principal */}
      <main className="flex-1 h-full">
        {currentRoom ? (
          <ChatRoom room={currentRoom} username={username} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Selecione uma sala para começar a conversar 🦈
          </div>
        )}
      </main>
    </div>
  );
}
