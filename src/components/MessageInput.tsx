import { useState } from "react";
import { Paperclip } from "lucide-react";

export default function MessageInput({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (msg: { text?: string; image?: string }) => void;
  onTyping: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    onSend({ text: text.trim(), image });
    setText("");
    setImage(undefined);
  };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 p-3">
      <label className="grid place-items-center w-10 shrink-0 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input type="file" className="hidden" onChange={pickImage} accept="image/*" />
        <Paperclip size={16} />
      </label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={() => onTyping()}
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        placeholder="Digite uma mensagem…"
      />
      <button disabled={disabled} className="px-4 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
        Enviar
      </button>
    </form>
  );
}