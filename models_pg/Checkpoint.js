// models_pg/Checkpoint.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelize");

const CheckpointPG = sequelize.define(
  "checkpoints",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rota_id: { type: DataTypes.INTEGER, allowNull: false },

    latitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    ordem: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "checkpoints",
    timestamps: false,
  }
);

module.exports = CheckpointPG;
