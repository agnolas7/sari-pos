const { Sequelize } = require("sequelize");
require("dotenv").config();

const useSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: useSSL ? false : console.log,
    dialectOptions: useSSL
      ? { ssl: { rejectUnauthorized: true, minVersion: "TLSv1.2" } }
      : {},
  },
);

module.exports = sequelize;
