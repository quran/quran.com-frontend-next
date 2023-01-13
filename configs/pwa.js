const runtimeCaching = require('./pwa-cache.js');

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

module.exports = {
  disable: !isProduction,
  dest: 'public',
  mode: isProduction ? 'production' : 'development',
  runtimeCaching,
  publicExcludes: [
    '!fonts/**/!(sura_names|ProximaVara)*', // exclude pre-caching all fonts that are not sura_names or ProximaVara
    '!icons/**', // exclude all icons
    '!images/**/!(background|homepage)*', // don't pre-cache except background.jpg and homepage.png
  ],
};
