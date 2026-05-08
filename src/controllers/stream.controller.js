// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const axios = require('axios');

const rewriteM3u8ToAbsoluteUrls = (m3u8Text, sourceUrl) => {
  const baseUrl = new URL('.', sourceUrl).href;

  return m3u8Text
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return line;
      }

      if (/^https?:\/\//i.test(trimmedLine)) {
        return trimmedLine;
      }

      return new URL(trimmedLine, baseUrl).href;
    })
    .join('\n');
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

    const upstreamResponse = await axios.get(parsedUrl.href, {
      responseType: 'text',
      timeout: 15000,
      headers: {
        'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
        Referer: 'https://google.com',
      },
    });

    const rewrittenM3u8 = rewriteM3u8ToAbsoluteUrls(String(upstreamResponse.data || ''), parsedUrl.href);

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
    return res.status(200).send(rewrittenM3u8);
  } catch (error) {
    return next(error);
  }
};

module.exports = { watchStream };