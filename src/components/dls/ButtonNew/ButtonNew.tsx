import classNames from 'classnames';
import Link from 'next/link';
import { MouseEventHandler } from 'react';
import styles from './ButtonNew.module.scss';

export enum ButtonSize {
  Small = 'small',
  Normal = 'normal',
  Large = 'Large',
}

export enum ButtonShape {
  Square = 'square',
  Circle = 'circle',
}

export enum ButtonAlign {
  Start = 'start',
  Grow = 'grow',
}

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Alert = 'alert',
}

export enum ButtonVariant {
  Shadow = 'shadow',
  Ghost = 'ghost',
}

type ButtonNewProps = {
  size?: ButtonSize;
  shape?: ButtonShape;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  align?: ButtonAlign;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
};

const Button: React.FC<ButtonNewProps> = ({
  href,
  onClick,
  children,
  disabled = false,
  align,
  loading,
  type = ButtonType.Primary,
  size = ButtonSize.Normal,
  shape = ButtonShape.Square,
  prefix,
  suffix,
  variant,
}) => {
  const classes = classNames(styles.base, {
    // type
    [styles.primary]: type === ButtonType.Primary,
    [styles.secondary]: type === ButtonType.Secondary,
    [styles.success]: type === ButtonType.Success,
    [styles.warning]: type === ButtonType.Warning,
    [styles.alert]: type === ButtonType.Alert,
    [styles.error]: type === ButtonType.Error,

    // size
    [styles.large]: size === ButtonSize.Large,
    [styles.normal]: size === ButtonSize.Normal,
    [styles.small]: size === ButtonSize.Small,

    // shape
    [styles.square]: shape === ButtonShape.Square,
    [styles.circle]: shape === ButtonShape.Circle,

    // variant
    [styles.shadow]: variant === ButtonVariant.Shadow,
    [styles.ghost]: variant === ButtonVariant.Ghost,

    [styles.disabled]: disabled,
  });

  // when loading, replace the content with loading icon
  let content;
  if (loading && !prefix) content = 'loading icon';
  else content = children;

  // when loading, replace the prefix icon with loading icon
  let prefixFinal;
  if (loading && prefix) prefixFinal = 'loading icon';
  else prefixFinal = prefix;

  if (href && !disabled)
    return (
      <Link href={href}>
        <a className={classes}>
          {prefixFinal}
          <span>{children}</span>
          {suffix}
        </a>
      </Link>
    );

  return (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      {prefixFinal && <span className={styles.prefix}>{prefixFinal}</span>}
      <span
        className={classNames({
          [styles.align]: align === ButtonAlign.Start,
          [styles.grow]: align === ButtonAlign.Grow,
        })}
      >
        {content}
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </button>
  );
};

export default Button;
