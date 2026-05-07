// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const { fetchAndParseChannels } = require('../services/channel.service');

const getGlobalChannels = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    // Fetch and parse all channels from M3U
    const allChannels = await fetchAndParseChannels();

    // Apply limit to prevent response overload
    const channels = allChannels.slice(0, limit);

    res.status(200).json({
      status: 'success',
      totalFetched: channels.length,
      totalAvailable: allChannels.length,
      channels: channels,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGlobalChannels };
