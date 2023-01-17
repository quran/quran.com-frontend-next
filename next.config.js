/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-param-reassign */

const withBundleAnalyzer = require('@next/bundle-analyzer');
const { withSentryConfig } = require('@sentry/nextjs');
const withPWA = require('next-pwa');
const nextTranslate = require('next-translate');

const pwa = require('./configs/pwa.js');
const securityHeaders = require('./configs/security-headers.js');
const sentry = require('./configs/sentry.js');

const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true, // {@see https://nextjs.org/docs/advanced-features/source-maps}
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['cdn.qurancdn.com', 'static.qurancdn.com', 'vercel.com', 'now.sh', 'quran.com'],
  },
  webpack: (webpackConfig) => {
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

let finalConfig = { ...config };

const plugins = [
  withBundleAnalyzer({
    enabled: process.env.ANALYZE_BUNDLE === 'true',
  }),
  withPWA(pwa),
  nextTranslate,
];

plugins.forEach((plugin) => {
  finalConfig = plugin(finalConfig);
});

// withSentryConfig must be outside withPlugins because its config is the second argument
module.exports = withSentryConfig(finalConfig, sentry);
