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
    backupUrls: [
      {
        type: String,
        trim: true,
      },
    ],
    fallbackUrls: [
      {
        type: String,
        trim: true,
      },
    ],
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
    syncedAt: {
      type: Date,
    },
    sourceType: {
      type: String,
      default: 'iptv-org',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

channelSchema.index({ url: 1 }, { unique: true });
channelSchema.index({ isWorking: 1, country: 1, category: 1 });

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;