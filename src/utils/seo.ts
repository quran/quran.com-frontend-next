import { NextSeoProps } from 'next-seo';
import logo from '../../public/logo.png';

export const config = {
  siteName: 'Lobby',
  siteDescription: 'Connect with people over chat',
  defaultPageTitle: 'Lobby',
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
      site_name: config.siteName,
    },
    twitter: {
      handle: config.twitterHandle,
      site: config.twitterHandle,
      cardType: config.twitterCardType,
    },
  }; // defaultImageHeight: 500, // defaultImageWidth: 500,
}
