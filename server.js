import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sharkchat-rouge.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/* ---------- DB ---------- */
const db = new Database("./sharkchat.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    creator TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    user TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL
  )
`).run();

function ensureRoom(name, creator = "system") {
  let r = db.prepare("SELECT * FROM rooms WHERE name = ?").get(name);
  if (!r) {
    db.prepare("INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)").run(uuidv4(), name, creator);
    r = db.prepare("SELECT * FROM rooms WHERE name = ?").get(name);
  }
  return r;
}

ensureRoom("geral");

/* ---------- PRESENÇA ---------- */
const roomClients = new Map(); // Map<string, Set<WebSocket>>

function addClientToRoom(room, ws) {
  if (!roomClients.has(room)) roomClients.set(room, new Set());
  roomClients.get(room).add(ws);
  broadcastPresence(room);
}

function removeClientFromRoom(room, ws) {
  const set = roomClients.get(room);
  if (set) {
    set.delete(ws);
    broadcastPresence(room);
  }
}

function broadcast(room, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === room) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastPresence(room) {
  const count = roomClients.has(room) ? roomClients.get(room).size : 0;
  broadcast(room, { type: "presence", room, count });
}

/* ---------- WS ---------- */
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/", ""));
  const room = params.get("room");
  const id = params.get("id");
  const name = params.get("name");
  if (!room || !id || !name) return;

  ensureRoom(room);
  ws.room = room;
  ws.name = name;

  addClientToRoom(room, ws);

  const history = db.prepare("SELECT * FROM messages WHERE room = ? ORDER BY time ASC").all(room);
  ws.send(JSON.stringify({ type: "history", messages: history }));

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "message") {
        const message = {
          id: uuidv4(),
          user: name,
          text: msg.text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        db.prepare("INSERT INTO messages (id, room, user, text, time) VALUES (?, ?, ?, ?, ?)")
          .run(message.id, room, message.user, message.text, message.time);
        broadcast(room, { type: "message", ...message });
      }
    } catch (err) { console.error("Erro ao processar mensagem:", err); }
  });

  ws.on("close", () => {
    removeClientFromRoom(room, ws);
    broadcast(room, { type: "system", text: `${name} saiu da sala.` });
  });

  ws.on("error", (err) => console.error("Erro WS:", err));
});

/* ---------- REST ---------- */
app.get("/", (_, res) => res.send("<h1>🦈 SharkChat servidor rodando!</h1>"));

app.get("/rooms", (_, res) => {
  const rows = db.prepare("SELECT name, creator FROM rooms ORDER BY name ASC").all();
  res.json({ rooms: rows });
});

app.post("/rooms", (req, res) => {
  const name = String((req.body?.name || "")).trim().toLowerCase();
  const creator = String((req.body?.creator || "anon")).trim();
  if (!name || name.length > 32) return res.status(400).json({ error: "Nome inválido" });

  try {
    ensureRoom(name, creator || "anon");
    return res.json({ ok: true, name, creator });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao criar sala" });
  }
});

app.delete("/rooms/:name", (req, res) => {
  const name = String(req.params.name || "").trim().toLowerCase();
  const by = String((req.body?.by || req.query?.by || "")).trim();
  if (!name || !by) return res.status(400).json({ error: "Requisição inválida" });

  const r = db.prepare("SELECT * FROM rooms WHERE name = ?").get(name);
  if (!r) return res.status(404).json({ error: "Sala não encontrada" });
  if (r.creator !== by) return res.status(403).json({ error: "Apenas o criador pode excluir" });

  // fecha conexões daquela sala
  const set = roomClients.get(name);
  if (set) {
    set.forEach((client) => {
      try { client.close(); } catch {}
    });
    roomClients.delete(name);
  }

  db.prepare("DELETE FROM messages WHERE room = ?").run(name);
  db.prepare("DELETE FROM rooms WHERE name = ?").run(name);
  return res.json({ ok: true });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SharkChat rodando na porta ${PORT}`);
});
