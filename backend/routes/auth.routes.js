const express = require('express');
const { login, register, acceptInvite, logout } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit');
const router = express.Router();


router.post('/login', authLimiter, login);

router.post('/register', authLimiter, register);

router.post('/acceptinvite', authLimiter, acceptInvite);

router.post('/logout', logout);


module.exports = router;

