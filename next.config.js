const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');
const nextTranslate = require('next-translate');
const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
const securityHeaders = require('./configs/SecurityHeaders.js');

const config = {
  images: {
    domains: ['cdn.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
    runtimeCaching,
    publicExcludes: ['!fonts/v1/**/*', '!fonts/v2/**/*'],
  },
  async headers() {
    return [
      {
        source: '/:route*', // apply security rules to all routes.
        headers: securityHeaders,
      },
      {
        source: '/fonts/:font*', // match wildcard fonts' path which will match any font file on any level under /fonts.
        headers: [
          {
            key: 'cache-control',
            value: 'public, max-age=31536000, immutable', // Max-age is 1 year. immutable indicates that the font will not change over the expiry time.
          },
        ],
      },
    ];
  },
};

module.exports = withPlugins([withPWA, withFonts, nextTranslate], config);
