import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const db = new Database("./sharkchat.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator TEXT NOT NULL
  )
`).run();

const geral = db.prepare("SELECT * FROM rooms WHERE name = ?").get("geral");
if (!geral) {
  db.prepare("INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)").run(
    uuidv4(),
    "geral",
    "system"
  );
  console.log("✅ Sala 'geral' criada automaticamente.");
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const memMessages = {};
const usersByRoom = {};
const typingUsers = {}; // { room: Set(names) }

function broadcast(room, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === room) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastUsers(room) {
  const users = Array.from(wss.clients)
    .filter((c) => c.readyState === 1 && c.room === room)
    .map((c) => c.name);
  broadcast(room, { type: "users", users });
}

function broadcastTyping(room) {
  broadcast(room, {
    type: "typing",
    users: Array.from(typingUsers[room] || []),
  });
}

app.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nome inválido" });
  res.json({ id: uuidv4(), name });
});

app.get("/rooms", (_, res) => {
  res.json(db.prepare("SELECT * FROM rooms").all());
});

app.post("/rooms", (req, res) => {
  const { name, creator } = req.body;
  if (!name || !creator) return res.status(400).json({ error: "Dados inválidos" });
  if (name.toLowerCase() === "geral") return res.status(400).json({ error: "A sala 'geral' já existe." });

  const id = uuidv4();
  db.prepare("INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)").run(id, name, creator);
  console.log(`📦 Nova sala criada: "${name}" por ${creator}`);
  res.json({ id, name });
});

app.delete("/rooms/:id", (req, res) => {
  const { id } = req.params;
  const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(id);
  if (!room) return res.status(404).json({ error: "Sala não encontrada" });
  if (room.name.toLowerCase() === "geral") return res.status(400).json({ error: "A sala 'geral' não pode ser excluída." });

  db.prepare("DELETE FROM rooms WHERE id = ?").run(id);
  delete memMessages[room.name];
  console.log(`🗑️ Sala "${room.name}" excluída.`);
  res.json({ ok: true });
});

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/", ""));
  const room = params.get("room");
  const name = params.get("name");
  if (!room || !name) return;

  ws.room = room;
  ws.name = name;

  if (!memMessages[room]) memMessages[room] = [];
  usersByRoom[room] = usersByRoom[room] || new Set();
  typingUsers[room] = typingUsers[room] || new Set();

  usersByRoom[room].add(name);
  ws.send(JSON.stringify({ type: "history", messages: memMessages[room] }));
  broadcastUsers(room);

  console.log(`👤 ${name} entrou na sala "${room}"`);

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "message") {
        const message = {
          id: uuidv4(),
          user: name,
          text: msg.text || "",
          image: msg.image || null,
          time: new Date().toLocaleTimeString(),
        };
        memMessages[room].push(message);
        broadcast(room, { type: "message", ...message });
      }

      // ✏️ Usuário está digitando
      if (msg.type === "typing") {
        typingUsers[room].add(name);
        broadcastTyping(room);
      }

      // ✋ Parou de digitar
      if (msg.type === "stop_typing") {
        typingUsers[room].delete(name);
        broadcastTyping(room);
      }
    } catch (err) {
      console.error("❌ Erro ao processar mensagem:", err);
    }
  });

  ws.on("close", () => {
    usersByRoom[room]?.delete(name);
    typingUsers[room]?.delete(name);
    broadcastUsers(room);
    broadcastTyping(room);
    broadcast(room, { type: "system", text: `${name} saiu da sala.` });
  });
});

app.get("/", (_, res) => res.send("<h1>🦈 SharkChat rodando!</h1>"));

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SharkChat rodando em http://localhost:${PORT}`);
});
