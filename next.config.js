/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-param-reassign */
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE_BUNDLE === 'true',
});
const { withSentryConfig } = require('@sentry/nextjs');
const withFonts = require('next-fonts');
const withPWA = require('next-pwa');
const nextTranslate = require('next-translate-plugin');

const securityHeaders = require('./configs/SecurityHeaders.js');
const runtimeCaching = require('./pwa-runtime-config.js');

const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const withPWAConfig = withPWA({
  dest: 'public',
  disable: !isProduction,
  mode: isProduction ? 'production' : 'development',
  publicExcludes: [
    '!fonts/**/!(sura_names|Figtree)*', // exclude pre-caching all fonts that are not sura_names or Figtree
    '!icons/**', // exclude all icons
    '!images/**/!(background|homepage)*', // don't pre-cache except background.jpg and homepage.png
  ],
  runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  swcMinify: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'cdn.qurancdn.com',
      'static.qurancdn.com',
      'vercel.com',
      'now.sh',
      'quran.com',
      'images.quran.com',
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve = {
      ...webpackConfig.resolve,
      alias: {
        ...webpackConfig.resolve.alias,
        'audio-worklet': path.resolve(__dirname, 'src/audioInput/audio-worklet.ts'),
      },
    };
    webpackConfig.module.parser = {
      ...webpackConfig.module.parser,
      javascript: {
        worker: ['AudioWorklet from audio-worklet'],
      },
    };

    webpackConfig.module.rules.push({
      test: /\.svg$/i,
      issuer: {
        and: [/\.(js|ts)x?$/],
      },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    return webpackConfig;
  },
  headers: async () => {
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
  redirects: async () => [
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
  ],
  compiler: {
    removeConsole: !isDev,
  },
};

// Apply plugins
const configWithPlugins = withBundleAnalyzer(withFonts(nextTranslate(withPWAConfig(nextConfig))));

// Apply Sentry configuration
module.exports = withSentryConfig(configWithPlugins, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'sentry',
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
  sentryUrl: process.env.NEXT_PUBLIC_SENTRY_URL,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: false,
});
