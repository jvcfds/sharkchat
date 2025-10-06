// Gera cor e inicial do nome
export function getAvatar(user: string) {
  const colors = [
    "bg-pink-500", "bg-green-500", "bg-blue-500", "bg-purple-500",
    "bg-yellow-500", "bg-red-500", "bg-indigo-500", "bg-cyan-500"
  ];
  const hash = user.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initial = user[0]?.toUpperCase() || "?";
  return { color, initial };
}
