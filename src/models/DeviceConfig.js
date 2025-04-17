import mongoose from "mongoose";

const deviceConfigSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  timeDuration: {
    type: Number,
    required: true,
    min: 300,    // 5 minutes in seconds
    max: 86400   // 24 hours in seconds
  },
  stakeLimit: {
    type: Number,
    required: true,
    min: 1,
    max: 10000000
  },
  hotPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  restrictionExpires: {
    type: Number,
    required: true,
    min: 60,    // 1 minute in seconds
    default: 0  // never expires
  },
  blockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('DeviceConfig', deviceConfigSchema);