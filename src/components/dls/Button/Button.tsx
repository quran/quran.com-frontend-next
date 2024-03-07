/* eslint-disable max-lines */
import React, { MouseEventHandler, ButtonHTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './Button.module.scss';

import Wrapper from '@/components/Wrapper/Wrapper';
import Link from '@/dls/Link/Link';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Tooltip, { ContentSide } from '@/dls/Tooltip';
import useDirection from '@/hooks/useDirection';

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
  Inverse = 'inverse',
}

export enum ButtonVariant {
  Shadow = 'shadow',
  Ghost = 'ghost',
  Compact = 'compact',
  Outlined = 'outlined',
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
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  children?: React.ReactNode;
  id?: string;
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
  htmlType,
  ...props
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
    [styles.inverse]: type === ButtonType.Inverse,

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
    [styles.outlined]: variant === ButtonVariant.Outlined,

    [styles.disabled]: disabled || isLoading,
    [styles.noSidePadding]: !hasSidePadding,
  });

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (isLoading) prefixFinal = <Spinner size={size.toString() as SpinnerSize} />;
  else prefixFinal = prefix;

  let content;

  if (href && !disabled) {
    content = (
      <Link
        href={href}
        isNewTab={newTab}
        shouldPrefetch={prefetch}
        isShallow={shallowRouting}
        {...(onClick && { onClick })}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...(ariaLabel && { ariaLabel })}
      >
        <div dir={direction} className={classes} data-auto-flip-icon={shouldFlipOnRTL} {...props}>
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
  } else {
    content = (
      <button
        // eslint-disable-next-line react/button-has-type
        type={htmlType}
        dir={direction}
        className={classes}
        disabled={disabled}
        onClick={onClick}
        data-auto-flip-icon={shouldFlipOnRTL}
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {...(ariaLabel && { 'aria-label': ariaLabel })}
        {...props}
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
    );
  }

  return (
    <Wrapper
      shouldWrap={!!tooltip}
      wrapper={(tooltipChildren) => (
        <Tooltip text={tooltip} contentSide={tooltipContentSide}>
          {tooltipChildren}
        </Tooltip>
      )}
    >
      {content}
    </Wrapper>
  );
};

export default Button;
