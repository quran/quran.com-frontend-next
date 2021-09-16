import classNames from 'classnames';
import React from 'react';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import IconNorthEast from '../../../../public/icons/north_east.svg';
import LinkContainer from './LinkContainer';
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
}: NavigationDrawerItemProps) => (
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

export default NavigationDrawerItem;
