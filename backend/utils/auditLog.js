const AuditLog = require("../models/audit-log");
const sequelize = require("../config/db");

const auditLogEvent = async (user_id = null, org_id = null, action_type, message, details, transaction = null) => {
    let logData = {};
    let finalTransaction = transaction;

    if (user_id && typeof user_id === 'object' && user_id.action_type) {
        logData = user_id;
        finalTransaction = org_id; 
    } else {
        logData = {
            user_id,
            org_id,
            action_type,
            message,
            details
        };
        finalTransaction = transaction;
    }

    let internalTransaction = false;
    if (!finalTransaction) {
        finalTransaction = await sequelize.transaction();
        internalTransaction = true;
    }
    try {
        await AuditLog.create(logData, { transaction: finalTransaction });
        
        if (internalTransaction) {
            await finalTransaction.commit();
        }
    } catch (error) {
        if (internalTransaction) {
            await finalTransaction.rollback();
        }
        console.error("Error creating audit log:", error);
    }
};

const getAuditLog = async (filter = {}) => {
    try {
        const auditLogs = await AuditLog.findAll({
            where: filter,
            order: [["createdAt", "DESC"]],
        });
        return auditLogs;
    } catch (error) {
        console.error("Error fetching audit logs:", error);
    }
};

module.exports = { auditLogEvent, getAuditLog };
