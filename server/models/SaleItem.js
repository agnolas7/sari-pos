const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleItem = sequelize.define(
  "SaleItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // nullable — variant may be deleted later
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant_label: {
      type: DataTypes.STRING,
      allowNull: true, // e.g. "500ml / Mango"
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "sale_items",
    timestamps: false,
  },
);

module.exports = SaleItem;
