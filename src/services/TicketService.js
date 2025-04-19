import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';
import RedisCache from "../utils/RedisCache.js";

class TicketService {
	async processTicket(ticketData) {
		if (!ticketData) {
			return { status: "ERROR", message: "Invalid ticket data" };
		}

		const { id, deviceId, stake } = ticketData;

		if (!id || !deviceId || stake === undefined) {
			throw new Error("Missing required fields");
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