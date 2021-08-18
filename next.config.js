const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');
const nextTranslate = require('next-translate');
const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

const config = {
  images: {
    domains: ['cdn.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
  pwa: {
    disable: process.env.NEXT_PUBLIC_VERCEL_ENV === 'development',
    dest: 'public',
    runtimeCaching,
    publicExcludes: ['!fonts/v1/**/*', '!fonts/v2/**/*'],
  },
};

module.exports = withPlugins([withPWA, withFonts, nextTranslate], config);
