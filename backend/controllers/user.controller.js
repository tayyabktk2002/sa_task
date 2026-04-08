const AuditLog = require('../models/audit-log');
const Membership = require('../models/membership');
const Organization = require('../models/org');
const User = require('../models/user');
const Ticket = require('../models/ticket');
const { Op } = require("sequelize");
const { errorResponse, successResponse } = require('../utils/response');
const { generateToken } = require('../utils/tokenGenerate');


const userOrg = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        const membership = await Membership.findAll({ where: { user_id: userId }, include: [{ model: Organization, as: 'organization', attributes: ['id', 'name'] }] });
        if (!membership) {
            return errorResponse(res, 'Organization not found', 404);
        }
        return successResponse(res, 'Organization fetched successfully', { memberships: membership, currentOrgId: req.orgId, userName: user.name });
    } catch (error) {
        console.error('Error fetching user organization:', error);
        return errorResponse(res, 'Internal server error', 500);
    }
}

const switchOrganization = async (req, res) => {
    try {
        const { targetOrgId } = req.body;
        const userId = req.userId;

        const membership = await Membership.findOne({
            where: { user_id: userId, org_id: targetOrgId }
        });

        if (!membership) {
            return errorResponse(res, "You don't belong to this organization!", 403);
        }

        const user = await User.findByPk(userId);
        const newToken = generateToken(user, membership.role, targetOrgId);

        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        return successResponse(res, "Switched successfully", { role: membership.role });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const auditLog = async (req, res) => {
    try {
        const { cursor, limit = 20 } = req.query;
        const userId = req.userId;
        const org_id = req.orgId
        const user = await User.findByPk(userId);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        let whereClause = { user_id: userId , org_id : org_id};

        if (cursor) {
            const [cursorCreatedAt, cursorId] = cursor.split('_');
            whereClause[Op.or] = [
                { createdAt: { [Op.lt]: new Date(cursorCreatedAt) } },
                {
                    [Op.and]: [
                        { createdAt: new Date(cursorCreatedAt) },
                        { id: { [Op.lt]: cursorId } }
                    ]
                }
            ];
        }

        const auditLogs = await AuditLog.findAll({
            where: whereClause,
            include: [
                {
                    model: Organization,
                    as: 'organization',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                },
                {
                    model: Ticket,
                    as: 'ticket',
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit) + 1,
        });

        let nextCursor = null;
        if (auditLogs.length > limit) {
            const lastLog = auditLogs[auditLogs.length - 1];
            nextCursor = `${lastLog.createdAt.toISOString()}_${lastLog.id}`;
            auditLogs.pop();
        }
        const auditLogData = auditLogs.map((log) => ({
            id: log.id,
            action_type: log.action_type,
            message: log.message,
            details: log.details,
            org_id: log.org_id,
            org_name: log.organization?.name,
            user_id: log.user_id,
            user_name: log.user?.name,
            ticket_id: log.ticket_id,
            ticket_title: log.ticket?.title,
            createdAt: log.createdAt,
            updatedAt: log.updatedAt,
        }));
        return successResponse(res, 'Audit logs fetched successfully', { auditLogs: auditLogData, nextCursor });
    } catch (error) {
        console.error('Error fetching user organization:', error);
        return errorResponse(res, 'Internal server error', 500);
    }
}

module.exports = { userOrg, switchOrganization, auditLog };