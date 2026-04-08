const { Op } = require("sequelize");
const InviteUser = require('../models/invite-user');
const Member = require('../models/membership');
const Organization = require('../models/org');
const User = require('../models/user');
const { auditLogEvent } = require('../utils/auditLog');
const { successResponse, errorResponse } = require('../utils/response');
const { generateToken } = require('../utils/tokenGenerate');
const { sendInviteEmail } = require('../utils/inviteEmail');
const sequelize = require("../config/db");
const Membership = require("../models/membership");

const getAllMembers = async (req, res) => {
    try {
        const { cursor, limit = 20 } = req.query;
        let whereClause = { org_id: req.orgId };

        if (cursor) {
            whereClause.id = { [Op.gt]: cursor };
        }

        const members = await Member.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['id', 'ASC']],
            limit: parseInt(limit) + 1,
        });

        let nextCursor = null;
        if (members.length > limit) {
            nextCursor = members[members.length - 1].id;
            members.pop();
        }
        return successResponse(res, "Members fetched successfully!", { members, nextCursor }, 200);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

const removeMember = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.role !== 'Owner') {
            return errorResponse(res, "You do not have permission to remove members", 403);
        }

        const member = await Member.findOne({ where: { id, org_id: req.orgId } });
        if (!member) return errorResponse(res, "Member not found", 404);

        if (member.role === 'Owner') {
            return errorResponse(res, "You cannot remove an owner", 403);
        }

        await member.destroy();
        await auditLogEvent({
            user_id: req.userId,
            org_id: req.orgId,
            action_type: "MEMBER_REMOVED",
            message: `Member removed: ${member.name}`,
            details: { member_id: id }
        });
        return successResponse(res, "Member removed successfully!");
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

const updateMemberRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (req.role !== 'Owner' && req.role !== 'Admin') {
            return errorResponse(res, "You do not have permission to update roles", 403);
        }

        const member = await Member.findOne({
            where: { id, org_id: req.orgId },
            include: [{ model: User, as: 'user', attributes: ['name'] }]
        });
        if (!member) return errorResponse(res, "Member not found", 404);

        if (member.role === 'Owner') {
            return errorResponse(res, "Cannot change owner role", 403);
        }

        if (req.role === 'Admin' && role === 'Owner') {
            return errorResponse(res, "Admins cannot promote members to Owner", 403);
        }

        const oldRole = member.role;
        await member.update({ role });
        await auditLogEvent({
            user_id: req.userId,
            org_id: req.orgId,
            action_type: "MEMBER_ROLE_UPDATED",
            message: `Member role updated: ${member.user?.name} role changed from ${oldRole} to ${role}`,
            details: { member_id: id, oldRole, newRole: role }
        });
        return successResponse(res, "Member role updated successfully!", { member });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

const inviteUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { email, role } = req.body;
        const org_id = req.orgId;
        const org = await Organization.findByPk(org_id);

        if (!org) {
            throw new Error("Organization not found");
        }

        const user = await User.findOne({
            where: { email },
            attributes: ["id"],
            transaction: t,
        });

        if (user) {
            const membershipExists = await Membership.count({
                where: {
                    user_id: user.id,
                    org_id,
                },
                transaction: t,
            });

            if (membershipExists) {
                throw new Error(
                    "User is already a member of this organization"
                );
            }
        }

        const token = generateToken({ email, role, org_id }, role, org_id, "24h");

        await InviteUser.upsert(
            {
                email,
                org_id,
                role,
                token,
                status: "pending",
            },
            {
                transaction: t,
                returning: true,
            }
        );

        const inviteLink = `${process.env.FRONTEND_URL}/invite-signup?invite_token=${token}`;

        await auditLogEvent(
            req.userId,
            org_id,
            "USER_INVITED",
            `Invitation sent from ${org.name} to ${email} for role ${role}`,
            {
                user_email: email,
                role,
            },
            t
        );

        await t.commit();

        sendInviteEmail(email, inviteLink, org.name).catch(err => {
            console.error("Background email sending error:", err);
        });

        return successResponse(
            res,
            "Invitation sent successfully!",
            201
        );
    } catch (error) {
        await t.rollback();
        return errorResponse(res, error.message, 500);
    }
};
module.exports = { getAllMembers, removeMember, updateMemberRole, inviteUser }