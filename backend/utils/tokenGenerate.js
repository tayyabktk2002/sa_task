const jwt = require("jsonwebtoken");

const generateToken = (user, role = null, org_id = null, expiresIn = "1h") => {
    const payload = {
        id: user.id || null,
        email: user.email,
        role: role || user.role || null,
        org_id: org_id || user.org_id || null
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: expiresIn }
    );
};

module.exports = { generateToken };