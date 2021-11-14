/* eslint-disable react-func/max-lines-per-function */
import { NextSeoProps } from 'next-seo';

import { getLanguageAlternates } from './locale';

export const config = {
  siteName: 'Quran.com',
  defaultDescription: 'The Quran translated into many languages in a simple and easy interface', // TODO: this needs localization
  websiteLogo: 'https://next.quran.com/images/homepage.png', // TODO: update this once we are live
  twitterHandle: '@app_quran',
  twitterCardType: 'summary_large_image',
  facebookApp: '342185219529773',
  facebookPage: '603289706669016',
  appleAppName: 'Quran - by Quran.com - قرآن',
  appleAppId: '1118663303',
  appleAppUrl: 'https://apps.apple.com/us/app/quran-by-quran-com-qran/id1118663303',
  androidAppName: 'Quran for Android',
  androidPackage: 'com.quran.labs.androidquran',
  androidAppUrl: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
};

type SeoConfigType = {
  path?: string;
  locale?: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
};

export interface SEOProps extends NextSeoProps {
  dangerouslySetAllPagesToNoFollow?: boolean;
  dangerouslySetAllPagesToNoIndex?: boolean;
}

export function createSEOConfig({
  title,
  description,
  canonicalUrl,
  path,
  locale,
}: SeoConfigType = {}): SEOProps {
  const seoTitle = title || '';
  const siteDescription = description || config.defaultDescription;

  return {
    title: seoTitle,
    description: siteDescription,
    titleTemplate: '%s - Quran.com',
    defaultTitle: config.siteName,
    dangerouslySetAllPagesToNoFollow: true, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoFollow // TODO: remove this once we are ready to index the site
    dangerouslySetAllPagesToNoIndex: true, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoIndex // TODO: remove this once we are ready to index the site
    canonical: canonicalUrl,
    languageAlternates: getLanguageAlternates(path), // @see https://developers.google.com/search/docs/advanced/crawling/localized-versions
    openGraph: {
      type: 'website',
      locale,
      url: canonicalUrl,
      title: seoTitle,
      description: siteDescription,
      images: [
        {
          url: config.websiteLogo,
          width: 640,
          height: 217,
          alt: config.siteName,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      site_name: config.siteName,
    },
    facebook: {
      appId: config.facebookApp,
    },
    twitter: {
      handle: config.twitterHandle,
      site: config.twitterHandle,
      cardType: config.twitterCardType,
    },
    additionalMetaTags: [
      {
        name: 'fb:pages',
        content: `app-id=${config.facebookPage}`,
      },
      {
        name: 'al:ios:url',
        content: config.appleAppUrl,
      },
      {
        name: 'al:ios:app_name',
        content: config.appleAppName,
      },
      {
        name: 'al:ios:app_store_id',
        content: config.appleAppId,
      },
      {
        name: 'al:android:url',
        content: config.androidAppUrl,
      },
      {
        name: 'al:android:app_name',
        content: config.androidAppName,
      },
      {
        name: 'al:android:package',
        content: config.androidPackage,
      },
      {
        name: 'apple-itunes-app',
        content: `app-id=${config.appleAppId}`,
      },
      {
        name: 'Charset',
        content: 'UTF-8',
      },
      {
        name: 'Distribution',
        content: 'Global', // indicates that your webpage is intended for everyone
      },
      {
        name: 'Rating',
        content: 'General', // lets the younger web-surfers know the content is appropriate
      },
      {
        name: 'theme-color',
        content: '#fff', // placeholder
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    ],
  };
}
