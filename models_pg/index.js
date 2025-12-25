// models_pg/index.js
const { sequelize } = require("../db/sequelize");

const EntregadorPG = require("./Entregador");
const RotaPG = require("./Rota");
const CheckpointPG = require("./Checkpoint");

// entregador -> rota (1:1)
EntregadorPG.hasOne(RotaPG, { foreignKey: "entregador_id" });
RotaPG.belongsTo(EntregadorPG, { foreignKey: "entregador_id" });

// rota -> checkpoints (1:N)
RotaPG.hasMany(CheckpointPG, { foreignKey: "rota_id" });
CheckpointPG.belongsTo(RotaPG, { foreignKey: "rota_id" });

module.exports = {
  sequelize,
  EntregadorPG,
  RotaPG,
  CheckpointPG,
};
