import DeviceConfig from '../models/DeviceConfig.js';
import { paginate, buildFilter } from '../utils/Pagination.js';
class DeviceConfigService {
    async updateDeviceConfig(deviceId, configData) {
        const { timeDuration, stakeLimit, hotPercentage, restrictionExpires } = configData;

        // Validation 
        if (timeDuration < 300 || timeDuration > 86400) {
            throw new Error('Time duration must be between 5 minutes and 24 hours');
        }

        if (stakeLimit < 1 || stakeLimit > 10000000) {
            throw new Error('Stake limit must be between 1 and 10,000,000');
        }

        if (hotPercentage < 1 || hotPercentage > 100) {
            throw new Error('Hot percentage must be between 1 and 100');
        }

        if (restrictionExpires < 60 && restrictionExpires !== 0) {
            throw new Error('Restriction expires must be at least 1 minute or 0 for never expires');
        }

        // Update or create the device configuration
        return await DeviceConfig.findOneAndUpdate(
            { deviceId },
            { timeDuration, stakeLimit, hotPercentage, restrictionExpires },
            { new: true, upsert: true }
        );
    }
    async deleteDeviceConfig(deviceId) {
        try {
            return await DeviceConfig.findOneAndDelete({ deviceId });
        } catch (error) {
            throw error;
        }
    }
    async getAllDevices(queryParams = {}) {
        // Define filter mapping for device config fields
        const filterMapping = {
            deviceId: { field: 'deviceId', type: 'contains' },
            hotPercentageMin: { field: 'hotPercentage', type: 'numeric' },
            hotPercentageMax: { field: 'hotPercentage', type: 'numeric' },
            stakeLimitMin: { field: 'stakeLimit', type: 'numeric' },
            stakeLimitMax: { field: 'stakeLimit', type: 'numeric' },
            timeDurationMin: { field: 'timeDuration', type: 'numeric' },
            timeDurationMax: { field: 'timeDuration', type: 'numeric' },
            createdAtStart: { field: 'createdAt', type: 'date' },
            createdAtEnd: { field: 'createdAt', type: 'date' }
        };

        // Build filter based on query parameters
        const filter = buildFilter(queryParams, filterMapping);

        // Custom filter handling for isBlocked if present
        if (queryParams.isBlocked !== undefined) {
            const isBlocked = queryParams.isBlocked === 'true';
            if (isBlocked) {
                filter.blockedUntil = { $gt: new Date() };
            } else {
                filter.$or = [
                    { blockedUntil: null },
                    { blockedUntil: { $lte: new Date() } }
                ];
            }
        }

        // Extract pagination options
        const options = {
            page: queryParams.page || 1,
            limit: queryParams.limit || 10,
            sortBy: queryParams.sortBy || 'deviceId',
            sortOrder: queryParams.sortOrder || 'asc'
        };

        // Use the paginate utility to get paginated results
        const result = await paginate(DeviceConfig, filter, options);

        return {
            devices: result.data,
            pagination: result.pagination
        };
    }
    async getDeviceConfigByDeviceId(deviceId) {
        try {
            return await DeviceConfig.findOne({ deviceId });
        } catch (error) {
            throw error;
        }
    }



}

export default new DeviceConfigService();