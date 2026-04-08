const express = require('express');
const { inviteUser, getAllMembers, removeMember, updateMemberRole } = require('../controllers/member.controller');
const { verifyToken } = require('../middleware/verify');
const router = express.Router();


router.post('/invite-user', verifyToken, inviteUser);

router.get('/get', verifyToken, getAllMembers);

router.delete('/remove/:id', verifyToken, removeMember);

router.put('/update/:id', verifyToken, updateMemberRole);


module.exports = router;