const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attendant = sequelize.define(
  "Attendant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    emoji: {
      type: DataTypes.STRING(10),
      defaultValue: "🙂",
    },
    color: {
      type: DataTypes.STRING(20),
      defaultValue: "#505081",
    },
  },
  {
    tableName: "attendants",
    timestamps: true,
  },
);

module.exports = Attendant;
