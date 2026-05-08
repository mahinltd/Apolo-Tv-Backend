// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const axios = require('axios');

const extractCountryCodeFromTvgId = (metaData) => {
	const idCountryMatch = metaData.match(/tvg-id="[^"]*\.([a-z]{2,3})@[^\"]*"/i);
	return idCountryMatch ? idCountryMatch[1].toUpperCase() : null;
};

const extractCountryCodeFromUrl = (url) => {
	const normalizedUrl = String(url || '').toLowerCase();

	if (normalizedUrl.includes('/bangladesh/')) {
		return 'BD';
	}

	return null;
};

const fetchAndParseChannels = async () => {
	try {
		console.log('🔗 Fetching M3U data from IPTV-ORG...');
		const response = await axios.get('https://iptv-org.github.io/iptv/index.m3u');
		const m3uText = response.data;
		const lines = m3uText.split('\n');
		const channels = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Parse M3U info line
			if (line.startsWith('#EXTINF:')) {
				const extinf = line.substring(8);
				const metaParts = extinf.split(',');
				const channelName = metaParts[1] ? metaParts[1].trim() : 'Unknown';

				// Extract metadata from the first part
				const metaData = metaParts[0] || '';
				const nameMatch = metaData.match(/tvg-name="([^"]*)"/i);
				const logoMatch = metaData.match(/tvg-logo="([^"]*)"/i);
				const countryMatch = metaData.match(/tvg-country="([^"]*)"/i);
				const derivedCountryCode = extractCountryCodeFromTvgId(metaData);
				const languageMatch = metaData.match(/tvg-language="([^"]*)"/i);
				const groupMatch = metaData.match(/group-title="([^"]*)"/i);

				// Get the URL from the next line
				let url = 'Unknown';
				if (i + 1 < lines.length) {
					const nextLine = lines[i + 1].trim();
					if (!nextLine.startsWith('#')) {
						url = nextLine;
						i++; // Skip the URL line in the next iteration
					}
				}

				const derivedCountryFromUrl = extractCountryCodeFromUrl(url);

				channels.push({
					name: nameMatch ? nameMatch[1] : channelName,
					logo: logoMatch ? logoMatch[1] : 'Unknown',
					country: countryMatch ? countryMatch[1] : derivedCountryCode || derivedCountryFromUrl || 'Unknown',
					language: languageMatch ? languageMatch[1] : 'Unknown',
					category: groupMatch ? groupMatch[1] : 'Unknown',
					url: url,
				});
			}
		}

		console.log(`✅ Successfully parsed ${channels.length} channels from M3U`);
		return channels;
	} catch (error) {
		console.error(`❌ Error fetching M3U data: ${error.message}`);
		throw error;
	}
};

module.exports = { fetchAndParseChannels };