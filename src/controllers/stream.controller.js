// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const axios = require('axios');
const crypto = require('crypto');
const NodeCache = require('node-cache');
const Channel = require('../models/Channel.model');

const streamCache = new NodeCache({ stdTTL: 30, checkperiod: 60 });
const temporaryPlaybackCache = new NodeCache({ stdTTL: 1800, checkperiod: 60 });

const registerTemporaryPlaybackSource = (sourceUrl) => {
  const token = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  temporaryPlaybackCache.set(token, sourceUrl);
  // Return token only; controller will generate absolute URL to avoid leaking host assumptions here.
  return `/api/v1/stream/play/temp/${token}`;
};

const getTemporaryPlaybackSource = (token) => {
  return temporaryPlaybackCache.get(token);
};

const buildPlaybackAssetUrl = (channelId, resourcePath) => {
  const encodedPath = encodeURIComponent(String(resourcePath || '').trim());
  return `/api/v1/stream/play/${channelId}/asset?path=${encodedPath}`;
};

const rewriteM3u8ToAbsoluteUrls = (m3u8Text, sourceUrl) => {
  const baseUrl = new URL('.', sourceUrl).href;

  return m3u8Text
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/gi, (match, uriValue) => {
          if (/^https?:\/\//i.test(uriValue)) {
            return `URI="${uriValue}"`;
          }

          return `URI="${new URL(uriValue, baseUrl).href}"`;
        });
      }

      if (/^https?:\/\//i.test(trimmedLine)) {
        return trimmedLine;
      }

      return new URL(trimmedLine, baseUrl).href;
    })
    .join('\n');
};

const rewriteM3u8ToInternalUrls = (m3u8Text, sourceUrl, channelId) => {
  const baseUrl = new URL('.', sourceUrl).href;

  return m3u8Text
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/gi, (match, uriValue) => {
          return `URI="${buildPlaybackAssetUrl(channelId, uriValue)}"`;
        });
      }

      const resolvedUrl = /^https?:\/\//i.test(trimmedLine) ? trimmedLine : new URL(trimmedLine, baseUrl).href;
      return buildPlaybackAssetUrl(channelId, resolvedUrl);
    })
    .join('\n');
};

const getProxyHeaders = () => ({
  'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
  Referer: 'https://google.com',
  Accept: '*/*',
});

const fetchWithRetry = async (url, options = {}, attempts = 2) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await axios.get(url, {
        timeout: options.timeout || 15000,
        responseType: options.responseType || 'text',
        headers: {
          ...getProxyHeaders(),
          ...(options.headers || {}),
        },
        validateStatus: () => true,
        maxRedirects: 5,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const setPlaylistHeaders = (res) => {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=30, stale-while-revalidate=60');
  res.setHeader('Vary', 'Accept-Encoding, Origin');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
};

const setAssetHeaders = (res, upstreamResponse, contentTypeHint) => {
  const contentType = upstreamResponse?.headers?.['content-type'] || contentTypeHint || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=300');
  res.setHeader('Vary', 'Accept-Encoding, Origin');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
};

const isPlaylistContent = (url, response) => {
  const contentType = String(response?.headers?.['content-type'] || '').toLowerCase();
  return (
    url.toLowerCase().includes('.m3u8') ||
    contentType.includes('application/vnd.apple.mpegurl') ||
    contentType.includes('application/x-mpegurl')
  );
};

const choosePlaybackSource = async (sourceCandidates) => {
  let lastResponse = null;
  let lastError = null;

  for (const candidate of sourceCandidates) {
    if (!candidate) {
      continue;
    }

    try {
      const response = await fetchWithRetry(candidate, { timeout: 15000, responseType: 'text' }, 2);
      if (response.status >= 200 && response.status < 300) {
        return { sourceUrl: candidate, response };
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  const error = new Error('Unable to resolve a working stream source');
  error.upstreamResponse = lastResponse;
  error.cause = lastError;
  throw error;
};

const markChannelUnavailable = async (channelId) => {
  if (!channelId) {
    return;
  }

  await Channel.updateOne(
    { _id: channelId },
    {
      $set: {
        isWorking: false,
        lastCheckedAt: new Date(),
      },
    }
  );
};

const resolveChannelSources = (channel) => {
  return [channel.url, ...(Array.isArray(channel.backupUrls) ? channel.backupUrls : []), ...(Array.isArray(channel.fallbackUrls) ? channel.fallbackUrls : [])].filter(Boolean);
};

const proxyPlaylistResponse = async (res, channelId, sourceUrl) => {
  const cacheKey = `stream-playlist:${channelId}:${sourceUrl}`;
  const cached = streamCache.get(cacheKey);

  if (cached) {
    setPlaylistHeaders(res);
    return res.status(200).send(cached);
  }

  const upstreamResponse = await fetchWithRetry(sourceUrl, { timeout: 15000, responseType: 'text' }, 2);
  const originalText = String(upstreamResponse.data || '');
  const rewrittenM3u8 = rewriteM3u8ToInternalUrls(originalText, sourceUrl, channelId);

  // Debug: log upstream status and sizes (no URLs leaked)
  console.debug(`proxy-playlist: channelId=${channelId} status=${upstreamResponse.status} originalBytes=${originalText.length} rewrittenBytes=${rewrittenM3u8.length}`);

  streamCache.set(cacheKey, rewrittenM3u8);
  setPlaylistHeaders(res);

  return res.status(200).send(rewrittenM3u8);
};

const watchStream = async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'url query parameter is required',
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid stream URL',
      });
    }

    if (!/^https?:$/i.test(parsedUrl.protocol)) {
      return res.status(400).json({
        status: 'error',
        message: 'Only http/https stream URLs are supported',
      });
    }

    const upstreamResponse = await fetchWithRetry(parsedUrl.href, { timeout: 15000, responseType: 'text' }, 2);

    const rewrittenM3u8 = rewriteM3u8ToAbsoluteUrls(String(upstreamResponse.data || ''), parsedUrl.href);

    setPlaylistHeaders(res);
    return res.status(200).send(rewrittenM3u8);
  } catch (error) {
    return next(error);
  }
};

