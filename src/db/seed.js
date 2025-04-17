import mongoose from 'mongoose';
import connectDB from './mongoose.js';
import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';



async function seedDatabase() {
    try {
        await connectDB();

        // Clear existing data (optional)
        await DeviceConfig.deleteMany({});
        await StakeLog.deleteMany({});

        // Create sample device configs
        const device1 = await DeviceConfig.create({
            deviceId: 'device-001',
            timeDuration: 3600,  // 1 hour in seconds
            stakeLimit: 10000,
            hotPercentage: 80,
            restrictionExpires: 1800  // 30 minutes in seconds
        });

        const device2 = await DeviceConfig.create({
            deviceId: 'device-002',
            timeDuration: 7200,  // 2 hours in seconds
            stakeLimit: 5000,
            hotPercentage: 70,
            restrictionExpires: 3600,  // 1 hour in seconds
            blockedUntil: new Date(Date.now() + 3600000)  // Blocked for 1 hour from now
        });

        // Create sample stake logs
        await StakeLog.create({
            id: 'log-001',
            deviceId: 'device-001',
            stake: 1000,
            timestamp: new Date()
        });

        await StakeLog.create({
            id: 'log-002',
            deviceId: 'device-001',
            stake: 2000,
            timestamp: new Date(Date.now() - 3600000)  // 1 hour ago
        });

        await StakeLog.create({
            id: 'log-003',
            deviceId: 'device-002',
            stake: 1500,
            timestamp: new Date()
        });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();