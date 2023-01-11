/**
 * @type {import('next').NextConfig}
 */
module.exports = {
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
  localePath:
    typeof window === 'undefined'
      ? // eslint-disable-next-line global-require
        require('path').resolve('./locales')
      : '/locales',
};
