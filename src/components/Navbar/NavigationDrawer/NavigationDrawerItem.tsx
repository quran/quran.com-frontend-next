import React from 'react';

import classNames from 'classnames';

import LinkContainer from './LinkContainer';
import styles from './NavigationDrawerItem.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import IconNorthEast from '@/icons/north_east.svg';

type NavigationDrawerItemProps = {
  title?: string;
  icon?: React.ReactNode;
  isExternalLink?: boolean;
  href?: string;
  isStale?: boolean;
  onClick?: () => void;
};

const NavigationDrawerItem = ({
  title,
  icon,
  isExternalLink,
  href,
  isStale = false,
  onClick,
}: NavigationDrawerItemProps) => (
  <LinkContainer href={href} isExternalLink={isExternalLink} onClick={onClick}>
    <div className={classNames(styles.container, { [styles.containerStale]: isStale })}>
      <div className={styles.innerContainer}>
        <div className={styles.itemContainer}>
          <IconContainer
            icon={icon}
            size={IconSize.Xsmall}
            color={IconColor.secondary}
            shouldFlipOnRTL={false}
          />
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

export default NavigationDrawerItem;
