const express = require('express');
const router = express.Router();

const baseUrl = '/api';

const auth = require('./auth.routes');
const ticket = require('./ticket.routes');
const member = require('./member.routes');
const user = require('./user.route');

router.use(`${baseUrl}/auth`, auth);
router.use(`${baseUrl}/user`, user);
router.use(`${baseUrl}/tickets`, ticket);
router.use(`${baseUrl}/members`, member);

module.exports = router;