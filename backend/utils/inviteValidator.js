const jwt = require("jsonwebtoken");
const Organization = require("../models/org");
const User = require("../models/user");
const InviteUser = require("../models/invite-user");

const validateInvitation = async (email, invite_token) => {
    let decoded;
    try {
        decoded = jwt.verify(invite_token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error("Invitation token has expired");
        }
        throw new Error("Invalid invitation token");
    }
    const { org_id, role, email: inviteEmail } = decoded;
    console.log("token decode :", org_id, role, inviteEmail);




    if (email !== inviteEmail) {
        throw new Error("Invitation email does not match your email");
    }

    const findOrg = await Organization.findByPk(org_id);
    if (!findOrg) {
        throw new Error("Invitation is not valid from organization side");
    }

    const findUser = await User.findOne({ where: { email } });
    // If user exists, we don't throw error here anymore, we'll handle it in acceptInvite
    
    const findInvite = await InviteUser.findOne({ where: { email, org_id, status: "approved" } });
    if (findInvite) {
        throw new Error("Invitation already accepted");
    }

    return { org_id, role };
};

module.exports = validateInvitation;