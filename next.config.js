const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');

const config = {
  images: {
    domains: ['cdn.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
  future: { webpack5: true },
};

module.exports = withPlugins([withFonts], config);
