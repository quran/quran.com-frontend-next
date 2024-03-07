import React from 'react';

import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  href: string;
  text: string;
};

const InlineLink: React.FC<Props> = ({ href, text }) => {
  const onLinkClicked = () => {
    logButtonClick('ramadan_activities_link', { href });
  };
  return (
    <>
      {' '}
      <Link onClick={onLinkClicked} isNewTab href={href}>
        {text}
      </Link>{' '}
    </>
  );
};

export default InlineLink;
