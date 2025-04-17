import ticketService from '../services/TicketService.js';

class TicketController {
    async processTicket(req, res) {
        try {
            const result = await ticketService.processTicket(req.body);
            return res.status(200).send(result);
        } catch (error) {
            console.error('Error processing ticket:', error);

            if (error.message === 'Missing required fields') {
                return res.status(400).send({ error: error.message });
            } else if (error.message === 'Device configuration not found') {
                return res.status(404).send({ error: error.message });
            } else {
                return res.status(500).send({ error: 'Internal server error' });
            }
        }
    }
}

export default new TicketController();