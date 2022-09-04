import React from 'react';

import styles from './LinkContainer.module.scss';

import Link from '@/dls/Link/Link';

type LinkContainerProps = {
  href?: string;
  isExternalLink?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const LinkContainer = ({ href, isExternalLink, children, onClick }: LinkContainerProps) => {
  if (!href) {
    return <>{children}</>;
  }
  return (
    <Link
      href={href}
      shouldPassHref
      shouldPrefetch={false}
      onClick={onClick}
      isNewTab={isExternalLink}
    >
      <div className={styles.anchor}>{children}</div>
    </Link>
  );
};

export default LinkContainer;
