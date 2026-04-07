const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Organization = require("./org");

const InviteUser = sequelize.define("InviteUser", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "approved"),
        allowNull: false,
        defaultValue: "pending",
    },
});

InviteUser.belongsTo(Organization, {
    foreignKey: "org_id",
    as: "organization",
});

Organization.hasMany(InviteUser, {
    foreignKey: "org_id",
    as: "invites",
});
module.exports = InviteUser;