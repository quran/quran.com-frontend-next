/* eslint-disable max-lines */
import React, { MouseEventHandler } from 'react';

import classNames from 'classnames';

import styles from './Button.module.scss';

import Link from 'src/components/dls/Link/Link';
import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import Tooltip, { ContentSide } from 'src/components/dls/Tooltip';
import Wrapper from 'src/components/Wrapper/Wrapper';
import useDirection from 'src/hooks/useDirection';

export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
  Pill = 'pill',
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

export enum ButtonVariant {
  Shadow = 'shadow',
  Ghost = 'ghost',
  Compact = 'compact',
}

export type ButtonProps = {
  size?: ButtonSize;
  shape?: ButtonShape;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  type?: ButtonType;
  variant?: ButtonVariant;
  isLoading?: boolean;
  href?: string;
  isDisabled?: boolean;
  onClick?: MouseEventHandler;
  tooltip?: string | React.ReactNode;
  tooltipContentSide?: ContentSide;
  className?: string;
  hasSidePadding?: boolean;
  shouldFlipOnRTL?: boolean;
  shouldShallowRoute?: boolean;
  shouldPrefetch?: boolean;
  isNewTab?: boolean;
  ariaLabel?: string;
};

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  isDisabled: disabled = false,
  isLoading,
  type = ButtonType.Primary,
  size = ButtonSize.Medium,
  shape,
  prefix,
  suffix,
  variant,
  tooltip,
  tooltipContentSide = ContentSide.BOTTOM,
  className,
  hasSidePadding = true,
  shouldFlipOnRTL = true,
  shouldShallowRoute: shallowRouting = false,
  shouldPrefetch: prefetch = true,
  isNewTab: newTab,
  ariaLabel,
}) => {
  const direction = useDirection();
  const classes = classNames(styles.base, className, {
    [styles.withText]: typeof children === 'string',
    [styles.withIcon]: typeof children !== 'string',
    // type
    [styles.primary]: type === ButtonType.Primary,
    [styles.secondary]: type === ButtonType.Secondary,
    [styles.success]: type === ButtonType.Success,
    [styles.warning]: type === ButtonType.Warning,
    [styles.error]: type === ButtonType.Error,

    // size
    [styles.large]: size === ButtonSize.Large,
    [styles.normal]: size === ButtonSize.Medium,
    [styles.small]: size === ButtonSize.Small,

    // shape
    [styles.square]: shape === ButtonShape.Square,
    [styles.circle]: shape === ButtonShape.Circle,
    [styles.pill]: shape === ButtonShape.Pill,

    // variant
    [styles.shadow]: variant === ButtonVariant.Shadow,
    [styles.ghost]: variant === ButtonVariant.Ghost,
    [styles.compact]: variant === ButtonVariant.Compact,

    [styles.disabled]: disabled || isLoading,
    [styles.noSidePadding]: !hasSidePadding,
  });

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (isLoading) prefixFinal = <Spinner size={size.toString() as SpinnerSize} />;
  else prefixFinal = prefix;

  if (href && !disabled)
    return (
      <Link
        href={href}
        isNewTab={newTab}
        shouldPrefetch={prefetch}
        isShallow={shallowRouting}
        {...(onClick && { onClick })}
      >
        <div dir={direction} className={classes} data-auto-flip-icon={shouldFlipOnRTL}>
          {prefixFinal && (
            <span dir={direction} className={styles.prefix} data-auto-flip-icon={shouldFlipOnRTL}>
              {prefixFinal}
            </span>
          )}
          <span className={styles.content}>{children}</span>
          {suffix && (
            <span dir={direction} className={styles.suffix} data-auto-flip-icon={shouldFlipOnRTL}>
              {suffix}
            </span>
          )}
        </div>
      </Link>
    );

  return (
    <Wrapper
      shouldWrap={!!tooltip}
      wrapper={(tooltipChildren) => (
        <Tooltip text={tooltip} contentSide={tooltipContentSide}>
          {tooltipChildren}
        </Tooltip>
      )}
    >
      <button
        type="button"
        dir={direction}
        className={classes}
        disabled={disabled}
        onClick={onClick}
        data-auto-flip-icon={shouldFlipOnRTL}
        {...(ariaLabel && { 'aria-label': ariaLabel })}
      >
        {prefixFinal && (
          <span dir={direction} className={styles.prefix} data-auto-flip-icon={shouldFlipOnRTL}>
            {prefixFinal}
          </span>
        )}
        <span className={styles.content}>{children}</span>
        {suffix && (
          <span dir={direction} className={styles.suffix} data-auto-flip-icon={shouldFlipOnRTL}>
            {suffix}
          </span>
        )}
      </button>
    </Wrapper>
  );
};

export default Button;
