// models_pg/Rota.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

const RotaPG = sequelize.define(
  "rotas",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entregador_id: { type: DataTypes.INTEGER, allowNull: false },

    inicio_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    inicio_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    fim_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    fim_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
  },
  {
    tableName: "rotas",
    timestamps: false,
  }
);

module.exports = RotaPG;
