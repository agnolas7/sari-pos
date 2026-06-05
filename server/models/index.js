const sequelize = require("../config/database");
const Category = require("./Category");
const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const AdminLog = require("./AdminLog");
const Utang = require("./Utang");
const StoreSettings = require("./StoreSettings");
const Attendant = require("./Attendant");
const Sale = require("./Sale");

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Attendant.hasMany(Sale, { foreignKey: "attendant_id", as: "sales" });
Sale.belongsTo(Attendant, { foreignKey: "attendant_id", as: "attendant" });

module.exports = {
  sequelize,
  Category,
  Product,
  ProductVariant,
  AdminLog,
  Utang,
  StoreSettings,
  Attendant,
  Sale,
};
