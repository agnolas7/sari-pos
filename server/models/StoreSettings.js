const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StoreSettings = sequelize.define(
  "StoreSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "store_settings",
    timestamps: true,
  },
);

module.exports = StoreSettings;
