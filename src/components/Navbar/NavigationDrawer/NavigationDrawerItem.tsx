import React from 'react';

import classNames from 'classnames';

import LinkContainer from './LinkContainer';
import styles from './NavigationDrawerItem.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import IconNorthEast from '@/icons/north_east.svg';

type NavigationDrawerItemProps = {
  shouldKeepStyleWithoutHrefOnHover?: boolean;
  title?: string;
  icon?: React.ReactNode;
  isExternalLink?: boolean;
  href?: string;
  isStale?: boolean;
  titleClassName?: string;
  onClick?: () => void;
  isEvent?: boolean;
};

const NavigationDrawerItem = ({
  shouldKeepStyleWithoutHrefOnHover = false,
  title,
  icon,
  isExternalLink,
  href,
  titleClassName,
  isStale = false,
  onClick,
  isEvent = false,
}: NavigationDrawerItemProps) => (
  <LinkContainer
    shouldKeepStyleWithoutHrefOnHover={shouldKeepStyleWithoutHrefOnHover}
    href={href}
    isExternalLink={isExternalLink}
    onClick={onClick}
  >
    <div
      className={classNames(styles.container, {
        [styles.containerStale]: isStale,
        [styles.containerEvent]: isEvent,
      })}
    >
      <div className={styles.innerContainer}>
        <div className={styles.itemContainer}>
          <IconContainer
            shouldForceSetColors={!isEvent}
            icon={icon}
            size={IconSize.Xsmall}
            color={IconColor.accent}
            className={classNames({
              [styles.containerEventIcon]: isEvent,
            })}
          />
          <span className={classNames(styles.titleContainer, titleClassName)}>{title}</span>
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
