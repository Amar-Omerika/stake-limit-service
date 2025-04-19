import express from 'express';
import ticketController from '../controllers/TicketController.js';
import apiKeyAuth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Specific stricter rate limit for ticket processing
const ticketLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit to 30 requests per minute
    message: "Too many ticket requests, please try again later",
});

router.post('/', apiKeyAuth, ticketLimiter, ticketController.processTicket);

export default router;