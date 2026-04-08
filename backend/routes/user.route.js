const express = require('express');
const { userOrg, switchOrganization, auditLog } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/verify');
const router = express.Router();

router.get('/my-orgs', verifyToken, userOrg);
router.post('/switch-org', verifyToken, switchOrganization);
router.get('/audit-log', verifyToken, auditLog);

module.exports = router;
