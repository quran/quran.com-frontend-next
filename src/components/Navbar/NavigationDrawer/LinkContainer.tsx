import React from 'react';

import styles from './LinkContainer.module.scss';

import Link from 'src/components/dls/Link/Link';

type LinkContainerProps = {
  href?: string;
  isExternalLink?: boolean;
  children: React.ReactNode;
};

const LinkContainer = ({ href, isExternalLink, children }: LinkContainerProps) => {
  if (!href) {
    return <>{children}</>;
  }
  if (isExternalLink) {
    return (
      <a className={styles.anchor} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} passHref prefetch={false}>
      <a className={styles.anchor}>{children}</a>
    </Link>
  );
};

export default LinkContainer;
