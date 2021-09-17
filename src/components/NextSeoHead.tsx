import React from 'react';

import { NextSeo } from 'next-seo';

interface Props {
  title: string;
}

const NextSeoHead: React.FC<Props> = ({ title }) => (
  <NextSeo
    title={title}
    openGraph={{
      title,
    }}
  />
);

export default NextSeoHead;
