// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const axios = require('axios');
const cron = require('node-cron');
const Channel = require('../models/Channel.model');

const checkChannelHealth = async () => {
  try {
    const channelsToCheck = await Channel.find({ isWorking: true }).select('_id url').limit(50).lean();

    if (!channelsToCheck.length) {
      console.log('🕒 Channel health check skipped: no channels found in database');
      return;
    }

    for (const channel of channelsToCheck) {
      try {
        const response = await axios.get(channel.url, {
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: () => true,
          headers: {
            Range: 'bytes=0-1',
            'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
          },
        });

        const isBlocked = response.status === 403 || response.status === 404;

        await Channel.updateOne(
          { _id: channel._id },
          {
            $set: {
              isWorking: !isBlocked,
              lastCheckedAt: new Date(),
            },
          }
        );
      } catch (error) {
        await Channel.updateOne(
          { _id: channel._id },
          {
            $set: {
              isWorking: false,
              lastCheckedAt: new Date(),
            },
          }
        );
      }
    }

    console.log(`🕒 Channel health check completed for ${channelsToCheck.length} channels`);
  } catch (error) {
    console.error('❌ Channel health check failed:', error.message);
  }
};

const startChannelHealthCron = () => {
  cron.schedule('0 */12 * * *', () => {
    checkChannelHealth();
  });

  console.log('🕒 Channel health cron initialized (every 12 hours)');
};

module.exports = { startChannelHealthCron };