import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import IconNorthEast from '../../../../public/icons/north_east.svg';
import styles from './NavigationDrawerItem.module.scss';

type NavigationDrawerItemProps = {
  title?: string;
  icon?: React.ReactNode;
  isExternalLink?: boolean;
  href?: string;
  isStale?: boolean;
};

const NavigationDrawerItem = ({
  title,
  icon,
  isExternalLink,
  href,
  isStale = false,
}: NavigationDrawerItemProps) => {
  return (
    <LinkContainer href={href} isExternalLink={isExternalLink}>
      <div className={classNames(styles.container, { [styles.containerStale]: isStale })}>
        <div className={styles.innerContainer}>
          <div>
            <IconContainer icon={icon} size={IconSize.Xsmall} color={IconColor.secondary} />
            <span className={styles.titleContainer}>{title}</span>
          </div>
          <div>
            {isExternalLink && (
              <IconContainer
                icon={<IconNorthEast />}
                size={IconSize.Xsmall}
                color={IconColor.secondary}
              />
            )}
          </div>
        </div>
      </div>
    </LinkContainer>
  );
};

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

export default NavigationDrawerItem;
