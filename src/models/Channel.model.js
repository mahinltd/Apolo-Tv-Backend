// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    category: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    isWorking: {
      type: Boolean,
      default: true,
    },
    lastCheckedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

channelSchema.index({ url: 1 }, { unique: true });

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;