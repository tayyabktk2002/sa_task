const express = require('express');
const { createTicket, getTicketById, getTickets, updateTicket, ticketStats, addComment, seedTickets } = require('../controllers/ticket.controller');
const upload = require('../utils/multer');
const { verifyToken, authorize } = require('../middleware/verify');
const router = express.Router();


router.post('/create', verifyToken, authorize(['Owner', 'Admin', 'Member']), createTicket);

router.get('/get', verifyToken, getTickets);

router.get('/get/:id', verifyToken, getTicketById);

router.put('/update/:id', verifyToken, authorize(['Owner', 'Admin', 'Member']), updateTicket);

router.get('/stats', verifyToken, ticketStats);

router.post('/seed', verifyToken, authorize(['Owner', 'Admin']), seedTickets);

router.post('/:ticketId/comments', verifyToken, authorize(['Owner', 'Admin', 'Member',]), upload.single('file'), addComment);



module.exports = router;
