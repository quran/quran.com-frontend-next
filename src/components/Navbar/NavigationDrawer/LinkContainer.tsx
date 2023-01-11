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
      shouldPrefetch={false}
      onClick={onClick}
      isNewTab={isExternalLink}
      className={styles.anchor}
    >
      {children}
    </Link>
  );
};

export default LinkContainer;
