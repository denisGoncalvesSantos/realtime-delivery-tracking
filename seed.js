// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const Entregador = require("./models/entregador");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB (seed)");

    const entregador = await Entregador.create({
      nome: "Entregador Simulado",
      status: "ativo",
      localizacaoAtual: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      rota: {
        inicio: {
          latitude: -23.5505,
          longitude: -46.6333,
        },
        checkpoints: [
          {
            latitude: -23.5520,
            longitude: -46.6310,
            concluido: false,
          },
          {
            latitude: -23.5535,
            longitude: -46.6290,
            concluido: false,
          },
        ],
        fim: {
          latitude: -23.5550,
          longitude: -46.6270,
        },
      },
      historicoLocalizacao: [
        {
          latitude: -23.5505,
          longitude: -46.6333,
        },
      ],
    });

    console.log("✅ Entregador Mongo criado com ID:", entregador._id.toString());

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌ Erro seed Mongo:", e.message);
    process.exit(1);
  }
}

run();
