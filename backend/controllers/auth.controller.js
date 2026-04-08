const User = require("../models/user");
const Organization = require("../models/org");
const Membership = require("../models/membership");
const sequelize = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { auditLogEvent } = require("../utils/auditLog");
const { successResponse, errorResponse } = require("../utils/response");
const { generateToken } = require("../utils/tokenGenerate");
const validateInvitation = require("../utils/inviteValidator");
const login = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return errorResponse(res, "User not found", 404);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return errorResponse(res, "Invalid password", 401);

    const membership = await Membership.findOne({
      where: { user_id: user.id }, include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['name']
        }
      ]
    });
    const org_id = membership?.org_id || null;

    let finalRole = membership.role;
    if (membership) {
      finalRole = membership.role;
    }

    const token = generateToken(user, finalRole, org_id, "1h");
    await user.update({ token }, { transaction: t });

    auditLogEvent(user.id, org_id, "USER_LOGGED_IN", "User logged in successfully!", {
      user_name: user.name,
      user_email: user.email,
    });

    await t.commit();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return successResponse(res, "Login successful", { name: user.name, role: membership?.role || null, org_id, org_name: membership?.organization?.name || null });
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
};

const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, org_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return errorResponse(res, "User already exists with this email, please choose a different one.", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
      { name, email, username: email, password: hashedPassword },
      { transaction: t },
    );
    const org = await Organization.create(
      { name: org_name },
      { transaction: t },
    );

    const member = await Membership.create(
      {
        user_id: user.id,
        org_id: org.id,
        role: "Owner",
      },
      { transaction: t },
    );

    const token = generateToken(user, member.role, org.id, "1d");
    await user.update({ token }, { transaction: t });
    auditLogEvent(user.id, org.id, "ORG_CREATED", "Organization created successfully!", {
      org_name: org.name,
      user_name: user.name,
      user_email: user.email,
    }, t);
    await t.commit();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return successResponse(res, "User and Organization created successfully!", { name: user.name, role: member.role, org_id: org.id, org_name: org.name }, 201);
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
};

const acceptInvite = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, invite_token } = req.body;

    const { org_id, role } = await validateInvitation(email, invite_token);

    const org = await Organization.findByPk(org_id, { transaction: t });
    if (!org) {
      throw new Error("Organization not found");
    }

    let user = await User.findOne({ where: { email }, transaction: t });
    let authToken;
    let finalRole;

    if (user) {
      // User already exists, just create membership
      const existingMembership = await Membership.findOne({
        where: { user_id: user.id, org_id: org_id },
        transaction: t
      });

      if (existingMembership) {
        throw new Error("You are already a member of this organization");
      }

      const membership = await Membership.create(
        {
          user_id: user.id,
          org_id: org_id,
          role: role || 'Member',
        },
        { transaction: t }
      );

      finalRole = membership.role;
      authToken = generateToken(user, finalRole, org.id, "1d");
      await user.update({ token: authToken }, { transaction: t });

      auditLogEvent(user.id, org_id, "USER_JOINED", `${user.name} joined ${org.name} organization in ${role || 'Member'} role successfully!`, {
        user_name: user.name,
        user_email: user.email,
        org_name: org.name,
      }, t);
    } else {
      // New user, create user and membership
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create(
        { name, email, username: email, password: hashedPassword },
        { transaction: t }
      );

      const membership = await Membership.create(
        {
          user_id: user.id,
          org_id: org_id,
          role: role || 'Member',
        },
        { transaction: t }
      );

      finalRole = membership.role;
      authToken = generateToken(user, finalRole, org.id, "1d");
      await user.update({ token: authToken }, { transaction: t });

      auditLogEvent(user.id, org_id, "USER_JOINED", `${user.name} joined ${org.name} organization in ${role || 'Member'} role successfully!`, {
        user_name: user.name,
        user_email: user.email,
        org_name: org.name,
      }, t);
    }

    await t.commit();

    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return successResponse(res, "Joined Organization successfully!", { name: user.name, role: finalRole, org_id: org.id, org_name: org.name }, 201);
  } catch (error) {
    console.log(error);

    // Only rollback if transaction is still active
    if (t && !t.finished) {
        await t.rollback();
    }
    return errorResponse(res, error.message, 500);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return errorResponse(res, "Authentication not found", 404);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    if (!user) return errorResponse(res, "User not found", 404);
    await user.update({ token: null });
    res.clearCookie('token');
    return successResponse(res, "Logout successful", {}, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}



module.exports = {
  login,
  register,
  acceptInvite,
  logout,
};
