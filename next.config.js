const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');

const config = {
  images: {
    domains: ['cdn.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
};

module.exports = withPlugins([withFonts], config);
