const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    return res.json({ message: "Welcome to the Ticket Page!" });
});


module.exports = router;
