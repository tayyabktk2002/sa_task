const express = require('express');
const { createTicket, getTicketById, getTickets, updateTicket, ticketStats, addComment, seedTickets } = require('../controllers/ticket.controller');
const upload = require('../utils/multer');
const { verifyToken, authorize } = require('../middleware/verify');
const { errorResponse } = require('../utils/response');
const router = express.Router();

const commentUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const isTooLarge = err?.code === 'LIMIT_FILE_SIZE';
      return errorResponse(res, isTooLarge ? 'File too large (max 5MB)' : (err.message || 'File upload failed'), 400);
    }
    next();
  });
};


router.post('/create', verifyToken, authorize(['Owner', 'Admin', 'Member']), createTicket);

router.get('/get', verifyToken, getTickets);

router.get('/get/:id', verifyToken, getTicketById);

router.put('/update/:id', verifyToken, authorize(['Owner', 'Admin', 'Member']), updateTicket);

router.get('/stats', verifyToken, ticketStats);

router.post('/seed', verifyToken, authorize(['Owner', 'Admin']), seedTickets);

router.post('/:ticketId/comments', verifyToken, authorize(['Owner', 'Admin', 'Member',]), commentUpload, addComment);



module.exports = router;
