// models_pg/Entregador.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

const EntregadorPG = sequelize.define(
  "entregadores",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    status: { type: DataTypes.STRING(10), allowNull: false },

    // localização atual (NOVO)
    current_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    current_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
  },
  {
    tableName: "entregadores",
    timestamps: false,
  }
);

module.exports = EntregadorPG;
