const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Organization = require("./org");
const Ticket = require("./ticket");

const AuditLog = sequelize.define(
  "audit_logs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "organisations", key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["org_id"] },
      { fields: ["target_id"] },
    ],
  },
);

User.hasMany(AuditLog, { foreignKey: "user_id", as: "audit_logs" });
AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

Organization.hasMany(AuditLog, { foreignKey: "org_id", as: "audit_logs" });
AuditLog.belongsTo(Organization, { foreignKey: "org_id", as: "organization" });

Ticket.hasMany(AuditLog, { foreignKey: "target_id", as: "audit_logs" });
AuditLog.belongsTo(Ticket, { foreignKey: "target_id", as: "ticket" });

module.exports = AuditLog;
