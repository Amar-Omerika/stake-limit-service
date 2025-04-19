import ticketService from '../services/TicketService.js';

class TicketController {
    async processTicket(req, res) {
        try {
            const result = await ticketService.processTicket(req.body);
            return res.status(200).send(result);
        } catch (error) {
					console.error("Error processing ticket:", error);

					// Validation errors
					if (
						error.message.includes("Missing required fields") ||
						error.message.includes("Invalid") ||
						error.message.includes("must be a") ||
						error.message.includes("cannot be negative") ||
						error.message.includes("too large") ||
						error.message.includes("already been processed")
					) {
						return res.status(400).send({ error: error.message });
					} else if (error.message === "Device configuration not found") {
						return res.status(404).send({ error: error.message });
					} else {
						return res.status(500).send({ error: "Internal server error" });
					}
				}
    }
}

export default new TicketController();