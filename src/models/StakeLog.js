import mongoose from 'mongoose';

const stakeLogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  deviceId: {
    type: String,
    required: true
  },
  stake: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Za brže pretrage stake logova po uređaju u vremenskom rasponu
stakeLogSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model('StakeLog', stakeLogSchema);
