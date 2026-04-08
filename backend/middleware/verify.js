const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Membership = require('../models/membership');
const { errorResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.token;

        if (!token) {
            return errorResponse(res, "Access denied. No token provided.", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;
        req.userId = decoded.id;
        req.orgId = decoded.org_id;
        req.role = decoded.role;

        const isMember = await Membership.findOne({
            where: { user_id: req.userId, org_id: req.orgId }
        });

        if (!isMember) {
            return errorResponse(res, "You are no longer a member of this organization", 403);
        }

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return errorResponse(res, "Invalid or expired token", 401);
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (roles.length && !roles.includes(req.role)) {
            return errorResponse(res, "You do not have permission to perform this action", 403);
        }
        next();
    };
};

module.exports = { verifyToken, authorize };