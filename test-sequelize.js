// test-sequelize.js
require("dotenv").config();
const { sequelize } = require("./models_pg");

async function main() {
  await sequelize.authenticate();
  console.log("✅ Sequelize conectado no Postgres!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Erro:", e.message);
  process.exit(1);
});
