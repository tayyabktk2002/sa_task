const express = require('express');
const router = express.Router();

const baseUrl = '/api';

const auth = require('./auth.routes');
const dashboard = require('./dashboard.route');
const ticket = require('./ticket.routes');

router.use(`${baseUrl}/auth`, auth);
router.use(`${baseUrl}/dashboard`, dashboard);
router.use(`${baseUrl}/ticket`, ticket);

module.exports = router;