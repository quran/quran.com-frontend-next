import React from 'react';
import Link from 'next/link';
import styles from './LinkContainer.module.scss';

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
    <Link href={href} passHref>
      <a className={styles.anchor}>{children}</a>
    </Link>
  );
};

export default LinkContainer;
