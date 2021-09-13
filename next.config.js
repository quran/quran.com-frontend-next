const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withFonts = require('next-fonts');
const nextTranslate = require('next-translate');
const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
const { withSentryConfig } = require('@sentry/nextjs');
const securityHeaders = require('./configs/SecurityHeaders.js');

const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const config = {
  images: {
    domains: ['cdn.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
  pwa: {
    disable: isDev,
    dest: 'public',
    runtimeCaching,
    publicExcludes: ['!fonts/v1/**/*', '!fonts/v2/**/*'],
  },
  SentryWebpackPluginOptions: {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
  },
  async headers() {
    return isDev
      ? []
      : [
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

module.exports = withPlugins(
  [withBundleAnalyzer, withPWA, withFonts, nextTranslate, withSentryConfig],
  config,
);
