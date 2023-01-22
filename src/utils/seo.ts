/* eslint-disable react-func/max-lines-per-function */
import { NextSeoProps } from 'next-seo';

import { getOpenGraphLocale } from './locale';

import { getDefaultOgImageUrl } from '@/lib/og';
import { VersesResponse } from 'types/ApiResponses';

export const config = {
  siteName: 'Quran.com',
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

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export function createSEOConfig({
  title,
  description,
  canonicalUrl,
  locale,
}: SeoConfigType = {}): SEOProps {
  const seoTitle = title || '';

  return {
    title: seoTitle,
    description,
    titleTemplate: '%s - Quran.com',
    defaultTitle: config.siteName,
    dangerouslySetAllPagesToNoFollow: !isProduction, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoFollow
    dangerouslySetAllPagesToNoIndex: !isProduction, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoIndex
    canonical: canonicalUrl,
    openGraph: {
      type: 'website',
      locale: getOpenGraphLocale(locale),
      url: canonicalUrl,
      title: seoTitle,
      description,
      images: [
        {
          url: getDefaultOgImageUrl({ locale }),
          width: 1200,
          height: 630,
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
        property: 'fb:pages',
        content: config.facebookPage,
      },
      // {
      //   name: 'al:ios:url',
      //   content: config.appleAppUrl,
      // },
      // {
      //   name: 'al:ios:app_name',
      //   content: config.appleAppName,
      // },
      // {
      //   name: 'al:ios:app_store_id',
      //   content: config.appleAppId,
      // },
      // {
      //   name: 'al:android:url',
      //   content: config.androidAppUrl,
      // },
      // {
      //   name: 'al:android:app_name',
      //   content: config.androidAppName,
      // },
      // {
      //   name: 'al:android:package',
      //   content: config.androidPackage,
      // },
      // {
      //   name: 'apple-itunes-app',
      //   content: `app-id=${config.appleAppId}`,
      // },
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
      // ...getOpenGraphAlternateLocales(locale),
    ],
  };
}

/**
 * Concatenate the first 4 verses of the Page/Juz.
 *
 * @param {VersesResponse} response
 * @returns {string}
 */
export const getPageOrJuzMetaDescription = (response: VersesResponse): string => {
  return response.verses
    .slice(0, 4)
    .map((verse) => verse.textImlaeiSimple)
    .join(' - ');
};
