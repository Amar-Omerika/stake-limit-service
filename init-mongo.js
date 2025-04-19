db = db.getSiblingDB('stake-limit-service');

// Create collections
db.createCollection('deviceconfigs');
db.createCollection('stakelogs');

// Initialize with sample data - matching seed.js structure
const device1Id = "33fde188-5685-443b-8d72-162fae4e392d";
const device2Id = "13a8febe-5c88-4d31-aec2-04dd029f2516";
const currentDate = new Date();
const oneHourLater = new Date(currentDate);
oneHourLater.setHours(currentDate.getHours() + 1);
const oneHourAgo = new Date(currentDate);
oneHourAgo.setHours(currentDate.getHours() - 1);

// Device configs from seed.js
db.deviceconfigs.insertMany([
	{
		deviceId: device1Id,
		timeDuration: 1800, // 30 minutes in seconds
		stakeLimit: 400,
		hotPercentage: 80, // Hot threshold = 799.2
		restrictionExpires: 600, // 10 minutes in seconds
		blockedUntil: null, // Not blocked
		createdAt: currentDate,
		updatedAt: currentDate,
	},
	{
		deviceId: device2Id,
		timeDuration: 7200, // 2 hours in seconds
		stakeLimit: 5000,
		hotPercentage: 70,
		restrictionExpires: 3600, // 1 hour in seconds
		blockedUntil: oneHourLater,
		createdAt: currentDate,
		updatedAt: currentDate,
	},
]);

// Stake logs from seed.js
db.stakelogs.insertMany([
  {
    id: "stakeLog001",
    deviceId: device1Id,
    stake: 1000,
    timestamp: currentDate
  },
  {
    id: "stakeLog002",
    deviceId: device1Id,
    stake: 2000,
    timestamp: oneHourAgo
  },
  {
    id: "stakeLog003",
    deviceId: device2Id,
    stake: 1500,
    timestamp: currentDate
  }
]);