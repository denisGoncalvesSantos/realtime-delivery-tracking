// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { sequelize, EntregadorPG, RotaPG, CheckpointPG } = require("./models_pg");

const app = express();

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());

// =====================
// Servir FRONTEND
// =====================
app.use(express.static(path.join(__dirname, "frontend")));

// =====================
// Postgres (Sequelize)
// =====================
sequelize
  .authenticate()
  .then(() => console.log("✅ Sequelize conectado no Postgres (server)"))
  .catch((err) => console.error("❌ Erro Postgres:", err.message));

// =====================
// Helpers
// =====================
function toFrontendShape(entregadorRow, rotaRow, checkpointRows, historicoRows) {
  const idStr = String(entregadorRow.id);

  const rota = rotaRow
    ? {
        inicio:
          rotaRow.inicio_lat != null && rotaRow.inicio_lng != null
            ? { latitude: Number(rotaRow.inicio_lat), longitude: Number(rotaRow.inicio_lng) }
            : null,
        checkpoints: (checkpointRows || [])
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((cp) => ({
            latitude: cp.latitude != null ? Number(cp.latitude) : null,
            longitude: cp.longitude != null ? Number(cp.longitude) : null,
          })),
        fim:
          rotaRow.fim_lat != null && rotaRow.fim_lng != null
            ? { latitude: Number(rotaRow.fim_lat), longitude: Number(rotaRow.fim_lng) }
            : null,
      }
    : null;

  const localizacaoAtual =
    entregadorRow.current_lat != null && entregadorRow.current_lng != null
      ? { latitude: Number(entregadorRow.current_lat), longitude: Number(entregadorRow.current_lng) }
      : null;

  const historicoLocalizacao = (historicoRows || []).map((h) => ({
    latitude: Number(h.latitude),
    longitude: Number(h.longitude),
  }));

  return {
    // mantém compatibilidade com seu frontend atual
    _id: idStr,
    id: entregadorRow.id,
    nome: entregadorRow.nome,
    status: entregadorRow.status,
    localizacaoAtual,
    historicoLocalizacao,
    rota,
  };
}

async function readHistorico(entregadorId, limit = 200) {
  // query simples via sequelize.query para não criar Model extra agora
  const [rows] = await sequelize.query(
    `
    SELECT latitude, longitude
    FROM entregador_localizacoes
    WHERE entregador_id = :id
    ORDER BY created_at DESC
    LIMIT :limit
    `,
    {
      replacements: { id: entregadorId, limit },
    }
  );

  // vem do mais novo pro mais velho; inverte pro desenho ficar “caminho”
  return rows.reverse();
}

// =====================
// Rotas REST
// =====================
app.get("/api/health", (req, res) => {
  res.send("API funcionando! 🚀 (Postgres)");
});

/**
 * GET /entregadores
 * query:
 *  - status=ativo|inativo
 *  - q=texto
 *  - limit=numero
 */
app.get("/entregadores", async (req, res) => {
  try {
    const { status, q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 500);

    const where = {};
    if (status && ["ativo", "inativo"].includes(status)) where.status = status;
    if (q && String(q).trim()) where.nome = { [require("sequelize").Op.iLike]: `%${String(q).trim()}%` };

    const entregadores = await EntregadorPG.findAll({ where, limit, order: [["id", "ASC"]] });

    const result = [];
    for (const ent of entregadores) {
      const rota = await RotaPG.findOne({ where: { entregador_id: ent.id } });
      const checkpoints = rota ? await CheckpointPG.findAll({ where: { rota_id: rota.id } }) : [];
      const historico = await readHistorico(ent.id, 200);

      result.push(toFrontendShape(ent, rota, checkpoints, historico));
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Erro GET /entregadores:", err.message);
    res.status(500).json({ error: "Erro ao buscar entregadores" });
  }
});

app.get("/entregadores/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

    const ent = await EntregadorPG.findByPk(id);
    if (!ent) return res.status(404).json({ error: "Entregador não encontrado" });

    const rota = await RotaPG.findOne({ where: { entregador_id: ent.id } });
    const checkpoints = rota ? await CheckpointPG.findAll({ where: { rota_id: rota.id } }) : [];
    const historico = await readHistorico(ent.id, 500);

    res.json(toFrontendShape(ent, rota, checkpoints, historico));
  } catch (err) {
    console.error("❌ Erro GET /entregadores/:id:", err.message);
    res.status(500).json({ error: "Erro ao buscar entregador" });
  }
});

// =====================
// Socket.IO
// =====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("localizacao", async (data) => {
    try {
      const { entregadorId, latitude, longitude } = data || {};
      const id = Number(entregadorId);

      if (!Number.isFinite(id) || typeof latitude !== "number" || typeof longitude !== "number") {
        return;
      }

      const ent = await EntregadorPG.findByPk(id);
      if (!ent) return;

      // atualiza localização atual
      ent.current_lat = latitude;
      ent.current_lng = longitude;
      await ent.save();

      // registra histórico
      await sequelize.query(
        `
        INSERT INTO entregador_localizacoes(entregador_id, latitude, longitude)
        VALUES (:id, :lat, :lng)
        `,
        {
          replacements: { id, lat: latitude, lng: longitude },
        }
      );

      // monta payload completo pro frontend
      const rota = await RotaPG.findOne({ where: { entregador_id: ent.id } });
      const checkpoints = rota ? await CheckpointPG.findAll({ where: { rota_id: rota.id } }) : [];
      const historico = await readHistorico(ent.id, 200);

      const payload = toFrontendShape(ent, rota, checkpoints, historico);

      console.log(`📍 Localização PG: ${ent.nome} → ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      io.emit("entregadorAtualizado", payload);
    } catch (err) {
      console.error("❌ Erro ao atualizar localização (socket):", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// =====================
// Start
// =====================
const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`✅ Healthcheck: http://localhost:${PORT}/api/health`);
});
