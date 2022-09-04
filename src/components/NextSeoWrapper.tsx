import React from 'react';

import { NextSeo } from 'next-seo';

import { SEOProps } from '@/utils/seo';
import { truncateString } from '@/utils/string';

interface Props extends SEOProps {
  url?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const NextSeoWrapper: React.FC<Props> = (props) => {
  const { url, image, imageAlt, imageHeight, imageWidth, openGraph, description, ...rest } = props;
  const openGraphParams = {
    ...(openGraph && { openGraph }),
    ...(url && { url }),
    ...(image && {
      images: [{ url: image, width: imageWidth, height: imageHeight, alt: imageAlt }],
    }),
  };
  const params = {
    ...rest,
    ...(description && { description: truncateString(description, 150) }),
  };
  return <NextSeo {...params} openGraph={openGraphParams} />;
};

export default NextSeoWrapper;
