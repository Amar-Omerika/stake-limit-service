import mongoose from 'mongoose';

const deviceConfigSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  timeDuration: {
    type: Number,
    required: true,
    min: 300,    // 5 minuta
    max: 86400   // 24 sata
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
    min: 60 // 1 minuta
    // 0 = ne ističe nikada
  },
  blockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('DeviceConfig', deviceConfigSchema);
