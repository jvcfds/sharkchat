import { useState } from "react";

export default function MessageInput({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (payload: { type: "message"; text: string; image?: string | null }) => void;
  onTyping?: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const send = () => {
    const t = text.trim();
    if (!t && !image) return;
    onSend({ type: "message", text: t, image });
    setText("");
    setImage(null);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return alert("Imagem muito grande (máx 3MB)");
    const fr = new FileReader();
    fr.onload = () => setImage(fr.result as string);
    fr.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="p-3 border-t border-slate-300 dark:border-slate-700 flex items-center gap-2 bg-white dark:bg-slate-900">
      <label className={`cursor-pointer text-sm px-2 py-1 rounded border ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        📎
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onPick} />
      </label>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          } else {
            onTyping?.();
          }
        }}
        placeholder={disabled ? "Conectando..." : "Digite uma mensagem..."}
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-slate-100"
      />

      <button
        onClick={send}
        disabled={disabled}
        className={`px-3 py-2 rounded text-white ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        Enviar
      </button>

      {image && <img src={image} alt="preview" className="w-10 h-10 object-cover rounded border border-gray-400" />}
    </div>
  );
}
