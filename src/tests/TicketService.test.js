import mongoose from 'mongoose';
import TicketService from '../services/TicketService.js';
import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';

describe('TicketService - Stake Limit Scenarios', () => {
    let deviceId;
    let deviceConfig;

    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/stake-limit-service-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await DeviceConfig.deleteMany({});
        await StakeLog.deleteMany({});

        // Device config: stakeLimit=999, hotPercentage=80 (hotThreshold=799.2), timeDuration=1800s (30min)
        deviceId = 'test-device-1';
        deviceConfig = await DeviceConfig.create({
            deviceId,
            timeDuration: 1800,
            stakeLimit: 999,
            hotPercentage: 80,
            restrictionExpires: 600,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await StakeLog.deleteMany({});
    });

    it('should return OK when total stake is below hot threshold', async () => {
        // Existing stakes: 200, 300 (total 500)
        await StakeLog.create([
            { id: 'log1', deviceId, stake: 200, timestamp: new Date() },
            { id: 'log2', deviceId, stake: 300, timestamp: new Date() }
        ]);
        // New ticket: 200 (total 700 < 799.2)
        const ticketData = { id: 'ticket-ok', deviceId, stake: 200 };
        const result = await TicketService.processTicket(ticketData);
        expect(result.status).toBe('OK');
    });

    it('should return HOT when total stake is >= hot threshold and < stakeLimit', async () => {
        // Existing stakes: 400, 300 (total 700)
        await StakeLog.create([
            { id: 'log3', deviceId, stake: 400, timestamp: new Date() },
            { id: 'log4', deviceId, stake: 300, timestamp: new Date() }
        ]);
        // New ticket: 100 (total 800 >= 799.2 && < 999)
        const ticketData = { id: 'ticket-hot', deviceId, stake: 100 };
        const result = await TicketService.processTicket(ticketData);
        expect(result.status).toBe('HOT');
    });

    it("should return BLOCKED when total stake is >= stakeLimit", async () => {
			// Existing stakes: 600, 300 (total 900)
			await StakeLog.create([
				{ id: "log5", deviceId, stake: 600, timestamp: new Date() },
				{ id: "log6", deviceId, stake: 300, timestamp: new Date() },
			]);
			// New ticket: 100 (total 1000 >= 999)
			const ticketData = { id: "ticket-blocked", deviceId, stake: 100 };
			const result = await TicketService.processTicket(ticketData);
			expect(result.status).toBe("BLOCKED");
		});
});