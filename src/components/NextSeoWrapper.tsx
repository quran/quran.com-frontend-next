import React from 'react';

import { NextSeo } from 'next-seo';

interface Props {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const NextSeoWrapper: React.FC<Props> = (props) => {
  const { url, image, imageAlt, imageHeight, imageWidth, ...rest } = props;
  const openGraph = {
    ...rest,
    ...(url && { url }),
    ...(image && {
      images: [{ url: image, width: imageWidth, height: imageHeight, alt: imageAlt }],
    }),
  };
  const params = {
    ...rest,
    ...(url && { canonical: url }),
  };
  return <NextSeo {...params} openGraph={openGraph} />;
};

export default NextSeoWrapper;
