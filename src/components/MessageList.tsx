export default function MessageList({
  messages,
  typingUsers,
}: {
  messages: { id: string; user: string; text: string; image?: string | null; time: string }[];
  typingUsers: string[];
}) {
  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div key={m.id} className="max-w-[70ch]">
          <div className="text-xs opacity-60 mb-0.5">
            <b className="opacity-100">{m.user}</b> {m.time}
          </div>
          {m.image ? (
            <img src={m.image} alt="anexo" className="rounded mb-1 max-w-full" />
          ) : null}
          {m.text && (
            <div className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-800 whitespace-pre-wrap">
              {m.text}
            </div>
          )}
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="text-xs opacity-60">digitando: {typingUsers.join(", ")}</div>
      )}
    </div>
  );
}