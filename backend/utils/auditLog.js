const AuditLog = require("../models/audit-log");
const sequelize = require("../config/db");

const auditLogEvent = async (user_id = null, org_id = null, action_type, message, details) => {
    const t = await sequelize.transaction();
    try {
        await AuditLog.create({
            user_id,
            org_id,
            action_type,
            message,
            details,
        }, { transaction: t });
        await t.commit();
    } catch (error) {
        await t.rollback();
        console.error("Error creating audit log:", error);
    }
};

const getAuditLog = (filter = {}) => {

    return [];
};

module.exports = { auditLogEvent, getAuditLog };
