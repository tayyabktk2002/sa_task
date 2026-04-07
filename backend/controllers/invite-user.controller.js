import InviteUser from "../models/invite-user";
import { auditLogEvent } from "../utils/auditLog";
import { sendInviteEmail } from "../utils/inviteEmail";
import { generateToken } from "../utils/tokenGenerate";

const Membership = require("../models/membership");
const User = require("../models/user");
const { successResponse, errorResponse } = require("../utils/response");
const inviteUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { email, org_id, role } = req.body;
        const org = await Organization.findByPk(org_id);

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

        const token = generateToken({ email, org_id, role }, "24h");

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

        const inviteLink = `${process.env.FRONTEND_URL}/signup?invite_token=${token}`;

        await Promise.all([
            sendInviteEmail(email, inviteLink, org.name),
            auditLogEvent(
                null,
                org.name,
                "USER_INVITED",
                `Invitation sent from ${org.name} to ${email}`,
                {
                    user_email: email,
                    role,
                }
            ),
        ]);

        await t.commit();

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
module.exports = {
    inviteUser,
};
