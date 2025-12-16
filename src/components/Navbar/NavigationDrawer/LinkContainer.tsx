import React from 'react';

import styles from './LinkContainer.module.scss';

import Link from '@/dls/Link/Link';

type LinkContainerProps = {
  shouldKeepStyleWithoutHrefOnHover?: boolean;
  href?: string;
  isExternalLink?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

const LinkContainer = ({
  shouldKeepStyleWithoutHrefOnHover = false,
  href,
  isExternalLink,
  children,
  onClick,
}: LinkContainerProps) => {
  if (!href) {
    if (shouldKeepStyleWithoutHrefOnHover) {
      return <div className={styles.anchor}>{children}</div>;
    }
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
