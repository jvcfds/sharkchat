import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// 🧠 Banco SQLite
let db;
(async () => {
  db = await open({
    filename: "./sharkchat.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creator TEXT NOT NULL
    )
  `);

  // 🔹 Garante que a sala "geral" exista
  const geral = await db.get("SELECT * FROM rooms WHERE name = ?", ["geral"]);
  if (!geral) {
    await db.run(
      "INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)",
      [uuidv4(), "geral", "system"]
    );
    console.log("✅ Sala geral criada automaticamente.");
  }

  console.log("✅ Banco SQLite conectado.");
})();

// 🔌 Servidor HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Armazenamento temporário em memória
const rooms = {};
const creators = {};

// 🧾 LOGIN — gera ID e salva localmente
app.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Nome inválido" });
  }

  // Se o usuário já tiver ID salvo no navegador, reutiliza
  const existingId = req.headers["x-user-id"];
  const id = existingId || uuidv4();

  res.json({ id, name });
});

// 📜 LISTAR SALAS
app.get("/rooms", async (_, res) => {
  try {
    const all = await db.all("SELECT * FROM rooms");
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar salas." });
  }
});

// ➕ CRIAR SALA
app.post("/rooms", async (req, res) => {
  const { name, creator } = req.body;
  if (!name || !creator)
    return res.status(400).json({ error: "Dados inválidos" });

  if (name.toLowerCase() === "geral") {
    return res.status(400).json({ error: "A sala 'geral' já existe e é fixa." });
  }

  try {
    const id = uuidv4();
    await db.run("INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)", [
      id,
      name,
      creator,
    ]);
    rooms[id] = [];
    creators[id] = creator;
    res.json({ id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar sala." });
  }
});

// 🗑️ EXCLUIR SALA (somente criador)
app.delete("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id || !userId)
    return res.status(400).json({ error: "Dados inválidos." });

  try {
    const room = await db.get("SELECT * FROM rooms WHERE id = ?", [id]);
    if (!room)
      return res.status(404).json({ error: "Sala não encontrada." });

    if (room.name === "geral")
      return res.status(400).json({ error: "A sala 'geral' não pode ser excluída." });

    // 🔹 Corrigido: comparação correta do criador
    if (room.creator.trim() !== userId.trim()) {
      console.log(`Tentativa de exclusão negada: ${userId} ≠ ${room.creator}`);
      return res.status(403).json({ error: "Apenas o criador pode excluir esta sala." });
    }

    await db.run("DELETE FROM rooms WHERE id = ?", [id]);
    delete rooms[id];
    delete creators[id];

    console.log(`🗑️ Sala "${room.name}" excluída por ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir sala:", err);
    res.status(500).json({ error: "Erro interno ao excluir sala." });
  }
});

// 🌐 WEBSOCKET
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/", ""));
  const room = params.get("room");
  const id = params.get("id");
  const name = params.get("name");

  if (!room || !id || !name) return;

  ws.room = room;
  ws.id = id;
  ws.name = name;

  if (!rooms[room]) rooms[room] = [];
  if (!creators[room]) creators[room] = id;

  console.log(`🟢 ${name} entrou na sala ${room}`);

  ws.send(JSON.stringify({ type: "history", messages: rooms[room] }));
  broadcast(room, {
    type: "system",
    text: `${name} entrou na sala.`,
    users: getUsersInRoom(room),
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "message") {
        const message = {
          id: uuidv4(),
          user: name,
          text: msg.text,
          image: msg.image || null,
          time: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };
        rooms[room].push(message);
        broadcast(room, { type: "message", ...message });
      }

      if (msg.type === "typing") {
        broadcast(room, { type: "typing", user: name }, ws);
      }

      if (msg.type === "clear" && creators[room] === id) {
        rooms[room] = [];
        broadcast(room, {
          type: "system",
          clear: true,
          text: "💨 O criador limpou o chat.",
        });
      }
    } catch (e) {
      console.error("Erro ao processar mensagem:", e);
    }
  });

  ws.on("close", () => {
    console.log(`🔴 ${name} saiu da sala ${room}`);
    broadcast(room, {
      type: "system",
      text: `${name} saiu da sala.`,
      users: getUsersInRoom(room),
    });
  });
});

// 🔁 Broadcast
function broadcast(room, data, exclude) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === room && client !== exclude) {
      client.send(JSON.stringify(data));
    }
  });
}

// 👥 Usuários online
function getUsersInRoom(room) {
  const users = [];
  wss.clients.forEach((c) => {
    if (c.room === room && c.name) users.push(c.name);
  });
  return users;
}

// ✅ Página inicial para Railway
app.get("/", (req, res) => {
  res.send(`
    <h1>🦈 SharkChat servidor rodando!</h1>
    <p>HTTP ativo em <strong>${req.hostname}</strong></p>
    <p>WebSocket ativo em <code>wss://${req.hostname}</code></p>
  `);
});

// 🚀 Inicializa servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SharkChat rodando:
HTTP → http://localhost:${PORT}
WS   → ws://localhost:${PORT}`);
});
