// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const { fetchAndParseChannels } = require('../services/channel.service');

const getGlobalChannels = async (req, res, next) => {
  try {
    const { country, search } = req.query;
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 100;

    // Fetch and parse all channels from M3U
    const allChannels = await fetchAndParseChannels();

    const normalize = (value) => String(value || '').trim().toLowerCase();
    const searchTerm = normalize(search);
    const countryTerm = normalize(country);
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

    let filteredChannels = allChannels;

    if (searchTerm) {
      filteredChannels = allChannels.filter((channel) => normalize(channel.name).includes(searchTerm));
    } else if (countryTerm) {
      filteredChannels = allChannels.filter((channel) => {
        const channelCountry = normalize(channel.country);
        const channelCategory = normalize(channel.category);

        return Array.from(countryAliases).some(
          (alias) => channelCountry.includes(alias) || channelCategory.includes(alias)
        );
      });
    }

    // Apply limit after filtering to keep responses small and relevant
    const channels = filteredChannels.slice(0, limit);

    res.status(200).json({
      status: 'success',
      totalFetched: channels.length,
      channels,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGlobalChannels };
