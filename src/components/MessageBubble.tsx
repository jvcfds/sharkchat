interface Message {
  id: string;
  user: string;
  text: string;
  image?: string | null;
  time: string;
  type?: string;
}

export default function MessageBubble({ m, me }: { m: Message; me: boolean }) {
  return (
    <div className={`max-w-[80%] mb-3 ${me ? "ml-auto text-right" : ""}`}>
      <div className={`inline-block rounded-2xl px-3 py-2 ${me ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"}`}>
        <div className="text-xs opacity-80 mb-1">{m.user} • {new Date(m.time).toLocaleTimeString()}</div>
        {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
        {m.image && (
          <img
            src={m.image}
            alt="imagem"
            className="mt-2 rounded-lg max-h-64 border border-slate-300 dark:border-slate-700"
          />
        )}
      </div>
    </div>
  );
}
