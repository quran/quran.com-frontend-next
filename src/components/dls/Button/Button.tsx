import classNames from 'classnames';
import Link from 'next/link';
import React, { MouseEventHandler } from 'react';
import styles from './Button.module.scss';
import Spinner, { SpinnerSize } from '../Spinner/Spinner';
import Tooltip from '../Tooltip/index';
import Wrapper from '../Wrapper/Wrapper';

export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
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
}

export type ButtonProps = {
  size?: ButtonSize;
  shape?: ButtonShape;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
  tooltip?: string;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  disabled = false,
  loading,
  type = ButtonType.Primary,
  size = ButtonSize.Medium,
  shape = ButtonShape.Square,
  prefix,
  suffix,
  variant,
  tooltip,
  className,
}) => {
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

    // variant
    [styles.shadow]: variant === ButtonVariant.Shadow,
    [styles.ghost]: variant === ButtonVariant.Ghost,

    [styles.disabled]: disabled || loading,
  });

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (loading) prefixFinal = <Spinner size={size.toString() as SpinnerSize} />;
  else prefixFinal = prefix;

  if (href && !disabled)
    return (
      <Link href={href}>
        <a className={classes}>
          {prefixFinal}
          <span className={styles.content}>{children}</span>
          {suffix}
        </a>
      </Link>
    );

  return (
    <Wrapper
      shouldWrap={!!tooltip}
      wrapper={(tooltipChildren) => <Tooltip text={tooltip}>{tooltipChildren}</Tooltip>}
    >
      <button type="button" className={classes} disabled={disabled} onClick={onClick}>
        {prefixFinal && <span className={styles.prefix}>{prefixFinal}</span>}
        <span className={styles.content}>{children}</span>
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </button>
    </Wrapper>
  );
};

export default Button;
