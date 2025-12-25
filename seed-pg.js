// seed-pg.js
require("dotenv").config();
const { sequelize, EntregadorPG, RotaPG, CheckpointPG } = require("./models_pg");

async function run() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao Postgres (seed-pg)");

    // (opcional) limpar tudo para não duplicar
    await CheckpointPG.destroy({ where: {} });
    await RotaPG.destroy({ where: {} });
    await EntregadorPG.destroy({ where: {} });

    const entregador = await EntregadorPG.create({
      nome: "Entregador Simulado PG",
      status: "ativo",
      current_lat: -23.5505,
      current_lng: -46.6333,
    });

    const rota = await RotaPG.create({
      entregador_id: entregador.id,
      inicio_lat: -23.5505,
      inicio_lng: -46.6333,
      fim_lat: -23.5550,
      fim_lng: -46.6270,
    });

    await CheckpointPG.bulkCreate([
      { rota_id: rota.id, latitude: -23.5520, longitude: -46.6310, ordem: 1 },
      { rota_id: rota.id, latitude: -23.5535, longitude: -46.6290, ordem: 2 },
    ]);

    console.log("✅ Seed PG concluído!");
    console.log("ID entregador_id:", entregador.id);
    console.log("ID rota_id:", rota.id);

    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error("❌ Erro seed-pg:", e.message);
    try {
      await sequelize.close();
    } catch (_) {}
    process.exit(1);
  }
}

run();
