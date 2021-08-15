const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');
const nextTranslate = require('next-translate');
const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');
const { withSentryConfig } = require('@sentry/nextjs');

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
};

module.exports = withPlugins([withPWA, withFonts, nextTranslate, withSentryConfig], config);
