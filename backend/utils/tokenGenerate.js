const jwt = require("jsonwebtoken");

const generateToken = (user, role = null, org_id = null, expiresIn = "1h") => {
    return jwt.sign(
        { id: user.id, email: user.email, role: role, org_id: org_id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: expiresIn }
    );
};

module.exports = { generateToken };