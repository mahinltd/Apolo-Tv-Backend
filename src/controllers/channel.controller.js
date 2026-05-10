// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const NodeCache = require('node-cache');
const Channel = require('../models/Channel.model');
const { fetchAndParseChannels } = require('../services/channel.service');
const { syncChannelsToDatabase } = require('../services/channel-sync.service');
const { registerTemporaryPlaybackSource } = require('./stream.controller');
const cache = new NodeCache({ stdTTL: 600 });

const normalize = (value) => String(value || '').trim().toLowerCase();

const getPlaybackUrl = (channelId) => `/api/v1/stream/play/${channelId}`;

const formatChannelResponse = (channel, baseUrl) => {
  const playbackPath = channel.playbackUrl || getPlaybackUrl(channel._id);
  const playbackUrl = playbackPath.startsWith('http') ? playbackPath : `${baseUrl}${playbackPath}`;

  if (!channel.logo || channel.logo === 'Unknown') {
    console.debug(`logo-missing: channel=${channel._id} name="${channel.name}"`);
  }

  return {
    _id: channel._id,
    name: channel.name,
    logo: channel.logo,
    logoUrl: channel.logo,
    image: channel.logo,
    icon: channel.logo,
    country: channel.country,
    language: channel.language,
    category: channel.category,
    isWorking: channel.isWorking !== false,
    playbackUrl,
    playUrl: playbackUrl,
    streamUrl: playbackUrl,
    url: playbackUrl,
    lastCheckedAt: channel.lastCheckedAt,
    syncedAt: channel.syncedAt,
  };
};

const getChannelsFromDatabase = async () => {
  return Channel.find({ isWorking: { $ne: false } })
    .select('_id name logo country language category isWorking lastCheckedAt syncedAt')
    .sort({ updatedAt: -1 })
    .lean();
};

const filterChannels = (channels, searchTerm, countryTerm, limit) => {
  const countryAliases = new Set([countryTerm]);

  if (countryTerm.length === 2) {
    try {
      const regionName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryTerm.toUpperCase());
      if (regionName) {
        countryAliases.add(normalize(regionName));
      }
    } catch (error) {
      // Ignore locale resolution failures and fall back to raw term matching.
    }
  }

  let filteredChannels = channels;

  if (searchTerm) {
    filteredChannels = channels.filter((channel) => {
      return (
        normalize(channel.name).includes(searchTerm) ||
        normalize(channel.country).includes(searchTerm) ||
        normalize(channel.category).includes(searchTerm)
      );
    });
  } else if (countryTerm) {
    filteredChannels = channels.filter((channel) => {
      const channelCountry = normalize(channel.country);
      const channelCategory = normalize(channel.category);

      return Array.from(countryAliases).some(
        (alias) => channelCountry.includes(alias) || channelCategory.includes(alias)
      );
    });
  }

  return filteredChannels.slice(0, limit);
};

const getGlobalChannels = async (req, res, next) => {
  try {
    const { country, search } = req.query;
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 100;
    const searchTerm = normalize(search);
    const countryTerm = normalize(country);
    const includeUnavailable = String(req.query.includeUnavailable || '').toLowerCase() === 'true';
    const cacheKey = `channels-db:${countryTerm || 'all'}:${searchTerm || 'none'}:${limit}:${
      includeUnavailable ? 'all' : 'working'
    }`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const proto = req.get('x-forwarded-proto') || req.protocol;
    const hostHeader = req.get('x-forwarded-host') || req.get('host');
    const baseUrl = process.env.BASE_URL || `${proto}://${hostHeader}`;
    console.debug(`channels-baseUrl: using ${baseUrl} (proto=${proto} host=${hostHeader})`);

    let databaseChannels = await getChannelsFromDatabase();

    if (!databaseChannels.length) {
      try {
        await syncChannelsToDatabase();
      } catch (error) {
        // Keep serving channels even if the sync job is temporarily unavailable.
      }

      databaseChannels = await getChannelsFromDatabase();
    }

    if (includeUnavailable) {
      databaseChannels = await Channel.find()
        .select('_id name logo country language category isWorking lastCheckedAt syncedAt')
        .sort({ updatedAt: -1 })
        .lean();
    }

    if (!databaseChannels.length) {
      const dynamicChannels = await fetchAndParseChannels();
      const responseChannels = filterChannels(
        dynamicChannels.map((channel, index) => ({
          _id: channel._id || `${channel.url || 'channel'}-${index}`,
          name: channel.name,
          logo: channel.logo,
          country: channel.country,
          language: channel.language,
          category: channel.category,
          isWorking: true,
          lastCheckedAt: null,
          syncedAt: null,
          playbackUrl: registerTemporaryPlaybackSource(channel.url),
        })),
        searchTerm,
        countryTerm,
        limit
      ).map((channel) => formatChannelResponse(channel, baseUrl));

      const fallbackResponse = {
        status: 'success',
        totalFetched: responseChannels.length,
        channels: responseChannels,
      };

      cache.set(cacheKey, fallbackResponse);

      return res.status(200).json(fallbackResponse);
    }

    const channels = filterChannels(databaseChannels, searchTerm, countryTerm, limit).map((c) =>
      formatChannelResponse(c, baseUrl)
    );

    const responseData = {
      status: 'success',
      totalFetched: channels.length,
      channels,
    };

    console.debug(`channels-served: count=${channels.length} baseUrl=${baseUrl}`);

    cache.set(cacheKey, responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getGlobalChannels };
