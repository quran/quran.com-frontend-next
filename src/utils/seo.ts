import { NextSeoProps } from 'next-seo';
import logo from '../../public/logo.png';
import { theme } from './styles';

export const config = {
  siteName: "Al-Qur'an al-Kareem - القرآن الكريم",
  siteDescription: 'The Quran translated into many languages in a simple and easy interface',
  defaultPageTitle: 'Quran.com',
  baseUrl: 'twitter.com',
  websiteLogo: logo,
  twitterHandle: '@twitter',
  twitterCardType: 'twitter',
};

type SeoConfigType = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
};

export function createSEOConfig({
  title,
  description,
  canonicalUrl,
}: SeoConfigType = {}): NextSeoProps {
  const seoTitle = title || config.defaultPageTitle;
  const setDescription = description ?? config.siteDescription;

  return {
    title: seoTitle,
    description: setDescription,
    titleTemplate: '%s - Quran.com',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title: seoTitle,
      description: setDescription,
      images: [
        {
          url: config.websiteLogo,
          width: 280,
          height: 280,
          alt: config.siteName,
        },
      ],
      // eslint-disable-next-line  @typescript-eslint/camelcase
      site_name: config.siteName,
    },
    twitter: {
      handle: config.twitterHandle,
      site: config.twitterHandle,
      cardType: config.twitterCardType,
    },
    additionalMetaTags: [
      {
        name: 'Charset',
        content: 'UTF-8',
      },
      {
        name: 'Distribution',
        content: 'Global',
      },
      {
        name: 'Rating',
        content: 'General',
      },
      {
        name: 'theme-color',
        content: theme.colors.primary,
      },
    ],
  }; // defaultImageHeight: 500, // defaultImageWidth: 500,
}
