import { Moon, Sun, Users } from "lucide-react";

interface HeaderProps {
  room: string;
  theme: string;
  toggleTheme: () => void;
  usersOnline: string[];
}

export default function Header({
  room,
  theme,
  toggleTheme,
  usersOnline,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 backdrop-blur transition-colors">
      {/* Nome da sala */}
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        #{room}
      </h2>

      {/* Seção direita */}
      <div className="flex items-center gap-4">
        {/* Usuários online */}
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-sm">
          <Users size={16} />
          <span>{usersOnline.length}</span>
          <span className="hidden sm:inline">online</span>
        </div>

        {/* Botão de tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-slate-200" />
          ) : (
            <Moon size={18} className="text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
