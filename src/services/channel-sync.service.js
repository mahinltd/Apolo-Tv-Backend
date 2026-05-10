// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const cron = require('node-cron');
const Channel = require('../models/Channel.model');
const { fetchAndParseChannels } = require('./channel.service');

let isSyncRunning = false;

const buildChannelDocument = (channel, syncedAt) => ({
  name: channel.name,
  url: channel.url,
  backupUrls: Array.isArray(channel.backupUrls) ? channel.backupUrls.filter(Boolean) : [],
  fallbackUrls: Array.isArray(channel.fallbackUrls) ? channel.fallbackUrls.filter(Boolean) : [],
  country: channel.country || 'Unknown',
  category: channel.category || 'Unknown',
  language: channel.language || 'Unknown',
  logo: channel.logo || 'Unknown',
  isWorking: channel.isWorking !== false,
  syncedAt,
  sourceType: 'iptv-org',
});

const syncChannelsToDatabase = async () => {
  if (isSyncRunning) {
    console.log('🕒 Channel sync skipped: a sync is already running');
    return { synced: 0, skipped: true };
  }

  isSyncRunning = true;

  try {
    const parsedChannels = await fetchAndParseChannels();
    const syncedAt = new Date();

    const operations = parsedChannels.map((channel) => ({
      updateOne: {
        filter: { url: channel.url },
        update: {
          $set: buildChannelDocument(channel, syncedAt),
          $setOnInsert: {
            createdAt: syncedAt,
          },
        },
        upsert: true,
      },
    }));

    if (!operations.length) {
      console.log('🕒 Channel sync skipped: no channels parsed from source');
      return { synced: 0, skipped: true };
    }

    const result = await Channel.bulkWrite(operations, { ordered: false });
    const synced = result.upsertedCount + result.modifiedCount;

    console.log(`🕒 Channel sync completed: ${synced} records updated from IPTV-ORG`);

    return {
      synced,
      totalParsed: parsedChannels.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    };
  } catch (error) {
    console.error(`❌ Channel sync failed: ${error.message}`);
    throw error;
  } finally {
    isSyncRunning = false;
  }
};

const startChannelSyncCron = () => {
  const cronExpression = process.env.CHANNEL_SYNC_CRON || '0 */12 * * *';

  cron.schedule(cronExpression, () => {
    syncChannelsToDatabase().catch((error) => {
      console.error('❌ Channel sync cron failed:', error.message);
    });
  });

  console.log(`🕒 Channel sync cron initialized (${cronExpression})`);
};

module.exports = {
  syncChannelsToDatabase,
  startChannelSyncCron,
};