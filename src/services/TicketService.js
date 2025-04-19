import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';
import RedisCache from "../utils/RedisCache.js";

class TicketService {
	async processTicket(ticketData) {
		if (!ticketData) {
			return { status: "ERROR", message: "Invalid ticket data" };
		}

		const { id, deviceId, stake } = ticketData;

		// Basic required field validation
		if (!id || !deviceId || stake === undefined) {
			throw new Error("Missing required fields");
		}

		// Validate stake value
		if (typeof stake !== "number") {
			throw new Error("Stake must be a number");
		}

		if (isNaN(stake) || !isFinite(stake)) {
			throw new Error("Stake must be a valid number");
		}

		if (stake < 0) {
			throw new Error("Stake cannot be negative");
		}

		if (stake > Number.MAX_SAFE_INTEGER) {
			throw new Error("Stake value is too large");
		}

		// Check if ticket with this ID already exists
		const existingTicket = await StakeLog.findOne({ id });
		if (existingTicket) {
			throw new Error("Ticket with this ID has already been processed");
		}

		// Try to get device config from cache first
		let deviceConfig = await RedisCache.get(deviceId);

		// If not in cache, get from database
		if (!deviceConfig) {
			deviceConfig = await DeviceConfig.findOne({ deviceId });
			if (!deviceConfig) {
				throw new Error("Device configuration not found");
			}

			// Add to cache for future requests
			await RedisCache.set(deviceId, deviceConfig);
		}

		// Check if device is currently blocked
		if (deviceConfig.blockedUntil && deviceConfig.blockedUntil > new Date()) {
			return { status: "BLOCKED" };
		}

		// Calculate time window for stake calculation
		const timeWindow = new Date();
		timeWindow.setSeconds(timeWindow.getSeconds() - deviceConfig.timeDuration);

		// Save the current stake log
		const stakeLog = new StakeLog({ id, deviceId, stake });
		await stakeLog.save();

		// Get sum of stakes in the time window
		const stakeLogs = await StakeLog.find({
			deviceId,
			timestamp: { $gte: timeWindow },
		});

		const totalStake = stakeLogs.reduce((sum, log) => sum + log.stake, 0);

		// Calculate hot threshold
		const hotThreshold =
			deviceConfig.stakeLimit * (deviceConfig.hotPercentage / 100);

		// Determine status
		let status = "OK";

		if (totalStake >= deviceConfig.stakeLimit) {
			status = "BLOCKED";

			// Set blocked until time if restriction expires is set
			if (deviceConfig.restrictionExpires > 0) {
				const blockedUntil = new Date();
				blockedUntil.setSeconds(
					blockedUntil.getSeconds() + deviceConfig.restrictionExpires
				);
				deviceConfig.blockedUntil = blockedUntil;
				await deviceConfig.save();

				// Update cache with new blocked status
				await RedisCache.delete(deviceId);
				await RedisCache.set(deviceId, deviceConfig);
			}
		} else if (totalStake >= hotThreshold) {
			status = "HOT";
		}

		return { status };
	}
}

export default new TicketService();