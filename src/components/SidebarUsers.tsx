export default function SidebarUsers({ users }: { users: string[] }) {
  return (
    <aside className="hidden md:flex w-56 flex-col border-l border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40">
      <div className="p-3">
        <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Online ({users.length})</h4>
        {users.length === 0 ? (
          <div className="text-sm text-slate-500">Ninguém online.</div>
        ) : (
          <ul className="space-y-1">
            {users.map((u) => (
              <li key={u} className="text-sm text-slate-800 dark:text-slate-100">• {u}</li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
