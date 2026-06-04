const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Utang = sequelize.define(
  "Utang",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "partially_paid", "paid"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "utangs",
    timestamps: true,
  },
);

module.exports = Utang;
