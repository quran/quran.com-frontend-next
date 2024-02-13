import React from 'react';

import classNames from 'classnames';

import styles from './IconContainer.module.scss';

import useDirection from '@/hooks/useDirection';

export enum IconColor {
  default = 'default',
  primary = 'primary',
  secondary = 'secondary',
}
export enum IconSize {
  Xsmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

type IconContainerProps = {
  icon: React.ReactNode;
  size?: IconSize;
  color?: IconColor;
  className?: string;
  shouldFlipOnRTL?: boolean;
  shouldForceSetColors?: boolean;
};
const IconContainer = ({
  icon,
  size = IconSize.Medium,
  color = IconColor.default,
  shouldFlipOnRTL = true,
  shouldForceSetColors = true,
  className,
}: IconContainerProps) => {
  const dir = useDirection();
  return (
    <span
      className={classNames(className, styles.container, {
        [styles.defaultColor]:
          (shouldForceSetColors && color === IconColor.default) || color === IconColor.primary,
        [styles.secondaryColor]: shouldForceSetColors && color === IconColor.secondary,
        [styles.xsmallIcon]: size === IconSize.Xsmall,
        [styles.smallIcon]: size === IconSize.Small,
        [styles.mediumIcon]: size === IconSize.Medium,
        [styles.largeIcon]: size === IconSize.Large,
      })}
      data-auto-flip-icon={shouldFlipOnRTL}
      dir={dir}
    >
      {icon}
    </span>
  );
};

export default IconContainer;
