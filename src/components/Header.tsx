import { Moon, Sun } from "lucide-react";

export default function Header({
  roomName,
  users,
  theme,
  toggleTheme,
  onLogout,
}: {
  roomName: string;
  users: string[];
  theme?: "light" | "dark";
  toggleTheme?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur dark:bg-slate-950/80">
      <h2 className="text-lg font-semibold text-slate-100">#{roomName}</h2>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-300">{users.length} online</span>

        {toggleTheme && (
          <button
            onClick={toggleTheme}
            className="text-slate-300 hover:text-blue-400 transition"
            title="Alternar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            sair
          </button>
        )}
      </div>
    </div>
  );
}