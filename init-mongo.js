db = db.getSiblingDB('stake-limit-service');

// Create collections
db.createCollection('deviceconfigs');
db.createCollection('stakelogs');

// Initialize with sample data - matching seed.js structure
const device1Id = 'device-001';
const device2Id = 'device-002';
const currentDate = new Date();
const oneHourLater = new Date(currentDate);
oneHourLater.setHours(currentDate.getHours() + 1);
const oneHourAgo = new Date(currentDate);
oneHourAgo.setHours(currentDate.getHours() - 1);

// Device configs from seed.js
db.deviceconfigs.insertMany([
  {
    deviceId: device1Id,
    timeDuration: 3600,  // 1 hour in seconds
    stakeLimit: 10000,
    hotPercentage: 80,
    restrictionExpires: 1800,  // 30 minutes in seconds
    createdAt: currentDate,
    updatedAt: currentDate
  },
  {
    deviceId: device2Id,
    timeDuration: 7200,  // 2 hours in seconds
    stakeLimit: 5000,
    hotPercentage: 70,
    restrictionExpires: 3600,  // 1 hour in seconds
    blockedUntil: oneHourLater,
    createdAt: currentDate,
    updatedAt: currentDate
  }
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