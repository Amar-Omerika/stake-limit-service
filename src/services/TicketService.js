import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';

class TicketService {
    async processTicket(ticketData) {
        const { id, deviceId, stake } = ticketData;

        if (!id || !deviceId || stake === undefined) {
            throw new Error('Missing required fields');
        }

        // Check if device is configured
        const deviceConfig = await DeviceConfig.findOne({ deviceId });
        if (!deviceConfig) {
            throw new Error('Device configuration not found');
        }

        // Check if device is currently blocked
        if (deviceConfig.blockedUntil && deviceConfig.blockedUntil > new Date()) {
            return { status: 'BLOCKED' };
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
            timestamp: { $gte: timeWindow }
        });

        const totalStake = stakeLogs.reduce((sum, log) => sum + log.stake, 0);

        // Calculate hot threshold
        const hotThreshold = deviceConfig.stakeLimit * (deviceConfig.hotPercentage / 100);

        // Determine status
        let status = 'OK';

        if (totalStake >= deviceConfig.stakeLimit) {
            status = 'BLOCKED';

            // Set blocked until time if restriction expires is set
            if (deviceConfig.restrictionExpires > 0) {
                const blockedUntil = new Date();
                blockedUntil.setSeconds(blockedUntil.getSeconds() + deviceConfig.restrictionExpires);
                deviceConfig.blockedUntil = blockedUntil;
                await deviceConfig.save();
            }
        } else if (totalStake >= hotThreshold) {
            status = 'HOT';
        }

        return { status };
    }
}

export default new TicketService();