const playStream = async (req, res, next) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id).select('_id url backupUrls fallbackUrls isWorking').lean();

    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found',
      });
    }

    const sourceCandidates = resolveChannelSources(channel);

    if (!sourceCandidates.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No stream source available for this channel',
      });
    }

    let playback;

    try {
      playback = await choosePlaybackSource(sourceCandidates);
    } catch (error) {
      await markChannelUnavailable(id);
      return res.status(410).json({
        status: 'error',
        message: 'Channel is temporarily unavailable',
      });
    }

    if (!playback?.response) {
      await markChannelUnavailable(id);
      return res.status(410).json({
        status: 'error',
        message: 'Channel is temporarily unavailable',
      });
    }

    if (isPlaylistContent(playback.sourceUrl, playback.response)) {
      return proxyPlaylistResponse(res, id, playback.sourceUrl);
    }

    return res.redirect(302, buildPlaybackAssetUrl(id, playback.sourceUrl));
  } catch (error) {
    return next(error);
  }
};

const playTemporaryStream = async (req, res, next) => {
  try {
    const { token } = req.params;
    const sourceUrl = getTemporaryPlaybackSource(token);

    if (!sourceUrl) {
      return res.status(404).json({
        status: 'error',
        message: 'Temporary playback session expired',
      });
    }

    const upstreamResponse = await fetchWithRetry(sourceUrl, { timeout: 15000, responseType: 'text' }, 2);

    if (isPlaylistContent(sourceUrl, upstreamResponse)) {
      const rewrittenM3u8 = rewriteM3u8ToInternalUrls(String(upstreamResponse.data || ''), sourceUrl, token);
      setPlaylistHeaders(res);
      return res.status(200).send(rewrittenM3u8);
    }

    return res.redirect(302, buildPlaybackAssetUrl(token, sourceUrl));
  } catch (error) {
    return next(error);
  }
};

const relayStreamAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        status: 'error',
        message: 'path query parameter is required',
      });
    }

    const channel = await Channel.findById(id).select('_id url backupUrls fallbackUrls isWorking').lean();

    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found',
      });
    }

    const sourceCandidates = resolveChannelSources(channel);

    if (!sourceCandidates.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No stream source available for this channel',
      });
    }

    const targetPath = decodeURIComponent(String(path));
    let lastError = null;

    for (const sourceCandidate of sourceCandidates) {
      try {
        const resolvedTargetUrl = /^https?:\/\//i.test(targetPath) ? targetPath : new URL(targetPath, sourceCandidate).href;

        const upstreamResponse = await axios.get(resolvedTargetUrl, {
          responseType: 'stream',
          timeout: 15000,
          maxRedirects: 5,
          headers: {
            ...getProxyHeaders(),
            ...(req.headers.range ? { Range: req.headers.range } : {}),
          },
          validateStatus: () => true,
        });

        if (upstreamResponse.status < 200 || upstreamResponse.status >= 300) {
          lastError = new Error(`Upstream returned status ${upstreamResponse.status}`);
          continue;
        }

        if (isPlaylistContent(resolvedTargetUrl, upstreamResponse)) {
          const playlistText = await new Promise((resolve, reject) => {
            const chunks = [];
            upstreamResponse.data.on('data', (chunk) => chunks.push(chunk));
            upstreamResponse.data.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            upstreamResponse.data.on('error', reject);
          });

          const rewrittenPlaylist = rewriteM3u8ToInternalUrls(playlistText, resolvedTargetUrl, id);
          setPlaylistHeaders(res);
          return res.status(200).send(rewrittenPlaylist);
        }

        setAssetHeaders(res, upstreamResponse, 'application/octet-stream');

        upstreamResponse.data.on('error', next);
        return upstreamResponse.data.pipe(res);
      } catch (error) {
        lastError = error;
      }
    }

    await markChannelUnavailable(id);

    return res.status(502).json({
      status: 'error',
      message: 'Failed to fetch stream asset',
      details: lastError ? lastError.message : 'Unknown upstream failure',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  watchStream,
  playStream,
  playTemporaryStream,
  relayStreamAsset,
  registerTemporaryPlaybackSource,
};