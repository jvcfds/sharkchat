import React from "react";

export default function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#041923] to-[#031219] text-white p-6">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-900/40 bg-[#0b1f29]/60 backdrop-blur-xl shadow-2xl p-10 text-center">
        <h1 className="splash-title text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-teal-400 drop-shadow-lg">
          SharkChat
        </h1>
        <p className="splash-sub mt-3 text-cyan-200/80">mergulhe na conversa</p>
      </div>
    </div>
  );
}
