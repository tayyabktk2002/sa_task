const express = require('express');
const { login, register, acceptInvite, logout } = require('../controllers/auth.controller');
const router = express.Router();


router.post('/login', (req, res) => {
  return login(req, res);
});

router.post('/register', (req, res) => {
  return register(req, res);
});

router.post('/accept-invite', (req, res) => {
  return acceptInvite(req, res);
});

router.post('/logout', (req, res) => {
  return logout(req, res);
});

module.exports = router;

