import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/**
 * We use this function in `getServerSideProps` or `getStaticProps` to load the page's namespaces.
 *
 * @param {string} locale locale to load
 * @param {string|string[]} ns  namespace(s) to load
 * @returns {object} config that'll be used by next-i18next
 */
const loadPageNamespaces = (locale: string, ns: string | string[]) => {
  return serverSideTranslations(locale ?? 'en', [
    'common',
    'error',
    'radio',
    'quick-links',
    ...(Array.isArray(ns) ? ns : [ns]),
  ]);
};

export default loadPageNamespaces;
