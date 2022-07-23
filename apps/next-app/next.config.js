// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/

/* eslint-disable no-param-reassign */
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE_BUNDLE === 'true',
});
const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const withFonts = require('next-fonts');
const withPWA = require('next-pwa');
const nextTranslate = require('next-translate');

const securityHeaders = require('./configs/SecurityHeaders.js');
const runtimeCaching = require('./pwa-runtime-config.js');

const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const nextConfig = {
  webpack5: true,
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },
  output: {
    standalone: true,
  },
  i18n: {
    locales: [
      'en',
      'ar',
      'bn',
      'fa',
      'fr',
      'id',
      'it',
      'nl',
      'pt',
      'ru',
      'sq',
      'th',
      'tr',
      'ur',
      'zh',
      'ms',
    ],
    defaultLocale: 'en',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'cdn.qurancdn.com',
      'static.qurancdn.com',
      'vercel.com',
      'now.sh',
      'quran.com',
    ],
  },
  pwa: {
    disable: !isProduction,
    dest: 'public',
    mode: isProduction ? 'production' : 'development',
    runtimeCaching,
    publicExcludes: [
      '!fonts/**/!(sura_names|ProximaVara)*', // exclude pre-caching all fonts that are not sura_names or ProximaVara
      '!icons/**', // exclude all icons
      '!images/**/!(background|homepage)*', // don't pre-cache except background.jpg and homepage.png
    ],
  },
  // this is needed to support importing audioWorklet nodes. {@see https://github.com/webpack/webpack/issues/11543#issuecomment-826897590}
  webpack: (webpackConfig) => {
    webpackConfig.resolve = {
      ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve.alias,
        'audio-worklet': path.resolve(
          __dirname,
          'src/audioInput/audio-worklet.ts'
        ),
      },
    };
    webpackConfig.module.parser = {
      ...webpackConfig.module.parser,
      javascript: {
        worker: ['AudioWorklet from audio-worklet'],
      },
    };

    return webpackConfig;
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
          {
            source: '/images/:image*', // match wildcard images' path which will match any image file on any level under /images.
            headers: [
              {
                key: 'cache-control',
                value: 'public, max-age=604800, immutable', // Max-age is 1 week. immutable indicates that the image will not change over the expiry time.
              },
            ],
          },
          {
            source: '/icons/:icon*', // match wildcard icons' path which will match any icon file on any level under /icons.
            headers: [
              {
                key: 'cache-control',
                value: 'public, max-age=604800, immutable', // Max-age is 1 week. immutable indicates that the icon will not change over the expiry time.
              },
            ],
          },
        ];
  },
  async redirects() {
    return [
      {
        source: '/:surah/:from(\\d{1,})\\::to(\\d{1,})', // 1/2:3 => 1/2-3
        destination: '/:surah/:from-:to',
        permanent: true,
      },
      {
        source: '/:surah\\::from(\\d{1,})\\::to(\\d{1,})', // 1:2:3 => 1/2-3
        destination: '/:surah/:from-:to',
        permanent: true,
      },
      {
        source: '/:surah(\\d{1,})-:from\\::to', // 1-2:3 => 1/2-3
        destination: '/:surah/:from-:to',
        permanent: true,
      },
      {
        source: '/:surah(\\d{1,})-:from(\\d{1,})-:to(\\d{1,})', // 1-2-3 => 1/2-3
        destination: '/:surah/:from-:to',
        permanent: true,
      },
      {
        source: '/:surah(\\d{1,})\\::from(\\d{1,})-:to(\\d{1,})', // 1:2-3 => 1/2-3
        destination: '/:surah/:from-:to',
        permanent: true,
      },
    ];
  },
};

module.exports = withPlugins(
  [
    [withNx],
    [withBundleAnalyzer],
    [withPWA],
    [withFonts],
    [nextTranslate],
    [withSentryConfig],
  ],
  nextConfig
);
