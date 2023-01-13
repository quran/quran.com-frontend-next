/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/* eslint-disable max-lines */
// Workbox RuntimeCaching config: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry

/**
 * This is a copy of next-pwa's default runtime cache https://github.com/shadowwalker/next-pwa/blob/master/cache.js
 * except for the MP3 config which we are disabling because it seems to be causing an
 * exception for cached MP3 files (at least on Firefox):
 *
 * Failed to load ‘https://download.quranicaudio.com/qdc/{reader}/{readingStyle}/{fileName}.mp3’
 * e.g. "https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/005.mp3"
 * A ServiceWorker intercepted the request and encountered an unexpected error.
 */

module.exports = [
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts-stylesheets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  // {
  //   urlPattern: /^https:\/\/download.quranicaudio.com\/.*.mp3/i,
  //   handler: 'CacheFirst',
  //   options: {
  //     rangeRequests: true,
  //     cacheName: 'static-audio-assets',
  //     cacheableResponse: {
  //       // workbox by default only caches response with 200 HTTP status
  //       statuses: [0, 200, 206],
  //     },
  //     expiration: {
  //       maxEntries: 500,
  //       maxAgeSeconds: 24 * 60 * 60, // 24 hours
  //     },
  //   },
  // },
  {
    urlPattern: /\.(?:mp4)$/i,
    handler: 'CacheFirst',
    options: {
      rangeRequests: true,
      cacheName: 'static-video-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-js-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\.(?:css|less)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-style-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-data',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\.(?:json|xml|csv)$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'static-data-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: ({ url }) => {
      const isSameOrigin = self.origin === url.origin;
      if (!isSameOrigin) return false;
      const { pathname } = url;
      // Exclude /api/auth/callback/* to fix OAuth workflow in Safari without impact other environment
      // Above route is default for next-auth, you may need to change it if your OAuth workflow has a different callback route
      // Issue: https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809
      if (pathname.startsWith('/api/auth/')) return false;
      if (pathname.startsWith('/api/')) return true;
      return false;
    },
    handler: 'NetworkFirst',
    method: 'GET',
    options: {
      cacheName: 'apis',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      networkTimeoutSeconds: 10, // fall back to cache if api does not response within 10 seconds
    },
  },
  {
    urlPattern: ({ url }) => {
      const isSameOrigin = self.origin === url.origin;
      if (!isSameOrigin) return false;
      const { pathname } = url;
      if (pathname.startsWith('/api/')) return false;
      return true;
    },
    handler: 'NetworkFirst',
    options: {
      cacheName: 'others',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      networkTimeoutSeconds: 10,
    },
  },
  {
    urlPattern: ({ url }) => {
      const { pathname } = url;
      const isSameOrigin = self.origin === url.origin;
      // cache everything except mp3 files
      return !isSameOrigin && !pathname.endsWith('.mp3');
    },
    handler: 'NetworkFirst',
    options: {
      cacheName: 'cross-origin',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 60 * 60, // 1 hour
      },
      networkTimeoutSeconds: 10,
    },
  },
];
