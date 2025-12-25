// models/entregador.js
const mongoose = require("mongoose");

const LocalizacaoSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const CheckpointSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    concluido: { type: Boolean, default: false },
  },
  { _id: false }
);

const RotaSchema = new mongoose.Schema(
  {
    inicio: LocalizacaoSchema,
    checkpoints: [CheckpointSchema],
    fim: LocalizacaoSchema,
  },
  { _id: false }
);

const EntregadorSchema = new mongoose.Schema(
  {
    nome: String,
    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
    localizacaoAtual: LocalizacaoSchema,
    historicoLocalizacao: [LocalizacaoSchema],
    rota: RotaSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entregador", EntregadorSchema);
