import mongoose from 'mongoose';
import connectDB from './mongoose.js';
import DeviceConfig from '../models/DeviceConfig.js';
import StakeLog from '../models/StakeLog.js';
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator

async function seedDatabase() {
    try {
        await connectDB();

        // Clear existing data (optional)
        await DeviceConfig.deleteMany({});
        await StakeLog.deleteMany({});

        // Generate device UUIDs
        const device1Id = uuidv4();
        const device2Id = uuidv4();


        const device1 = await DeviceConfig.create({
            deviceId: device1Id,
            timeDuration: 1800, // 30 minutes in seconds
            stakeLimit: 400,
            hotPercentage: 80,
            restrictionExpires: 600, // 10 minutes in seconds
        });

        const device2 = await DeviceConfig.create({
            deviceId: device2Id,
            timeDuration: 7200,  // 2 hours in seconds
            stakeLimit: 5000,
            hotPercentage: 70,
            restrictionExpires: 3600,  // 1 hour in seconds
            blockedUntil: new Date(Date.now() + 3600000)  // Blocked for 1 hour from now
        });

        await StakeLog.create({
            id: uuidv4(),
            deviceId: device1Id,
            stake: 1000,
            timestamp: new Date()
        });

        await StakeLog.create({
            id: uuidv4(),
            deviceId: device1Id,
            stake: 2000,
            timestamp: new Date(Date.now() - 3600000)  // 1 hour ago
        });

        await StakeLog.create({
            id: uuidv4(),
            deviceId: device2Id,
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