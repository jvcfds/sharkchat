import { Moon, Sun, Users } from "lucide-react";

export default function Header({
  room,
  theme,
  toggleTheme,
  usersOnline,
}: {
  room: string;
  theme: string;
  toggleTheme: () => void;
  usersOnline: string[];
}) {
  const roomName = room?.startsWith("#") ? room : `#${room}`;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-sm">
      {/* Nome da sala */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-wide">
        {roomName}
      </h2>

      {/* Área da direita: usuários online + tema */}
      <div className="flex items-center gap-4">
        {/* Usuários online */}
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Users size={16} />
          <span className="text-sm">{usersOnline.length} online</span>
          {usersOnline.length > 0 && (
            <div className="flex gap-1">
              {usersOnline.map((user, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-xs rounded"
                >
                  {user}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Alternar tema */}
        <button
          onClick={toggleTheme}
          className="text-slate-700 dark:text-slate-300 hover:text-blue-500 transition"
          title="Alternar tema"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
}
