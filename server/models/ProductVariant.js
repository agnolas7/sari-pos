const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING(50), // e.g. "60g", "1L", "Regular"
      allowNull: true,
    },
    flavor: {
      type: DataTypes.STRING(100), // e.g. "Chilimansi", "Extra Hot"
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(8, 2), // up to ₱999,999.99
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
  },
);

module.exports = ProductVariant;
