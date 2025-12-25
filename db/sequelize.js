// db/sequelize.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sslEnabled = String(process.env.PG_SSL || "false").toLowerCase() === "true";

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT || 5432),
    dialect: "postgres",
    logging: false,
    dialectOptions: sslEnabled
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  }
);

module.exports = { sequelize };
