import React from 'react';

import { NextSeo } from 'next-seo';

import { SEOProps } from 'src/utils/seo';
import { shortenString } from 'src/utils/string';

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
    ...(url && { canonical: url }),
    ...(description && { description: shortenString(description, 160) }),
  };
  return <NextSeo {...params} openGraph={openGraphParams} />;
};

export default NextSeoWrapper;
