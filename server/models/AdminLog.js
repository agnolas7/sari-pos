const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminLog = sequelize.define("AdminLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = AdminLog;
