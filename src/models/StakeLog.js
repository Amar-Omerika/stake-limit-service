import mongoose from "mongoose";

const stakeLogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  stake: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// For faster searches of stake logs by device in a time range
stakeLogSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model('StakeLog', stakeLogSchema);