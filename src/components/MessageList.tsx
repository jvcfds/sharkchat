export default function MessageList({
  messages,
  typingUsers,
}: {
  messages: any[];
  typingUsers: string[];
}) {
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="max-w-[72ch]">
          <div className="text-xs text-slate-500 mb-1">
            <b className="text-slate-800 dark:text-slate-200">{m.user}</b>{" "}
            <span className="opacity-70">{new Date(m.time || Date.now()).toLocaleTimeString()}</span>
          </div>
          {m.text && (
            <div className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {m.text}
            </div>
          )}
          {m.image && (
            <img src={m.image} alt="img" className="mt-2 max-w-xs rounded border border-slate-300 dark:border-slate-700" />
          )}
        </div>
      ))}
      {typingUsers.length > 0 && (
        <div className="text-sm text-slate-500">{typingUsers.join(", ")} está digitando...</div>
      )}
    </div>
  );
}
