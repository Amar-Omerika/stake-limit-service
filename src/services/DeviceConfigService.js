import DeviceConfig from '../models/DeviceConfig.js';

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

}

export default new DeviceConfigService();