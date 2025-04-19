import DeviceConfig from '../models/DeviceConfig.js';
import { paginate, buildFilter } from '../utils/Pagination.js';
import { v4 as uuidv4 } from 'uuid';
import RedisCache from "../utils/RedisCache.js";

class DeviceConfigService {
	async updateDeviceConfig(deviceId, configData) {
		const { timeDuration, stakeLimit, hotPercentage, restrictionExpires } =
			configData;

		// Validation
		if (timeDuration < 300 || timeDuration > 86400) {
			throw new Error("Time duration must be between 5 minutes and 24 hours");
		}

		if (stakeLimit < 1 || stakeLimit > 10000000) {
			throw new Error("Stake limit must be between 1 and 10,000,000");
		}

		if (hotPercentage < 1 || hotPercentage > 100) {
			throw new Error("Hot percentage must be between 1 and 100");
		}

		if (restrictionExpires < 60 && restrictionExpires !== 0) {
			throw new Error(
				"Restriction expires must be at least 1 minute or 0 for never expires"
			);
		}

		// Update or create the device configuration
		const updatedConfig = await DeviceConfig.findOneAndUpdate(
			{ deviceId },
			{ timeDuration, stakeLimit, hotPercentage, restrictionExpires },
			{ new: true, upsert: true }
		);

		// Invalidate cache after update
		await RedisCache.delete(deviceId);

		return updatedConfig;
	}

	async deleteDeviceConfig(deviceId) {
		try {
			const deletedConfig = await DeviceConfig.findOneAndDelete({ deviceId });

			// Invalidate cache if device exists and was deleted
			if (deletedConfig) {
				await RedisCache.delete(deviceId);
			}

			return deletedConfig;
		} catch (error) {
			throw error;
		}
	}

	async createDeviceConfig(configData) {
		let {
			deviceId,
			timeDuration,
			stakeLimit,
			hotPercentage,
			restrictionExpires,
		} = configData;

		// Generate UUID if not provided
		if (!deviceId) {
			deviceId = uuidv4();
		}

		// Validation
		if (timeDuration < 300 || timeDuration > 86400) {
			throw new Error("Time duration must be between 5 minutes and 24 hours");
		}

		if (stakeLimit < 1 || stakeLimit > 10000000) {
			throw new Error("Stake limit must be between 1 and 10,000,000");
		}

		if (hotPercentage < 1 || hotPercentage > 100) {
			throw new Error("Hot percentage must be between 1 and 100");
		}

		if (restrictionExpires < 60 && restrictionExpires !== 0) {
			throw new Error(
				"Restriction expires must be at least 1 minute or 0 for never expires"
			);
		}

		// Only check for existing device if deviceId was manually provided
		if (configData.deviceId) {
			const existingDevice = await DeviceConfig.findOne({ deviceId });
			if (existingDevice) {
				throw new Error("Device with this ID already exists");
			}
		}

		// Create new device config
		const deviceConfig = new DeviceConfig({
			deviceId,
			timeDuration,
			stakeLimit,
			hotPercentage,
			restrictionExpires,
		});

		const savedConfig = await deviceConfig.save();

		// Add to cache
		await RedisCache.set(deviceId, savedConfig);

		return savedConfig;
	}

	async getDeviceConfigByDeviceId(deviceId) {
		try {
			// Try to get from cache first
			const cachedConfig = await RedisCache.get(deviceId);
			if (cachedConfig) {
				return cachedConfig;
			}

			// If not in cache, get from database
			const deviceConfig = await DeviceConfig.findOne({ deviceId });

			// Add to cache if found
			if (deviceConfig) {
				await RedisCache.set(deviceId, deviceConfig);
			}

			return deviceConfig;
		} catch (error) {
			console.error("Error getting device config:", error);
			// If cache fails, fallback to database
			return await DeviceConfig.findOne({ deviceId });
		}
	}

	// The getAllDevices method doesn't use caching because it's a filtered/paginated list
	async getAllDevices(queryParams = {}) {
		const filterMapping = {
			deviceId: { field: "deviceId", type: "contains" },
			hotPercentageMin: { field: "hotPercentage", type: "numeric" },
			hotPercentageMax: { field: "hotPercentage", type: "numeric" },
			stakeLimitMin: { field: "stakeLimit", type: "numeric" },
			stakeLimitMax: { field: "stakeLimit", type: "numeric" },
			timeDurationMin: { field: "timeDuration", type: "numeric" },
			timeDurationMax: { field: "timeDuration", type: "numeric" },
			createdAtStart: { field: "createdAt", type: "date" },
			createdAtEnd: { field: "createdAt", type: "date" },
		};

		const filter = buildFilter(queryParams, filterMapping);

		if (queryParams.isBlocked !== undefined) {
			const isBlocked = queryParams.isBlocked === "true";
			if (isBlocked) {
				filter.blockedUntil = { $gt: new Date() };
			} else {
				filter.$or = [
					{ blockedUntil: null },
					{ blockedUntil: { $lte: new Date() } },
				];
			}
		}

		const options = {
			page: queryParams.page || 1,
			limit: queryParams.limit || 10,
			sortBy: queryParams.sortBy || "deviceId",
			sortOrder: queryParams.sortOrder || "asc",
		};

		const result = await paginate(DeviceConfig, filter, options);

		return {
			devices: result.data,
			pagination: result.pagination,
		};
	}
}

export default new DeviceConfigService();